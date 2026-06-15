"""
Preference Learning Engine.
Analyzes feedback history and wear history to generate deterministic preference weights.
"""

import uuid
from typing import Any, Dict, List, Set, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.models.outfit_feedback import OutfitFeedback
from app.models.outfit_recommendation import OutfitRecommendation
from app.models.clothing_item import ClothingItem
from app.services.style_dna_config import FORMAL_TYPES, CASUAL_TYPES


class PreferenceLearningService:
    async def learn_preferences(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Dict[str, int]]:
        """
        Generate preference weights based on feedback history and wear behavior.
        Ensures deduplication (only latest feedback state per outfit applies),
        except for 'wore_it' which is cumulative.
        """
        # Fetch all feedback history for the user, ordered by newest first
        # Eager load the outfit and its clothing items
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

        # Deduplication state
        processed_outfits: Set[uuid.UUID] = set()
        
        weights = {
            "colors": {},
            "categories": {},
            "formality": {"formal": 0, "casual": 0, "mixed": 0},
            "seasons": {}
        }

        for fb in feedbacks:
            # save_for_later / removed_from_saved do not affect preference weights
            if fb.feedback_type in ("save_for_later", "removed_from_saved"):
                continue

            # wore_it is cumulative, so we process it every time
            # For other feedback (like, love, dislike), we only process the most recent one
            if fb.feedback_type != "wore_it":
                if fb.outfit_id in processed_outfits:
                    continue
                processed_outfits.add(fb.outfit_id)

            # Determine scalar weight
            weight_val = 0
            if fb.feedback_type == "like":
                weight_val = 1
            elif fb.feedback_type == "love":
                weight_val = 2
            elif fb.feedback_type == "wore_it":
                weight_val = 2
            elif fb.feedback_type == "dislike":
                weight_val = -1

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

        # Post-processing: remove negative or zero weights to keep the dictionary clean
        # Dislikes reduce the weight, but we don't need to pass around negative preferences
        # unless specifically penalizing. In this reranking engine, we only boost positive alignments.
        for key in ["colors", "categories", "seasons"]:
            weights[key] = {k: v for k, v in weights[key].items() if v != 0}

        # Normalize formality so it doesn't go negative
        for f in weights["formality"]:
            if weights["formality"][f] < 0:
                weights["formality"][f] = 0

        return weights


preference_learning_service = PreferenceLearningService()
