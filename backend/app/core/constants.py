from enum import Enum

class AIFeature(str, Enum):
    """
    Central registry of AI feature names for quota tracking and billing.
    """
    STYLIST_CHAT = "stylist_chat"
    ANALYZE_CLOTHING_IMAGE = "analyze_clothing_image"
    GENERATE_OUTFIT_RECOMMENDATION = "generate_outfit_recommendation"
    GENERATE_OUTFIT_EXPLANATION = "generate_outfit_explanation"
    DAILY_STYLIST_BRIEF = "daily_stylist_brief"
    SHOPPING_INTELLIGENCE = "shopping_intelligence"
    WARDROBE_INTELLIGENCE_SUMMARY = "wardrobe_intelligence_summary"
    PREDICTIVE_STYLIST = "predictive_stylist"
    STYLE_DNA_EXPLANATION = "style_dna_explanation"
    AI_COACH = "ai_coach"
