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
        
        # Calculate coverage for the current season based on categories or tags
        # In a real system, this would map categories (e.g. "Sweaters", "Shorts") to seasons.
        # Here we perform a mock evaluation.
        
        season_category_map = {
            "Winter": ["Sweater", "Jacket", "Coat"],
            "Summer": ["Shorts", "T-shirt", "Tank Top"],
            "Monsoon": ["Jacket", "Raincoat", "Boots"],
            "Spring": ["T-shirt", "Cardigan"],
            "Autumn": ["Sweater", "Jacket"]
        }
        
        expected_categories = season_category_map.get(current_season, [])
        found_categories = {item.get("category") for item in wardrobe_items}
        
        missing = set(expected_categories) - found_categories
        
        if missing:
            opportunities.append({
                "type": "gap",
                "season": current_season,
                "missing_categories": list(missing),
                "message": f"{current_season} is here, but you're missing essential categories like {', '.join(missing)}."
            })
            
        # Check for rotation risks (e.g., Summer items heavily worn in Winter)
        # Assuming wear analytics provides last_worn or frequency
        
        return opportunities

seasonal_intelligence_service = SeasonalIntelligenceService()
