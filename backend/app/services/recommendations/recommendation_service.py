import uuid
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clothing_item import ClothingItem
from app.models.outfit_recommendation import OutfitRecommendation
from app.services.intelligence import intelligence_service
from app.services.recommendations.engine import outfit_engine
from app.services.recommendations.completion_engine import outfit_completion_engine
from app.services.recommendations.recommendation_confidence_engine import recommendation_confidence_engine
from app.services.recommendations.recommendation_reasoning_engine import recommendation_reasoning_engine
from app.services.style_memory.style_memory_service import style_memory_service
from app.services.weather.provider import WeatherContext
from app.schemas.recommendation_explanation import (
    ExplainableRecommendationItem,
    RecommendationExplanation,
    RecommendationReasoning,
    RecommendationSignals,
    RecommendationTrace
)

class RecommendationService:
    """
    Orchestrates explainable recommendation generation.
    """

    async def generate_explainable_recommendations(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        occasion: str,
        weather: WeatherContext,
        generation_mode: str = "standard",
        anchor_item: Optional[ClothingItem] = None
    ) -> List[ExplainableRecommendationItem]:
        
        # 1. Fetch Intelligence Data once
        style_dna = await intelligence_service.get_style_dna(session, user_id)
        wardrobe_health = await intelligence_service.get_wardrobe_health(session, user_id)
        usage_patterns = await intelligence_service.get_usage_intelligence(session, user_id)
        seasonal_readiness = await intelligence_service.get_seasonal_readiness(session, user_id)
        outfit_success = await intelligence_service.predict_outfit_success(session, user_id)
        style_memory = await style_memory_service.get_style_memory_profile(session, user_id)

        # 2. Generate Recommendation Candidates
        if generation_mode == "anchor" and anchor_item:
            top, bottom, shoe, outerwear, _ = await outfit_completion_engine.build_around_anchor(
                session, user_id, anchor_item, occasion, weather
            )
        else:
            top, bottom, shoe = await outfit_engine.generate_outfit(
                session, user_id, occasion, weather
            )
            outerwear = None

        # Build basic payload dictionary (mimicking existing schema)
        recommendation_dict = {
            "top": {"id": str(top.id), "name": top.name, "image_url": top.image_url, "color": top.color},
            "bottom": {"id": str(bottom.id), "name": bottom.name, "image_url": bottom.image_url, "color": bottom.color},
            "shoes": {"id": str(shoe.id), "name": shoe.name, "image_url": shoe.image_url, "color": shoe.color},
        }
        if outerwear:
            recommendation_dict["outerwear"] = {"id": str(outerwear.id), "name": outerwear.name, "image_url": outerwear.image_url, "color": outerwear.color}

        # 3. Calculate Signals
        # Heuristic calculations for signals based on the recommended items and intelligence
        # Style Alignment
        rec_colors = {top.color, bottom.color, shoe.color}
        if outerwear:
            rec_colors.add(outerwear.color)
            
        color_affinities = set(style_dna.get("color_affinities", []))
        if color_affinities:
            overlap = rec_colors.intersection(color_affinities)
            style_alignment = int((len(overlap) / len(color_affinities)) * 100) if len(color_affinities) > 0 else 70
        else:
            style_alignment = 85 # Fallback if style dna is not well-established
            
        style_alignment = max(50, min(100, style_alignment))

        # Weather Alignment
        weather_alignment = 85
        if weather.weather_used and weather.temperature_celsius is not None:
            if weather.temperature_celsius < 15.0 and not outerwear:
                weather_alignment -= 25
            if weather.temperature_celsius > 25.0 and outerwear:
                weather_alignment -= 30

        # Rotation Benefit
        least_worn_ids = {i["id"] for i in usage_patterns.get("least_worn", [])}
        rec_ids = {str(top.id), str(bottom.id), str(shoe.id)}
        if outerwear:
            rec_ids.add(str(outerwear.id))
            
        rotation_benefit = 50
        overlap_neglected = rec_ids.intersection(least_worn_ids)
        if overlap_neglected:
            rotation_benefit += 30 * len(overlap_neglected)
        rotation_benefit = min(100, rotation_benefit)

        # Seasonal Alignment
        seasonal_alignment = seasonal_readiness.get("readiness_score", 80)
        
        # User Preference & Prediction
        preference_match = 70 # baseline
        fav_colors = set(style_memory.get("favorite_colors", []))
        disliked_colors = set(style_memory.get("disliked_colors", []))
        
        if fav_colors.intersection(rec_colors):
            preference_match += 15
        if disliked_colors.intersection(rec_colors):
            preference_match -= 25
            
        preference_match = min(100, max(0, preference_match))
        
        outfit_success_pred = outfit_success.get("success_probability", 75)

        # 4. Confidence Engine
        confidence_score, label = recommendation_confidence_engine.calculate_confidence(
            style_alignment=style_alignment,
            outfit_success_prediction=outfit_success_pred,
            preference_match=preference_match,
            weather_compatibility=weather_alignment,
            rotation_benefit=rotation_benefit
        )

        # 5. Reasoning Engine
        reasoning_dict = recommendation_reasoning_engine.generate_reasoning(
            style_dna=style_dna,
            usage_intelligence=usage_patterns,
            seasonal_readiness=seasonal_readiness,
            confidence_score=confidence_score,
            style_alignment=style_alignment,
            weather_compatibility=weather_alignment,
            rotation_benefit=rotation_benefit
        )

        reasoning = RecommendationReasoning(**reasoning_dict)
        signals = RecommendationSignals(
            style_alignment=style_alignment,
            weather_alignment=weather_alignment,
            rotation_benefit=rotation_benefit,
            seasonal_alignment=seasonal_alignment
        )

        explanation = RecommendationExplanation(
            confidence=confidence_score,
            success_probability=outfit_success_pred,
            reasoning=reasoning,
            signals=signals,
            improvement_suggestions=reasoning_dict.get("improvement_suggestions", [])
        )

        # 6. Persistence
        db_rec = OutfitRecommendation(
            user_id=user_id,
            top_item_id=top.id,
            bottom_item_id=bottom.id,
            footwear_item_id=shoe.id,
            occasion=occasion,
            ai_explanation=json.dumps(reasoning_dict),
            weather_snapshot=weather.model_dump() if weather.weather_used else None,
            overall_score=confidence_score,
            color_score=style_alignment,
            weather_score=weather_alignment,
            occasion_score=0,
            season_score=seasonal_alignment,
            utilization_score=rotation_benefit,
            score_metadata={"reasoning": reasoning_dict}
        )
        session.add(db_rec)
        await session.commit()
        await session.refresh(db_rec)

        explanation.outfit_id = str(db_rec.id)

        trace = RecommendationTrace(
            style_dna_used=True,
            usage_intelligence_used=True,
            seasonal_readiness_used=True,
            outfit_prediction_used=True
        )

        item = ExplainableRecommendationItem(
            recommendation=recommendation_dict,
            explanation=explanation,
            trace=trace
        )

        return [item]

recommendation_service = RecommendationService()
