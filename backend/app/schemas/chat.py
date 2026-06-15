import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict

class ChatMessageBase(BaseModel):
    role: str
    content: str
    tool_invocations: Optional[List[Dict[str, Any]]] = None
    reasoning: Optional[List[str]] = None

class ChatMessageRead(ChatMessageBase):
    id: uuid.UUID
    session_id: uuid.UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ChatSessionRead(BaseModel):
    id: uuid.UUID
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ChatSessionDetail(ChatSessionRead):
    messages: List[ChatMessageRead] = []

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    message: str
    reasons: List[str] = []
    actions: List[Dict[str, Any]] = []
    
class SessionListResponse(BaseModel):
    success: bool = True
    data: List[ChatSessionRead]
