import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.chat import ChatConversation, ChatMessage
from app.schemas.chat import (
    ChatSessionRead,
    ChatSessionDetail,
    ChatRequest,
    ChatResponse,
    SessionListResponse
)
from app.services.stylist_chat_service import stylist_chat_service

router = APIRouter(prefix="/chat", tags=["stylist-chat"])

@router.post("/sessions", response_model=ChatSessionRead, status_code=201)
async def create_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat session."""
    session_obj = ChatConversation(user_id=current_user.id)
    db.add(session_obj)
    await db.commit()
    await db.refresh(session_obj)
    return session_obj

@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List recent chat sessions."""
    stmt = (
        select(ChatConversation)
        .where(ChatConversation.user_id == current_user.id)
        .order_by(desc(ChatConversation.updated_at))
        .limit(20)
    )
    result = await db.execute(stmt)
    sessions = result.scalars().all()
    return SessionListResponse(data=sessions)

@router.get("/sessions/{session_id}", response_model=ChatSessionDetail)
async def get_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get session details including messages."""
    from sqlalchemy.orm import selectinload
    stmt = (
        select(ChatConversation)
        .where(ChatConversation.id == session_id, ChatConversation.user_id == current_user.id)
        .options(selectinload(ChatConversation.messages))
    )
    result = await db.execute(stmt)
    session_obj = result.scalar_one_or_none()
    
    if not session_obj:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    return session_obj

@router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
async def send_message(
    session_id: uuid.UUID,
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message to the stylist and get a response."""
    try:
        response_data = await stylist_chat_service.chat(
            session=db,
            user_id=current_user.id,
            conversation_id=session_id,
            message_text=body.message
        )
        # Update session timestamp
        stmt = select(ChatConversation).where(ChatConversation.id == session_id, ChatConversation.user_id == current_user.id)
        session_obj = (await db.execute(stmt)).scalar_one_or_none()
        if session_obj:
            from datetime import datetime, timezone
            session_obj.updated_at = datetime.now(timezone.utc)
            await db.commit()
            
        return ChatResponse(
            message=response_data["message"],
            reasons=response_data["reasons"],
            actions=response_data["actions"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to process chat message")

@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a chat session."""
    stmt = select(ChatConversation).where(ChatConversation.id == session_id, ChatConversation.user_id == current_user.id)
    result = await db.execute(stmt)
    session_obj = result.scalar_one_or_none()
    
    if not session_obj:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    await db.delete(session_obj)
    await db.commit()
