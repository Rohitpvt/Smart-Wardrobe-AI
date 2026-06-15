from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.clothing_item import ClothingItem
from app.services.wardrobe_gap_rules import WardrobeGapRules

class WardrobeGapService:
    async def analyze(self, session: AsyncSession, user_id: str) -> Dict[str, Any]:
        """
        Analyze the user's wardrobe and calculate scores based on rules.
        """
        query = select(ClothingItem).where(ClothingItem.user_id == user_id)
        result = await session.execute(query)
        items = result.scalars().all()
        
        if not items:
            return self._empty_report()
            
        category_counts = {}
        type_diversity = {}
        seasonal_coverage = {"summer": set(), "winter": set(), "spring/fall": set()}
        
        unused_inventory_count = 0
        total_wears = 0
        
        for item in items:
            cat = item.category.lower() if item.category else "other"
            category_counts[cat] = category_counts.get(cat, 0) + 1
            
            if cat not in type_diversity:
                type_diversity[cat] = set()
            if item.clothing_type:
                type_diversity[cat].add(item.clothing_type.lower())
                
            season = item.season.lower() if item.season else ""
            if "summer" in season or "all" in season:
                seasonal_coverage["summer"].add(cat)
            if "winter" in season or "all" in season:
                seasonal_coverage["winter"].add(cat)
            if "spring" in season or "fall" in season or "all" in season:
                seasonal_coverage["spring/fall"].add(cat)
                
            if item.worn_count == 0:
                unused_inventory_count += 1
            total_wears += item.worn_count
            
        # 1. Gaps
        gaps = WardrobeGapRules.analyze_gaps(category_counts)
        weaknesses = WardrobeGapRules.analyze_diversity(type_diversity)
        
        # 2. Scores
        total_essential = sum(WardrobeGapRules.CATEGORY_THRESHOLDS.values())
        actual_essential = sum(min(category_counts.get(k, 0), v) for k, v in WardrobeGapRules.CATEGORY_THRESHOLDS.items())
        completeness_score = int((actual_essential / total_essential) * 100) if total_essential else 0
        
        total_div = sum(WardrobeGapRules.DIVERSITY_THRESHOLDS.values())
        actual_div = sum(min(len(type_diversity.get(k, set())), v) for k, v in WardrobeGapRules.DIVERSITY_THRESHOLDS.items())
        diversity_score = int((actual_div / total_div) * 100) if total_div else 0
        
        # Seasonal coverage score
        expected_seasonal = sum(len(cats) for cats in WardrobeGapRules.SEASONAL_EXPECTATIONS.values())
        actual_seasonal = 0
        for season, expected_cats in WardrobeGapRules.SEASONAL_EXPECTATIONS.items():
            for cat in expected_cats:
                if cat in seasonal_coverage[season]:
                    actual_seasonal += 1
        seasonal_score = int((actual_seasonal / expected_seasonal) * 100) if expected_seasonal else 0
        
        # Closet Efficiency Score
        utilization = 100 - int((unused_inventory_count / len(items)) * 100)
        efficiency_score = int((utilization * 0.4) + (diversity_score * 0.3) + (seasonal_score * 0.3))
        
        recommendations = gaps + weaknesses
        if not recommendations:
            recommendations.append("Your wardrobe is well-balanced across all essential categories and seasons!")
            
        return {
            "completeness_score": completeness_score,
            "diversity_score": diversity_score,
            "seasonal_score": seasonal_score,
            "efficiency_score": efficiency_score,
            "utilization_percentage": utilization,
            "unused_inventory": unused_inventory_count,
            "gaps": gaps,
            "weaknesses": weaknesses,
            "recommendations": recommendations[:5]
        }
        
    def _empty_report(self) -> Dict[str, Any]:
        return {
            "completeness_score": 0,
            "diversity_score": 0,
            "seasonal_score": 0,
            "efficiency_score": 0,
            "utilization_percentage": 0,
            "unused_inventory": 0,
            "gaps": ["Wardrobe is empty."],
            "weaknesses": [],
            "recommendations": ["Upload tops, bottoms, and footwear to get started."]
        }

wardrobe_gap_service = WardrobeGapService()
