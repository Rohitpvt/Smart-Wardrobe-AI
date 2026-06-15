from typing import Dict, Any, List

class ReadinessService:
    """
    Calculates explainable Wardrobe Readiness Scores for various contexts.
    """
    
    def calculate_readiness_scores(self, wardrobe_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Returns a dictionary of readiness scores with strengths, gaps, and recommendations.
        """
        
        # In a real system, we'd use robust categorization and material analysis.
        # Here we use heuristic checks based on categories.
        categories = [item.get("category", "") for item in wardrobe_items]
        cat_counts = {c: categories.count(c) for c in set(categories)}
        
        scores = {}
        
        # 1. Winter Readiness
        winter_score = 40
        winter_strengths = []
        winter_gaps = []
        winter_recs = []
        
        coats = cat_counts.get("Coat", 0) + cat_counts.get("Jacket", 0)
        sweaters = cat_counts.get("Sweater", 0)
        
        if coats > 0:
            winter_score += 30
            winter_strengths.append("Adequate outerwear coverage")
        else:
            winter_gaps.append("Missing heavy outerwear")
            winter_recs.append("Add a versatile winter coat")
            
        if sweaters > 1:
            winter_score += 30
            winter_strengths.append("Good layering options")
        else:
            winter_gaps.append("Limited sweaters for layering")
            winter_recs.append("Consider adding 1-2 sweaters")
            
        scores["Winter"] = {
            "score": min(100, winter_score),
            "strengths": winter_strengths,
            "gaps": winter_gaps,
            "recommendations": winter_recs
        }
        
        # 2. Summer Readiness
        summer_score = 40
        summer_strengths = []
        summer_gaps = []
        summer_recs = []
        
        tshirts = cat_counts.get("T-shirt", 0)
        shorts = cat_counts.get("Shorts", 0)
        
        if tshirts > 2:
            summer_score += 30
            summer_strengths.append("Strong lightweight tops coverage")
        else:
            summer_gaps.append("Limited lightweight tops")
            summer_recs.append("Add more t-shirts or breathable shirts")
            
        if shorts > 0:
            summer_score += 30
            summer_strengths.append("Adequate warm-weather bottoms")
        else:
            summer_gaps.append("Missing shorts")
            summer_recs.append("Add at least one pair of shorts")
            
        scores["Summer"] = {
            "score": min(100, summer_score),
            "strengths": summer_strengths,
            "gaps": summer_gaps,
            "recommendations": summer_recs
        }
        
        # 3. Formal Readiness
        formal_score = 30
        formal_strengths = []
        formal_gaps = []
        formal_recs = []
        
        suits = cat_counts.get("Suit", 0)
        dress_shirts = cat_counts.get("Dress Shirt", 0)
        
        if suits > 0:
            formal_score += 40
            formal_strengths.append("Owns formal suiting")
        else:
            formal_gaps.append("No formal suits")
            formal_recs.append("A basic navy or charcoal suit is recommended")
            
        if dress_shirts > 0:
            formal_score += 30
            formal_strengths.append("Has formal shirting")
        else:
            formal_gaps.append("No dress shirts")
            formal_recs.append("Add a crisp white dress shirt")
            
        scores["Formal"] = {
            "score": min(100, formal_score),
            "strengths": formal_strengths,
            "gaps": formal_gaps,
            "recommendations": formal_recs
        }
        
        # Mock Monsoon and Travel for completeness
        scores["Monsoon"] = {
            "score": 65,
            "strengths": ["Quick-dry shorts available"],
            "gaps": ["No waterproof footwear"],
            "recommendations": ["Add waterproof shoes or boots"]
        }
        
        scores["Travel"] = {
            "score": 80,
            "strengths": ["High versatility in casual wear", "Good layering items"],
            "gaps": ["Missing a packable jacket"],
            "recommendations": ["Consider a lightweight packable outer layer"]
        }

        return scores

readiness_service = ReadinessService()
