from pydantic import BaseModel, Field
from typing import Optional

class AIAnalysisRequest(BaseModel):
    s3_key: str = Field(..., description="The S3 key of the image to analyze.")
    user_hints: Optional[str] = Field(None, description="Optional hints provided by the user to guide the AI.")

class AIClothingAnalysisResponse(BaseModel):
    type: Optional[str] = Field(None, description="The type of clothing, e.g., 'Jacket', 'Jeans'")
    category: Optional[str] = Field(None, description="Broad category, e.g., 'Top Wear', 'Bottom Wear'")
    primary_color: Optional[str] = Field(None, description="Main color of the item")
    secondary_color: Optional[str] = Field(None, description="Secondary or accent color")
    pattern: Optional[str] = Field(None, description="Pattern on the item, e.g., 'Solid', 'Striped'")
    possible_material: Optional[str] = Field(None, description="Likely material, e.g., 'Denim', 'Cotton'")
    season_suggestion: Optional[str] = Field(None, description="Suggested season, e.g., 'Winter', 'All-season'")
    occasion_suggestion: Optional[str] = Field(None, description="Suggested occasion, e.g., 'Casual', 'Formal'")
    visible_condition: Optional[str] = Field(None, description="Condition visible in image, e.g., 'Good', 'Faded'")
    confidence_score: float = Field(..., description="AI confidence score from 0.0 to 1.0")
    explanation: str = Field(..., description="Brief explanation of the AI's analysis")
