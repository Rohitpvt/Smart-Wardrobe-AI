from typing import List
import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, TimestampMixin, UUIDMixin


class ChatConversation(Base, UUIDMixin, TimestampMixin):
    """
    Stores AI chat sessions.
    Table: chat_conversations
    """
    __tablename__ = "chat_conversations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="chat_conversations")
    messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="conversation", cascade="all, delete-orphan"
    )


class ChatMessage(Base, UUIDMixin, TimestampMixin):
    """
    Stores individual chat messages.
    Table: chat_messages
    """
    __tablename__ = "chat_messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_conversations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Phase 7B additions:
    tool_invocations: Mapped[dict | list | None] = mapped_column(JSONB, nullable=True)
    reasoning: Mapped[dict | list | None] = mapped_column(JSONB, nullable=True)

    # Relationship
    conversation: Mapped["ChatConversation"] = relationship("ChatConversation", back_populates="messages")
