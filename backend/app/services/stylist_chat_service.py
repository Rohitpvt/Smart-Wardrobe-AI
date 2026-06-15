import json
import logging
import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from google import genai
from google.genai import types

from app.core.config import settings
from app.models.chat import ChatConversation, ChatMessage
from app.services.ai.context_builder import context_builder
from app.services.ai.prompts import STYLIST_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# Approximate token counting (1 token ≈ 4 chars)
MAX_CONTEXT_TOKENS = 4000
CHARS_PER_TOKEN = 4

class StylistChatService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None
        self.model_name = "gemini-2.5-flash"
        
        # Define the tools
        self.tools = [
            types.Tool(
                function_declarations=[
                    types.FunctionDeclaration(
                        name="generate_outfit",
                        description="Generate a new outfit recommendation based on the user's wardrobe.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "occasion": types.Schema(type=types.Type.STRING, description="The occasion (e.g. CASUAL, OFFICE, PARTY)"),
                            },
                            required=["occasion"]
                        )
                    ),
                    types.FunctionDeclaration(
                        name="show_underutilized",
                        description="Show items that are rarely worn to encourage rotation.",
                    ),
                    types.FunctionDeclaration(
                        name="show_purchase_recommendations",
                        description="Show recommendations for items the user should buy next.",
                    ),
                    types.FunctionDeclaration(
                        name="show_rotation_insights",
                        description="Show insights about the user's wardrobe rotation.",
                    ),
                    types.FunctionDeclaration(
                        name="show_cost_per_wear",
                        description="Show cost-per-wear analytics and economics.",
                    ),
                    types.FunctionDeclaration(
                        name="show_taste_profile",
                        description="Show the user's taste profile and style evolution.",
                    )
                ]
            )
        ]

    def _trim_history(self, db_messages: List[ChatMessage], new_user_msg: str, context_str: str) -> List[types.Content]:
        """
        Trims the conversational history to fit within the MAX_CONTEXT_TOKENS budget.
        Reserves space for the system prompt, context, and new user message.
        """
        # Base tokens for system prompt + context + new message
        base_tokens = len(STYLIST_SYSTEM_PROMPT) // CHARS_PER_TOKEN
        base_tokens += len(context_str) // CHARS_PER_TOKEN
        base_tokens += len(new_user_msg) // CHARS_PER_TOKEN
        
        available_tokens = MAX_CONTEXT_TOKENS - base_tokens
        if available_tokens < 0:
            available_tokens = 0 # Fallback, just drop all history if context is too large
            
        history = []
        current_tokens = 0
        
        # Traverse backwards to keep the most recent messages
        for msg in reversed(db_messages):
            msg_tokens = len(msg.content or "") // CHARS_PER_TOKEN
            # Add extra token cost if there are tool invocations
            if msg.tool_invocations:
                msg_tokens += len(json.dumps(msg.tool_invocations)) // CHARS_PER_TOKEN
                
            if current_tokens + msg_tokens > available_tokens:
                break
                
            current_tokens += msg_tokens
            
            # Reconstruct the google.genai.types.Content object
            parts = []
            if msg.content:
                parts.append(types.Part.from_text(msg.content))
            
            # If the assistant called a tool, we don't strictly need to inject the raw function_call 
            # object back into the context unless we are resolving it. Since we execute actions on the 
            # frontend, we can just represent past actions as text for the LLM's memory.
            if msg.tool_invocations and msg.role == "assistant":
                action_summary = f"[System: Executed action {msg.tool_invocations[0].get('type')}]"
                parts.append(types.Part.from_text(action_summary))
                
            if parts:
                history.insert(0, types.Content(
                    role="model" if msg.role == "assistant" else "user",
                    parts=parts
                ))
                
        return history

    async def _generate_session_title(self, session: AsyncSession, conversation: ChatConversation, first_message: str):
        if not self.client:
            return
            
        prompt = f"Generate a short 3-5 word title for a fashion conversation that starts with: '{first_message}'. Do not use quotes."
        try:
            import asyncio
            def _generate():
                return self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.3),
                ).text
            
            title = await asyncio.wait_for(asyncio.to_thread(_generate), timeout=2.0)
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
        message_text: str
    ) -> Dict[str, Any]:
        """
        Main chat orchestration method.
        """
        if not self.client:
            raise ValueError("Gemini API key is not configured.")

        # 1. Fetch Conversation and History
        stmt = select(ChatConversation).where(ChatConversation.id == conversation_id, ChatConversation.user_id == user_id)
        conversation = (await session.execute(stmt)).scalar_one_or_none()
        if not conversation:
            raise ValueError("Conversation not found")
            
        stmt_msgs = select(ChatMessage).where(ChatMessage.conversation_id == conversation_id).order_by(ChatMessage.created_at)
        db_messages = list((await session.execute(stmt_msgs)).scalars().all())

        # 2. Save User Message
        user_msg = ChatMessage(
            conversation_id=conversation_id,
            role="user",
            content=message_text
        )
        session.add(user_msg)
        await session.commit()

        # 3. Build Context
        ctx_dict = await context_builder.build_context(session, user_id, include_weather=True, city="Local", country_code="US")
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

        # 4. Trim Memory to Budget
        trimmed_history = self._trim_history(db_messages, message_text, ctx_str)
        
        # 5. Build Content Array for Gemini
        contents = trimmed_history + [types.Content(role="user", parts=[types.Part.from_text(message_text)])]

        # 6. Call Gemini
        import asyncio
        def _call_gemini():
            return self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    tools=self.tools,
                    temperature=0.4,
                    response_mime_type="application/json", # Enforce structured response
                )
            )
            
        response = await asyncio.to_thread(_call_gemini)
        
        # 7. Parse Response
        response_text = ""
        reasons = []
        actions = []
        
        # Check for function calls
        if response.function_calls:
            for fc in response.function_calls:
                actions.append({
                    "type": fc.name,
                    "params": fc.args
                })
        
        # Check for text (which should be JSON due to response_mime_type)
        if response.text:
            try:
                parsed = json.loads(response.text)
                response_text = parsed.get("recommendation", "")
                reasons = parsed.get("reasons", [])
            except json.JSONDecodeError:
                response_text = response.text
                
        # Fallback if text is completely empty but action was called
        if not response_text and actions:
            response_text = f"I'll help you with that right now."

        # 8. Save Assistant Message
        assistant_msg = ChatMessage(
            conversation_id=conversation_id,
            role="assistant",
            content=response_text,
            tool_invocations=actions if actions else None,
            reasoning=reasons if reasons else None
        )
        session.add(assistant_msg)
        await session.commit()
        
        # 9. Auto-generate title if this is the first message
        if not conversation.title and len(db_messages) == 0:
            # Fire and forget title generation
            asyncio.create_task(self._generate_session_title(session, conversation, message_text))

        return {
            "message": response_text,
            "reasons": reasons,
            "actions": actions
        }

stylist_chat_service = StylistChatService()
