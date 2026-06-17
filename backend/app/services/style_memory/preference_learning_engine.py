import uuid
from typing import Dict, List, Set, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.models.outfit_feedback import OutfitFeedback
from app.models.outfit_recommendation import OutfitRecommendation
from app.services.style_dna_config import FORMAL_TYPES, CASUAL_TYPES

class PreferenceLearningEngine:
    """
    Computes cumulative weighted preference scores from user feedback.
    Unlike Phase 8 which deduplicated feedback, Style Memory is completely cumulative
    to reflect shifting tastes over time.
    """
    
    # Weights for cumulative learning
    WEIGHT_LOVE = 5
    WEIGHT_WORE_IT = 4
    WEIGHT_LIKE = 3
    WEIGHT_SAVE = 2
    WEIGHT_SKIP = -1
    WEIGHT_DISLIKE = -4

    async def learn_preferences(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Dict[str, int]]:
        stmt = (
            select(OutfitFeedback)
            .where(OutfitFeedback.user_id == user_id)
            .options(
                selectinload(OutfitFeedback.outfit).selectinload(OutfitRecommendation.top_item),
                selectinload(OutfitFeedback.outfit).selectinload(OutfitRecommendation.bottom_item),
                selectinload(OutfitFeedback.outfit).selectinload(OutfitRecommendation.footwear_item),
            )
            .order_by(desc(OutfitFeedback.created_at))
        )
        result = await session.execute(stmt)
        feedbacks = result.scalars().all()

        weights = {
            "colors": {},
            "categories": {},
            "formality": {"formal": 0, "casual": 0, "mixed": 0},
            "seasons": {}
        }

        for fb in feedbacks:
            weight_val = 0
            if fb.feedback_type == "love":
                weight_val = self.WEIGHT_LOVE
            elif fb.feedback_type == "wore_it":
                weight_val = self.WEIGHT_WORE_IT
            elif fb.feedback_type == "like":
                weight_val = self.WEIGHT_LIKE
            elif fb.feedback_type == "save_for_later":
                weight_val = self.WEIGHT_SAVE
            elif fb.feedback_type == "skip":
                weight_val = self.WEIGHT_SKIP
            elif fb.feedback_type == "dislike":
                weight_val = self.WEIGHT_DISLIKE

            if weight_val == 0:
                continue

            outfit = fb.outfit
            if not outfit:
                continue

            items = []
            if outfit.top_item: items.append(outfit.top_item)
            if outfit.bottom_item: items.append(outfit.bottom_item)
            if outfit.footwear_item: items.append(outfit.footwear_item)

            for item in items:
                # Colors
                if item.color:
                    c = item.color.lower().strip()
                    weights["colors"][c] = weights["colors"].get(c, 0) + weight_val
                
                # Categories
                if item.category:
                    cat = item.category.lower().strip()
                    weights["categories"][cat] = weights["categories"].get(cat, 0) + weight_val

                # Formality
                if item.clothing_type:
                    ctype = item.clothing_type.lower().strip()
                    if ctype in FORMAL_TYPES:
                        weights["formality"]["formal"] += weight_val
                    elif ctype in CASUAL_TYPES:
                        weights["formality"]["casual"] += weight_val
                    else:
                        weights["formality"]["mixed"] += weight_val

                # Seasons
                if item.season:
                    s = item.season.lower().strip()
                    weights["seasons"][s] = weights["seasons"].get(s, 0) + weight_val

        return weights

preference_learning_engine = PreferenceLearningEngine()
