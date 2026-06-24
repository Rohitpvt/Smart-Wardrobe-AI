import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload

from app.models.outfit_feedback import OutfitFeedback
from app.models.outfit_recommendation import OutfitRecommendation
from app.models.user_feedback_affinity import UserFeedbackAffinity

RATING_WEIGHTS = {
    "LOVE": 3,
    "LIKE": 2,
    "NEUTRAL": 0,
    "DISLIKE": -3
}

class RecommendationFeedbackService:
    async def record_feedback(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        recommendation_id: uuid.UUID,
        rating: str,
    ) -> OutfitFeedback:
        """
        Record user feedback on an outfit and update cumulative affinities.
        """
        # Fetch recommendation to analyze properties
        stmt = select(OutfitRecommendation).options(
            selectinload(OutfitRecommendation.top_item),
            selectinload(OutfitRecommendation.bottom_item),
            selectinload(OutfitRecommendation.footwear_item)
        ).where(
            OutfitRecommendation.id == recommendation_id,
            OutfitRecommendation.user_id == user_id
        )
        result = await session.execute(stmt)
        rec = result.scalar_one_or_none()
        
        if not rec:
            raise ValueError("Recommendation not found")

        weight = RATING_WEIGHTS.get(rating.upper(), 0)

        # 1. Check for existing feedback
        stmt_fb = select(OutfitFeedback).where(
            OutfitFeedback.user_id == user_id,
            OutfitFeedback.recommendation_id == recommendation_id
        )
        res_fb = await session.execute(stmt_fb)
        existing_feedback = res_fb.scalar_one_or_none()

        if existing_feedback:
            # If it already exists, just return it (or we could update it, but requirements say no duplicates)
            return existing_feedback

        # 2. Store the new feedback
        new_feedback = OutfitFeedback(
            user_id=user_id,
            recommendation_id=recommendation_id,
            rating=rating.upper(),
            feedback_weight=weight,
            outfit_id=recommendation_id,  # backward compatibility
            feedback_type=rating.lower() if rating else "neutral" # backward compatibility
        )
        session.add(new_feedback)

        # 2. Update affinities if weight != 0
        if weight != 0:
            items = [item for item in [rec.top_item, rec.bottom_item, rec.footwear_item] if item]
            
            # Extract dimensions
            occasions = [rec.occasion]
            colors = []
            categories = []
            styles = []
            seasons = []
            
            for item in items:
                if item.color:
                    colors.append(item.color)
                if item.category:
                    categories.append(item.category)
                if hasattr(item, 'style') and item.style:
                    styles.append(item.style)
                if hasattr(item, 'season') and item.season:
                    seasons.append(item.season)
                    
            # We use a set to not double-count if an outfit has two "Black" items.
            # Or we can double-count, but the prompt says analyze composition patterns.
            # Let's count uniquely per outfit so the affinity score is stable.
            dimensions = {
                "occasion": set(occasions),
                "color": set(colors),
                "category": set(categories),
                "style": set(styles),
                "season": set(seasons)
            }
            
            for dim_name, dim_values in dimensions.items():
                for val in dim_values:
                    if not val:
                        continue
                    # Upsert affinity
                    stmt_aff = select(UserFeedbackAffinity).where(
                        UserFeedbackAffinity.user_id == user_id,
                        UserFeedbackAffinity.dimension == dim_name,
                        UserFeedbackAffinity.value == val
                    )
                    aff_res = await session.execute(stmt_aff)
                    affinity = aff_res.scalar_one_or_none()
                    
                    if affinity:
                        affinity.score += weight
                    else:
                        affinity = UserFeedbackAffinity(
                            user_id=user_id,
                            dimension=dim_name,
                            value=val,
                            score=weight
                        )
                        session.add(affinity)
                        
        await session.commit()
        await session.refresh(new_feedback)
        return new_feedback

    async def get_feedback_insights(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Generate insights for the intelligence dashboard.
        """
        # Fetch all affinities
        stmt = select(UserFeedbackAffinity).where(UserFeedbackAffinity.user_id == user_id)
        result = await session.execute(stmt)
        affinities = result.scalars().all()
        
        # Calculate stats
        favorite_styles = sorted([a for a in affinities if a.dimension == 'style'], key=lambda x: x.score, reverse=True)
        favorite_colors = sorted([a for a in affinities if a.dimension == 'color'], key=lambda x: x.score, reverse=True)
        favorite_occasions = sorted([a for a in affinities if a.dimension == 'occasion'], key=lambda x: x.score, reverse=True)
        
        # Fetch feedback totals
        stmt_fb = select(OutfitFeedback).where(OutfitFeedback.user_id == user_id)
        res_fb = await session.execute(stmt_fb)
        feedbacks = res_fb.scalars().all()
        
        total_ratings = len(feedbacks)
        positive_ratings = len([f for f in feedbacks if f.rating in ["LOVE", "LIKE"]])
        positive_ratio = (positive_ratings / total_ratings) if total_ratings > 0 else 0.0
        
        # Calculate trend (e.g. recent 5 vs previous)
        trend = "Stable"
        if len(feedbacks) >= 5:
            recent_5 = feedbacks[:5]
            recent_pos = len([f for f in recent_5 if f.rating in ["LOVE", "LIKE"]])
            if recent_pos >= 4:
                trend = "Improving"
            elif recent_pos <= 1:
                trend = "Declining"
                
        return {
            "favorite_styles": [a.value for a in favorite_styles[:3]],
            "least_preferred_styles": [a.value for a in favorite_styles[-3:] if a.score < 0],
            "favorite_colors": [a.value for a in favorite_colors[:3]],
            "least_preferred_colors": [a.value for a in favorite_colors[-3:] if a.score < 0],
            "favorite_occasions": [a.value for a in favorite_occasions[:3]],
            "feedback_trend": trend,
            "total_ratings": total_ratings,
            "positive_ratio": positive_ratio
        }

recommendation_feedback_service = RecommendationFeedbackService()
