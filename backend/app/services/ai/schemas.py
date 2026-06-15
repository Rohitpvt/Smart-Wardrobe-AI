"""
Pydantic schemas for AI clothing extraction.
Ensures Gemini outputs match the database schema strict requirements.
"""

from pydantic import BaseModel, Field

class AIClothingExtraction(BaseModel):
    """Structured output expected from the AI provider."""
    name: str = Field(description="A short, descriptive name for the item, e.g., 'Blue Denim Jacket'")
    category: str | None = Field(default=None, description="Must be exactly one of: TOPWEAR, BOTTOMWEAR, FOOTWEAR, OUTERWEAR, ACCESSORY. Null if unknown.")
    clothing_type: str | None = Field(default=None, description="Specific type, e.g., 'T-Shirt', 'Jeans', 'Sneakers'. Null if unknown.")
    color: str | None = Field(default=None, description="The primary color of the item. Null if unknown.")
    pattern: str | None = Field(default=None, description="Pattern if visible, e.g., 'Striped', 'Solid', 'Plaid'. Null if not applicable.")
    material: str | None = Field(default=None, description="Material if identifiable, e.g., 'Cotton', 'Denim', 'Leather'. Null if unidentifiable.")
    season: str | None = Field(default=None, description="Must be exactly one of: SUMMER, WINTER, SPRING, AUTUMN, ALL_SEASON. Null if unidentifiable.")
    brand: str | None = Field(default=None, description="Brand name if a logo or tag is clearly visible. Null otherwise.")
    confidence_score: int = Field(ge=0, le=100, description="Confidence in the extraction from 0 to 100.")
