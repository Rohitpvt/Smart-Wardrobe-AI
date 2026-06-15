"""
Recommendation Reranker.
Adjusts outfit scores based on learned preference weights.
"""

from typing import Any, Dict, List
from app.services.style_dna_config import FORMAL_TYPES, CASUAL_TYPES


class RecommendationReranker:
    def rerank_outfits(
        self, 
        outfits: List[Dict[str, Any]], 
        preferences: Dict[str, Dict[str, int]]
    ) -> List[Dict[str, Any]]:
        """
        Reranks outfits by combining the objective overall_score with a 
        preference_alignment_score derived from learned user weights.
        """
        if not outfits:
            return outfits

        # Extract weight maps
        color_w = preferences.get("colors", {})
        cat_w = preferences.get("categories", {})
        season_w = preferences.get("seasons", {})
        formality_w = preferences.get("formality", {"formal": 0, "casual": 0, "mixed": 0})

        # Calculate max possible weight score for normalization
        max_possible_alignment = 0
        if color_w: max_possible_alignment += max(color_w.values()) * 3
        if cat_w: max_possible_alignment += max(cat_w.values()) * 3
        if season_w: max_possible_alignment += max(season_w.values()) * 3
        max_possible_alignment += max(formality_w.values()) * 3

        # Default scaling
        scale_factor = 100 / max_possible_alignment if max_possible_alignment > 0 else 0

        for outfit in outfits:
            items = []
            if outfit.get("top_item"): items.append(outfit["top_item"])
            if outfit.get("bottom_item"): items.append(outfit["bottom_item"])
            if outfit.get("footwear_item"): items.append(outfit["footwear_item"])

            alignment_points = 0

            for item in items:
                # Color match
                if item.color:
                    c = item.color.lower().strip()
                    alignment_points += color_w.get(c, 0)
                
                # Category match
                if item.category:
                    cat = item.category.lower().strip()
                    alignment_points += cat_w.get(cat, 0)
                
                # Season match
                if item.season:
                    s = item.season.lower().strip()
                    alignment_points += season_w.get(s, 0)

                # Formality match
                if item.clothing_type:
                    ctype = item.clothing_type.lower().strip()
                    if ctype in FORMAL_TYPES:
                        alignment_points += formality_w.get("formal", 0)
                    elif ctype in CASUAL_TYPES:
                        alignment_points += formality_w.get("casual", 0)
                    else:
                        alignment_points += formality_w.get("mixed", 0)

            # Normalize to 0-100
            preference_alignment = int(alignment_points * scale_factor)
            preference_alignment = max(0, min(100, preference_alignment))

            # Fetch the original objective score (fallback to 70 if missing)
            scores = outfit.get("scores", {})
            overall_score = scores.get("overall_score")
            if overall_score is None:
                overall_score = 70

            # ── Weight Cap ──
            # Personalization should not overpower objective outfit quality.
            # Final Score = (Overall Score * 0.8) + (Preference Alignment * 0.2)
            personalized_score = int((overall_score * 0.8) + (preference_alignment * 0.2))

            # Attach scores directly to the outfit dict structure
            scores["overall_score"] = overall_score
            scores["preference_alignment_score"] = preference_alignment
            scores["personalized_score"] = personalized_score
            outfit["scores"] = scores

        # Sort descending by the new personalized score
        outfits.sort(key=lambda x: x["scores"].get("personalized_score", 0), reverse=True)
        return outfits


recommendation_reranker = RecommendationReranker()
