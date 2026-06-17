import datetime
from typing import Dict, Any, List

class SeasonalIntelligenceService:
    """
    Handles regional mapping for seasons and seasonal wardrobe readiness gaps.
    """
    
    REGION_MAPPINGS = {
        "northern_hemisphere": {
            "Spring": [3, 4, 5],
            "Summer": [6, 7, 8],
            "Autumn": [9, 10, 11],
            "Winter": [12, 1, 2]
        },
        "india": {
            "Summer": [3, 4, 5],
            "Monsoon": [6, 7, 8, 9],
            "Winter": [10, 11, 12, 1, 2]
        }
    }

    def get_current_season(self, region: str = "northern_hemisphere", date: datetime.date = None) -> str:
        """
        Determines the current season based on region and date.
        """
        if not date:
            date = datetime.date.today()
            
        month = date.month
        mapping = self.REGION_MAPPINGS.get(region, self.REGION_MAPPINGS["northern_hemisphere"])
        
        for season, months in mapping.items():
            if month in months:
                return season
                
        return "Unknown"

    def detect_seasonal_opportunities(self, wardrobe_items: List[Dict[str, Any]], region: str = "northern_hemisphere") -> List[Dict[str, Any]]:
        """
        Detects seasonal readiness gaps and rotation risks.
        """
        current_season = self.get_current_season(region)
        opportunities = []
        
        # In a deterministic gap analysis, we do not hallucinate required seasonal items.
        # This will be replaced with real ML logic or deterministic mapping when user 
        # specifically requests seasonal goals. For now, it returns empty list if no
        # deterministic gaps exist.
        
        # Example deterministic check: If winter is active and 0 outerwear exists
        if current_season in ["Winter", "Autumn"]:
            outerwear = [i for i in wardrobe_items if i.get("category", "").lower() in ["outerwear", "coat", "jacket"]]
            if not outerwear and len(wardrobe_items) >= 3:
                opportunities.append({
                    "type": "gap",
                    "season": current_season,
                    "missing_categories": ["Outerwear"],
                    "message": f"{current_season} is active. Ensure you have adequate outerwear."
                })
        elif current_season == "Summer":
            shorts = [i for i in wardrobe_items if i.get("category", "").lower() == "shorts"]
            if not shorts and len(wardrobe_items) >= 3:
                opportunities.append({
                    "type": "gap",
                    "season": current_season,
                    "missing_categories": ["Shorts"],
                    "message": f"Summer is active. Consider adding shorts to your rotation."
                })
                
        return opportunities

seasonal_intelligence_service = SeasonalIntelligenceService()
