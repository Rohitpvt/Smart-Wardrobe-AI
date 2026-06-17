from typing import Dict, Any

class PurchaseJustificationEngine:
    """
    Generates text explanations based on metrics.
    """
    
    def generate_justification(self, item: Dict[str, Any], roi_data: Dict[str, Any], opportunity_type: str) -> Dict[str, str]:
        category = item.get("category", "item")
        
        why_this_item = f"Based on your profile, this {category} strongly aligns with your aesthetic while filling a critical rotation need."
        expected_impact = "This purchase will significantly boost your overall Wardrobe Health by balancing your daily wear distribution."
        
        if opportunity_type == "essential_gap":
            why_this_item = f"Your wardrobe is currently missing a foundational {category}, which limits your overall styling potential."
            expected_impact = "Adding this essential will immediately ground your rotation and stabilize your smart-casual options."
        elif opportunity_type == "high_outfit_unlock":
            why_this_item = f"This specific {category} acts as a multiplier for your existing pieces."
            expected_impact = f"It mathematically unlocks {roi_data.get('outfits_unlocked', 0)} new combinations without needing to buy anything else."
        elif opportunity_type == "seasonal_need":
            why_this_item = f"Your current rotation lacks weather-appropriate {category} options for the current/upcoming season."
            expected_impact = "It will instantly improve your seasonal readiness score and weather adaptability."
        elif opportunity_type == "style_upgrade":
            why_this_item = f"This {category} is a 90%+ match with your defined Style DNA and favorite colors."
            expected_impact = "It elevates your personal brand and provides a high-confidence option for premium occasions."

        return {
            "why_this_item": why_this_item,
            "expected_impact": expected_impact
        }

purchase_justification_engine = PurchaseJustificationEngine()
