from typing import Dict, List

class PredictiveInsightPriorityEngine:
    """
    Orchestrates predictive insights, enforcing formatting rules and priority:
    1. Underutilized Value
    2. Neglected Items
    3. Wardrobe Gaps
    4. Rotation Risks
    5. Outfit Unlock Opportunities
    """
    
    def format_and_prioritize(
        self,
        underutilized: List[Dict],
        neglected: List[Dict],
        gaps: List[Dict],
        rotation_risks: List[Dict],
        unlocks: List[Dict]
    ) -> Dict:
        all_insights = []
        
        # Tag each insight with its type and base priority
        for item in underutilized:
            item["type"] = "underutilized_value"
            item["global_priority"] = item.get("priority_score", 0) + 500
            all_insights.append(item)
            
        for item in neglected: # neglected uses same logic as underutilized in our context, but let's separate
            item["type"] = "neglected_items"
            item["global_priority"] = item.get("priority_score", 0) + 400
            all_insights.append(item)
            
        for item in gaps:
            item["type"] = "wardrobe_gap"
            item["global_priority"] = item.get("priority_score", 0) + 300
            all_insights.append(item)
            
        for item in rotation_risks:
            item["type"] = "rotation_risk"
            item["global_priority"] = item.get("priority_score", 0) + 200
            all_insights.append(item)
            
        for item in unlocks:
            item["type"] = "outfit_unlock"
            item["global_priority"] = item.get("priority_score", 0) + 100
            all_insights.append(item)
            
        # Sort by global priority descending
        all_insights.sort(key=lambda x: x["global_priority"], reverse=True)
        
        top_priority = all_insights[0] if all_insights else None
        
        return {
            "top_priority_insight": top_priority,
            "all_insights": all_insights
        }

predictive_insight_priority_engine = PredictiveInsightPriorityEngine()
