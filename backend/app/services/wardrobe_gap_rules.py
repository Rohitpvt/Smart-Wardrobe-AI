from typing import Dict, List, Set

class WardrobeGapRules:
    """
    Configuration layer for Wardrobe Gap Analysis.
    Defines baseline expectations for a healthy wardrobe.
    """
    
    # Required categories for a complete wardrobe baseline
    ESSENTIAL_CATEGORIES = {
        "tops",
        "bottoms",
        "footwear",
        "outerwear"
    }

    # Minimum threshold of items per category to be considered "covered"
    CATEGORY_THRESHOLDS: Dict[str, int] = {
        "tops": 5,
        "bottoms": 3,
        "footwear": 2,
        "outerwear": 1
    }

    # Ideal diversity: how many unique clothing_types per category
    DIVERSITY_THRESHOLDS: Dict[str, int] = {
        "tops": 3,       # e.g., t-shirt, shirt, sweater
        "bottoms": 2,    # e.g., jeans, trousers
        "footwear": 2,   # e.g., sneakers, formal
        "outerwear": 1
    }

    # Expected coverage per season
    SEASONAL_EXPECTATIONS = {
        "summer": ["tops", "bottoms", "footwear"],
        "winter": ["tops", "bottoms", "outerwear", "footwear"],
        "spring/fall": ["tops", "bottoms", "outerwear", "footwear"]
    }

    @classmethod
    def analyze_gaps(cls, category_counts: Dict[str, int]) -> List[str]:
        gaps = []
        for cat in cls.ESSENTIAL_CATEGORIES:
            count = category_counts.get(cat.lower(), 0)
            if count == 0:
                gaps.append(f"Missing essential category: {cat.capitalize()}")
            elif count < cls.CATEGORY_THRESHOLDS.get(cat, 1):
                gaps.append(f"Low inventory in {cat.capitalize()} ({count}/{cls.CATEGORY_THRESHOLDS.get(cat)})")
        return gaps

    @classmethod
    def analyze_diversity(cls, type_diversity: Dict[str, Set[str]]) -> List[str]:
        weaknesses = []
        for cat, expected in cls.DIVERSITY_THRESHOLDS.items():
            actual = len(type_diversity.get(cat, set()))
            if actual < expected:
                weaknesses.append(f"Low diversity in {cat.capitalize()} types. Try adding different styles.")
        return weaknesses
