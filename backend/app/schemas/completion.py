from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
import uuid

from app.schemas.wardrobe import ClothingItemRead

class CompletionBuildRequest(BaseModel):
    anchor_item_id: uuid.UUID
    occasion: str

class OutfitCompletionResponseData(BaseModel):
    anchor_item: ClothingItemRead
    top_item: ClothingItemRead
    bottom_item: ClothingItemRead
    footwear_item: ClothingItemRead
    outerwear_item: Optional[ClothingItemRead] = None
    accessories: Dict[str, str]
    reasoning: str
    confidence_score: int
    scores: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)

class OutfitCompletionResponse(BaseModel):
    success: bool = True
    data: OutfitCompletionResponseData
