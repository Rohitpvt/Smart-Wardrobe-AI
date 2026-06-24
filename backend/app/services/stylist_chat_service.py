"""
AI Stylist Chat Service.

Orchestrates the conversational AI stylist with tool-calling support.
Uses the AIProviderRouter for all LLM calls — fully provider-agnostic.

Previously used google.genai.Client directly with Gemini-native types.
Now uses OpenAI-compatible message/tool format that both providers understand.
"""

import json
import logging
import uuid
import asyncio
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.chat import ChatConversation, ChatMessage
from app.models.clothing_item import ClothingItem
from app.models.user_preference import UserPreference
from app.schemas.wardrobe import ClothingItemRead
from app.services.ai.context_builder import context_builder
from app.services.ai.prompts import STYLIST_SYSTEM_PROMPT
from app.services.ai import ai_provider
from app.services.recommendations.completion_engine import outfit_completion_engine
from app.services.weather.provider import weather_service

logger = logging.getLogger(__name__)

# Approximate token counting (1 token ≈ 4 chars)
MAX_CONTEXT_TOKENS = 4000
CHARS_PER_TOKEN = 4

# Tool definitions in OpenAI-compatible format (provider-agnostic)
STYLIST_TOOLS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "generate_outfit",
            "description": "Generate a new outfit recommendation based on the user's wardrobe.",
            "parameters": {
                "type": "object",
                "properties": {
                    "occasion": {
                        "type": "string",
                        "description": "The occasion (e.g. CASUAL, OFFICE, PARTY)",
                    }
                },
                "required": ["occasion"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "show_underutilized",
            "description": "Show items that are rarely worn to encourage rotation.",
        },
    },
    {
        "type": "function",
        "function": {
            "name": "show_purchase_recommendations",
            "description": "Show recommendations for items the user should buy next.",
        },
    },
    {
        "type": "function",
        "function": {
            "name": "show_rotation_insights",
            "description": "Show insights about the user's wardrobe rotation.",
        },
    },
    {
        "type": "function",
        "function": {
            "name": "show_cost_per_wear",
            "description": "Show cost-per-wear analytics and economics.",
        },
    },
    {
        "type": "function",
        "function": {
            "name": "show_taste_profile",
            "description": "Show the user's taste profile and style evolution.",
        },
    },
    {
        "type": "function",
        "function": {
            "name": "build_outfit_around_item",
            "description": "Build a complete outfit around a specific wardrobe item.",
            "parameters": {
                "type": "object",
                "properties": {
                    "item_keyword": {
                        "type": "string",
                        "description": "Keywords to identify the item (e.g. 'green shirt', 'blue jeans')",
                    }
                },
                "required": ["item_keyword"],
            },
        },
    },
]


class StylistChatService:
    def __init__(self):
        # No more direct genai.Client — all LLM calls go through ai_provider
        pass

    def _trim_history(
        self, db_messages: List[ChatMessage], new_user_msg: str, context_str: str
    ) -> List[Dict[str, str]]:
        """
        Trims the conversational history to fit within the MAX_CONTEXT_TOKENS budget.
        Returns messages in OpenAI-compatible format: [{"role": str, "content": str}].
        """
        base_tokens = len(STYLIST_SYSTEM_PROMPT) // CHARS_PER_TOKEN
        base_tokens += len(context_str) // CHARS_PER_TOKEN
        base_tokens += len(new_user_msg) // CHARS_PER_TOKEN

        available_tokens = max(0, MAX_CONTEXT_TOKENS - base_tokens)

        history: List[Dict[str, str]] = []
        current_tokens = 0

        # Traverse backwards to keep the most recent messages
        for msg in reversed(db_messages):
            msg_tokens = len(msg.content or "") // CHARS_PER_TOKEN
            if msg.tool_invocations:
                msg_tokens += len(json.dumps(msg.tool_invocations)) // CHARS_PER_TOKEN

            if current_tokens + msg_tokens > available_tokens:
                break

            current_tokens += msg_tokens

            content = msg.content or ""
            if msg.tool_invocations and msg.role == "assistant":
                action_summary = f"[System: Executed action {msg.tool_invocations[0].get('type')}]"
                content = f"{content}\n{action_summary}" if content else action_summary

            if content:
                history.insert(
                    0,
                    {
                        "role": "assistant" if msg.role == "assistant" else "user",
                        "content": content,
                    },
                )

        return history

    async def _generate_session_title(
        self,
        session: AsyncSession,
        conversation: ChatConversation,
        first_message: str,
    ):
        prompt = f"Generate a short 3-5 word title for a fashion conversation that starts with: '{first_message}'. Do not use quotes."
        try:
            title = await ai_provider.generate_text(
                db=session,
                user_id=conversation.user_id,
                feature_name="stylist_chat_title",
                prompt=prompt, 
                temperature=0.3, 
                timeout=2.0
            )
            if title:
                conversation.title = title.strip()
                await session.commit()
        except Exception as e:
            logger.warning(f"Failed to auto-generate title: {e}")

    async def chat(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        conversation_id: uuid.UUID,
        message_text: str,
    ) -> Dict[str, Any]:
        """
        Main chat orchestration method.
        Uses the AIProviderRouter for all LLM calls.
        """
        # 1. Fetch Conversation and History
        stmt = select(ChatConversation).where(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == user_id,
        )
        conversation = (await session.execute(stmt)).scalar_one_or_none()
        if not conversation:
            raise ValueError("Conversation not found")

        stmt_msgs = (
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation_id)
            .order_by(ChatMessage.created_at)
        )
        db_messages = list((await session.execute(stmt_msgs)).scalars().all())

        # 2. Save User Message
        user_msg = ChatMessage(
            conversation_id=conversation_id, role="user", content=message_text
        )
        session.add(user_msg)
        await session.commit()

        # 3. Build Context
        ctx_dict = await context_builder.build_context(
            session, user_id, include_weather=True, city="Local", country_code="US"
        )
        ctx_str = json.dumps(ctx_dict, indent=2)

        system_instruction = f"""
{STYLIST_SYSTEM_PROMPT}

# CURRENT CONTEXT:
{ctx_str}

# EXPLAINABILITY REQUIREMENT:
You must ALWAYS respond with a structured JSON object exactly matching this schema:
{{
  "recommendation": "Your conversational response here.",
  "reasons": [
    "Reason 1 referencing the context",
    "Reason 2 referencing the context"
  ]
}}
Even if the user just says "hello", return valid JSON with empty reasons.
        """

        # 4. Trim Memory to Budget (now returns OpenAI-compatible messages)
        trimmed_history = self._trim_history(db_messages, message_text, ctx_str)

        # 5. Build Content Array (OpenAI-compatible format)
        messages = trimmed_history + [{"role": "user", "content": message_text}]

        # 6. Call AI Provider (provider-agnostic)
        response = await ai_provider.generate_chat_response(
            db=session,
            user_id=user_id,
            feature_name="stylist_chat",
            messages=messages,
            system_instruction=system_instruction,
            tools=STYLIST_TOOLS,
            temperature=0.4,
            timeout=15.0,
        )

        # 7. Parse Normalized Response
        response_text = ""
        reasons: List[str] = []
        actions: List[Dict[str, Any]] = []

        # Process function calls
        if response.get("function_calls"):
            for fc in response["function_calls"]:
                action_data: Dict[str, Any] = {
                    "type": fc["name"],
                    "params": fc.get("args", {}),
                }

                # Execute build_outfit_around_item
                if fc["name"] == "build_outfit_around_item":
                    keyword = fc.get("args", {}).get("item_keyword", "").lower()
                    if keyword:
                        item_query = await session.execute(
                            select(ClothingItem).where(
                                ClothingItem.user_id == user_id
                            )
                        )
                        all_items = item_query.scalars().all()
                        anchor_item = next(
                            (
                                i
                                for i in all_items
                                if keyword in i.name.lower()
                                or keyword in i.category.lower()
                                or keyword in i.color.lower()
                            ),
                            None,
                        )

                        if anchor_item:
                            weather_ctx = await weather_service.get_current_weather(
                                "Local", "US"
                            )
                            pref_query = await session.execute(
                                select(UserPreference).where(
                                    UserPreference.user_id == user_id
                                )
                            )
                            pref = pref_query.scalar_one_or_none()
                            styling_preference = (
                                pref.styling_preference if pref else "neutral"
                            )

                            try:
                                (
                                    top,
                                    bottom,
                                    shoes,
                                    outerwear,
                                    scores,
                                ) = await outfit_completion_engine.build_around_anchor(
                                    session,
                                    user_id,
                                    anchor_item,
                                    "CASUAL",
                                    weather_ctx,
                                )
                                gem_resp = await ai_provider.generate_outfit_completion_accessories(
                                    db=session,
                                    user_id=user_id,
                                    feature_name="stylist_chat_accessories",
                                    top_name=top.name,
                                    bottom_name=bottom.name,
                                    footwear_name=shoes.name,
                                    outerwear_name=outerwear.name if outerwear else None,
                                    anchor_type=anchor_item.category,
                                    styling_preference=styling_preference,
                                )
                                action_data["params"]["outfit_data"] = {
                                    "anchor_item": ClothingItemRead.model_validate(
                                        anchor_item
                                    ).model_dump(mode="json"),
                                    "top_item": ClothingItemRead.model_validate(
                                        top
                                    ).model_dump(mode="json"),
                                    "bottom_item": ClothingItemRead.model_validate(
                                        bottom
                                    ).model_dump(mode="json"),
                                    "footwear_item": ClothingItemRead.model_validate(
                                        shoes
                                    ).model_dump(mode="json"),
                                    "outerwear_item": ClothingItemRead.model_validate(
                                        outerwear
                                    ).model_dump(mode="json")
                                    if outerwear
                                    else None,
                                    "accessories": gem_resp.get("accessories", {}),
                                    "reasoning": gem_resp.get(
                                        "reasoning", "A completed outfit."
                                    ),
                                    "confidence_score": scores.get(
                                        "overall_score", 85
                                    ),
                                }
                            except Exception as e:
                                logger.error(
                                    f"Failed to build outfit via tool: {e}"
                                )
                                action_data["error"] = (
                                    "Could not generate outfit."
                                )
                        else:
                            action_data["error"] = "Item not found in wardrobe."

                actions.append(action_data)

        def clean_json_markdown(raw_text: str) -> str:
            text = raw_text.strip()
            if text.startswith("```json"):
                text = text[len("```json"):].strip()
            elif text.startswith("```"):
                text = text[len("```"):].strip()
            if text.endswith("```"):
                text = text[:-3].strip()
            return text

        # Process text response
        if response.get("text"):
            try:
                cleaned_text = clean_json_markdown(response["text"])
                parsed = json.loads(cleaned_text)
                response_text = parsed.get("recommendation", "")
                reasons = parsed.get("reasons", [])
            except json.JSONDecodeError:
                response_text = response["text"]

        # Fallback if text is completely empty but action was called
        if not response_text and actions:
            response_text = "I'll help you with that right now."

        # 8. Save Assistant Message
        assistant_msg = ChatMessage(
            conversation_id=conversation_id,
            role="assistant",
            content=response_text,
            tool_invocations=actions if actions else None,
            reasoning=reasons if reasons else None,
        )
        session.add(assistant_msg)
        await session.commit()

        # 9. Auto-generate title if this is the first message
        if not conversation.title and len(db_messages) == 0:
            asyncio.create_task(
                self._generate_session_title(session, conversation, message_text)
            )

        return {"message": response_text, "reasons": reasons, "actions": actions}


stylist_chat_service = StylistChatService()
