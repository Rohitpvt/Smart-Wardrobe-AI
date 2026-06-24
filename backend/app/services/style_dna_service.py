"""
Personal Style DNA Service.
Analyzes wardrobe composition to infer the user's personal style profile.
Uses the externalized classification matrix from style_dna_config.py.
"""

import uuid
from typing import Any, Dict, List

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clothing_item import ClothingItem
from app.models.user_feedback_affinity import UserFeedbackAffinity
from app.services.style_dna_config import (
    NEUTRAL_COLORS,
    VIBRANT_COLORS,
    EARTH_COLORS,
    FORMAL_TYPES,
    CASUAL_TYPES,
    STYLE_MATRIX,
    DEFAULT_STYLE,
)


class StyleDNAService:
    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """Analyze wardrobe to produce a Style DNA profile."""
        from app.models.user import User
        user_stmt = select(User).where(User.id == user_id)
        user_res = await session.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        
        stmt = select(ClothingItem).where(ClothingItem.user_id == user_id)
        result = await session.execute(stmt)
        items = result.scalars().all()

        if not items:
            return self._empty_profile(user)

        # ── Dominant colors ──
        color_counts: Dict[str, int] = {}
        for item in items:
            c = item.color.lower().strip()
            color_counts[c] = color_counts.get(c, 0) + 1
        sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
        dominant_colors = [{"name": c, "count": cnt} for c, cnt in sorted_colors[:5]]

        # ── Color profile classification ──
        neutral_count = sum(cnt for c, cnt in color_counts.items() if c in NEUTRAL_COLORS)
        vibrant_count = sum(cnt for c, cnt in color_counts.items() if c in VIBRANT_COLORS)
        earth_count = sum(cnt for c, cnt in color_counts.items() if c in EARTH_COLORS)
        dark_count = sum(
            cnt for c, cnt in color_counts.items()
            if c in {"black", "charcoal", "navy", "dark grey", "dark gray"}
        )
        total = len(items)

        if dark_count / total > 0.5:
            color_profile = "dark"
        elif earth_count / total > 0.4:
            color_profile = "earth"
        elif vibrant_count / total > 0.3:
            color_profile = "vibrant"
        elif neutral_count / total > 0.4:
            color_profile = "neutral"
        else:
            color_profile = "neutral"  # safe default

        # ── Preferred categories ──
        cat_counts: Dict[str, int] = {}
        for item in items:
            cat = item.category.lower().strip()
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
        sorted_cats = sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
        preferred_categories = [{"name": c, "count": cnt} for c, cnt in sorted_cats[:3]]

        # ── Formality profile ──
        formal_count = 0
        casual_count = 0
        for item in items:
            t = item.clothing_type.lower().strip()
            if t in FORMAL_TYPES:
                formal_count += 1
            elif t in CASUAL_TYPES:
                casual_count += 1

        if formal_count > casual_count * 1.5:
            formality = "formal"
        elif casual_count > formal_count * 1.5:
            formality = "casual"
        else:
            formality = "mixed"

        # ── Seasonal preference ──
        season_counts: Dict[str, int] = {}
        for item in items:
            if item.season:
                s = item.season.lower().strip()
                season_counts[s] = season_counts.get(s, 0) + 1
        seasonal_preference = max(season_counts, key=season_counts.get) if season_counts else "all_season"

        # ── Brand affinity ──
        brand_counts: Dict[str, int] = {}
        for item in items:
            if item.brand:
                b = item.brand.strip()
                brand_counts[b] = brand_counts.get(b, 0) + 1
        top_brand = max(brand_counts, key=brand_counts.get) if brand_counts else None

        # ── Style classification via externalized matrix ──
        profile_key = (color_profile, formality)
        style = STYLE_MATRIX.get(profile_key, DEFAULT_STYLE)

        # ── Confidence based on data depth ──
        confidence = self._calculate_confidence(items, color_counts, cat_counts)

        # ── Fetch Feedback Affinities ──
        aff_stmt = select(UserFeedbackAffinity).where(UserFeedbackAffinity.user_id == user_id)
        aff_res = await session.execute(aff_stmt)
        affinities = aff_res.scalars().all()
        
        liked_styles = [a.value for a in affinities if a.dimension == 'style' and a.score > 0]
        disliked_styles = [a.value for a in affinities if a.dimension == 'style' and a.score < 0]
        liked_colors = [a.value for a in affinities if a.dimension == 'color' and a.score > 0]
        disliked_colors = [a.value for a in affinities if a.dimension == 'color' and a.score < 0]
        favorite_occasions = [a.value for a in affinities if a.dimension == 'occasion' and a.score > 0]
        avoided_occasions = [a.value for a in affinities if a.dimension == 'occasion' and a.score < 0]
        
        feedback_insights = {
            "liked_styles": sorted(liked_styles, key=lambda x: next((a.score for a in affinities if a.value == x and a.dimension == 'style'), 0), reverse=True),
            "disliked_styles": sorted(disliked_styles, key=lambda x: next((a.score for a in affinities if a.value == x and a.dimension == 'style'), 0)),
            "liked_colors": sorted(liked_colors, key=lambda x: next((a.score for a in affinities if a.value == x and a.dimension == 'color'), 0), reverse=True),
            "disliked_colors": sorted(disliked_colors, key=lambda x: next((a.score for a in affinities if a.value == x and a.dimension == 'color'), 0)),
            "favorite_occasions": sorted(favorite_occasions, key=lambda x: next((a.score for a in affinities if a.value == x and a.dimension == 'occasion'), 0), reverse=True),
            "avoided_occasions": sorted(avoided_occasions, key=lambda x: next((a.score for a in affinities if a.value == x and a.dimension == 'occasion'), 0))
        }

        return {
            "style_type": style.style_type,
            "confidence": confidence,
            "traits": list(style.traits),
            "dominant_colors": dominant_colors,
            "preferred_categories": preferred_categories,
            "formality": formality,
            "seasonal_preference": seasonal_preference,
            "top_brand": top_brand,
            "profile_hints": {
                "age": user.age if user else None,
                "gender": user.gender if user else None,
                "primary_style": user.primary_style if user else None,
                "fashion_experience": user.fashion_experience if user else None
            },
            "feedback_insights": feedback_insights
        }

    def _calculate_confidence(
        self,
        items: list,
        color_counts: Dict[str, int],
        cat_counts: Dict[str, int],
    ) -> int:
        """
        Confidence reflects how much data we have to make a reliable classification.
        More items + more diversity data = higher confidence.
        """
        score = 50  # baseline

        # Item count contribution (up to +25)
        item_count = len(items)
        if item_count >= 20:
            score += 25
        elif item_count >= 10:
            score += 15
        elif item_count >= 5:
            score += 8

        # Color diversity contribution (up to +15)
        if len(color_counts) >= 5:
            score += 15
        elif len(color_counts) >= 3:
            score += 8

        # Category diversity contribution (up to +10)
        if len(cat_counts) >= 4:
            score += 10
        elif len(cat_counts) >= 2:
            score += 5

        return min(100, score)

    def _empty_profile(self, user) -> Dict[str, Any]:
        return {
            "style_type": user.primary_style if user and user.primary_style else "Undetermined",
            "confidence": 0,
            "traits": ["Not enough data to determine style"],
            "dominant_colors": [],
            "preferred_categories": [],
            "formality": "unknown",
            "seasonal_preference": "unknown",
            "top_brand": None,
            "profile_hints": {
                "age": user.age if user else None,
                "gender": user.gender if user else None,
                "primary_style": user.primary_style if user else None,
                "fashion_experience": user.fashion_experience if user else None
            },
            "feedback_insights": {
                "liked_styles": [],
                "disliked_styles": [],
                "liked_colors": [],
                "disliked_colors": [],
                "favorite_occasions": [],
                "avoided_occasions": []
            }
        }


style_dna_service = StyleDNAService()
