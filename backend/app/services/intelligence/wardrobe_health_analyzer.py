import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.clothing_item import ClothingItem
from app.services.wear_tracking.wear_analytics_engine import wear_analytics_engine
from app.services.wear_tracking.repetition_detector import repetition_detector
from app.services.wear_tracking.cost_per_wear_engine import cost_per_wear_engine
from app.services.intelligence.health_score_explainer import health_score_explainer

class WardrobeHealthAnalyzer:
    """
    Wardrobe Health Score 2.0
    Cross-domain orchestrator synthesizing data from Wear Tracking, 
    Style Memory, Shopping Intelligence, and Predictive Stylist.
    """

    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        
        # 1. Check if empty
        query = select(ClothingItem.id).where(ClothingItem.user_id == user_id).limit(1)
        result = await session.execute(query)
        has_items = result.scalar() is not None
        
        if not has_items:
            return health_score_explainer._empty_explanation()

        # Orchestrate Data Pulling
        # Utilization (25%)
        analytics = await wear_analytics_engine.get_analytics(session, user_id)
        rep_insights = await repetition_detector.get_repetition_insights(session, user_id)
        
        utilization_health = min(100, 50 + (analytics.get("total_wears_logged", 0) * 2))
        if len(rep_insights) > 0:
            utilization_health = max(0, utilization_health - (len(rep_insights) * 5))
            
        # Coverage (20%) - Not implemented yet, returning 0
        coverage_health = 0 
        
        # Style Alignment (20%) - Not implemented yet, returning 0
        style_alignment = 0
        
        # Recommendation Effectiveness (15%) - Not implemented yet, returning 0
        recommendation_effectiveness = 0
        
        # Financial Efficiency (10%)
        cpw_metrics = await cost_per_wear_engine.get_cpw_metrics(session, user_id)
        all_metrics = cpw_metrics.get("all_metrics", [])
        if all_metrics:
            avg_cpw = sum(m["cpw"] for m in all_metrics) / len(all_metrics)
            financial_efficiency = max(0, min(100, 100 - (avg_cpw / 2))) # rough formula
        else:
            financial_efficiency = 0 # No data, return 0

        # Future Readiness (10%) - Not implemented yet, returning 0
        future_readiness = 0
        
        # Calculate Final Score (only weigh what has data)
        active_score = (utilization_health * 0.25) + (financial_efficiency * 0.10)
        active_weight = 0.25 + 0.10
        
        overall_score = active_score / active_weight if active_weight > 0 else 0
        
        scores = {
            "overall_score": round(overall_score),
            "utilization_health": round(utilization_health),
            "coverage_health": round(coverage_health),
            "style_alignment": round(style_alignment),
            "recommendation_effectiveness": round(recommendation_effectiveness),
            "financial_efficiency": round(financial_efficiency),
            "future_readiness": round(future_readiness)
        }
        
        explanation = health_score_explainer.generate_explanation(scores)
        
        return {
            **scores,
            "grade": explanation["grade"],
            "strongest_area": explanation["strongest_area"],
            "weakest_area": explanation["weakest_area"],
            "top_improvement": explanation["top_improvement"],
            "projected_score_gain": explanation["projected_score_gain"],
            "score_delta": 0, # Placeholder for historical diff
            "previous_score": round(overall_score) # Placeholder
        }

wardrobe_health_analyzer = WardrobeHealthAnalyzer()
