import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.user import User
from app.models.daily_style_brief import DailyStyleBrief
from app.services.daily_stylist.daily_insight_engine import daily_insight_engine
from app.services.daily_stylist.style_tip_engine import style_tip_engine
from app.services.daily_stylist.weather_context_engine import weather_context_engine
from app.services.daily_stylist.daily_brief_generator import daily_brief_generator

class DailyStylistService:
    """
    Master orchestrator for Phase 9.3: Daily AI Stylist.
    Handles caching, streaks, and assembling the final Daily Style Brief.
    """

    async def get_or_create_daily_brief(self, session: AsyncSession, current_user: User) -> dict:
        today = datetime.now().date()
        
        # 1. Check Cache
        query = await session.execute(
            select(DailyStyleBrief).where(
                DailyStyleBrief.user_id == current_user.id,
                DailyStyleBrief.brief_date == today
            )
        )
        cached_brief = query.scalar_one_or_none()
        if cached_brief:
            return self._format_brief_response(cached_brief)

        # 2. Not cached. Check yesterday for streak calculation
        streak = 1
        query_prev = await session.execute(
            select(DailyStyleBrief).where(
                DailyStyleBrief.user_id == current_user.id
            ).order_by(desc(DailyStyleBrief.brief_date)).limit(1)
        )
        last_brief = query_prev.scalar_one_or_none()
        if last_brief:
            delta = (today - last_brief.brief_date).days
            if delta == 1:
                streak = last_brief.consecutive_days + 1

        # 3. Generate Components
        outfit_item, raw_weather = await daily_brief_generator.generate_outfit(session, current_user)
        weather_ctx = weather_context_engine.process_weather(raw_weather)
        insight = await daily_insight_engine.generate_daily_insight(session, current_user.id)
        tip = style_tip_engine.generate_style_tip(outfit_item.recommendation, weather_ctx)

        # 4. Save to DB Cache
        new_brief = DailyStyleBrief(
            user_id=current_user.id,
            brief_date=today,
            recommended_outfit=outfit_item.model_dump(),
            weather_context=weather_ctx,
            insight=insight,
            style_tip=tip,
            confidence_score=outfit_item.explanation.confidence,
            consecutive_days=streak
        )
        session.add(new_brief)
        await session.commit()
        await session.refresh(new_brief)

        return self._format_brief_response(new_brief)

    def _format_brief_response(self, brief: DailyStyleBrief) -> dict:
        outfit_data = brief.recommended_outfit
        
        # Guard: If the backend accidentally saved the full ExplainableRecommendationItem structure
        # (which has a nested "recommendation" dict), we flatten it here so the frontend API 
        # contract remains stable.
        if isinstance(outfit_data, dict) and "recommendation" in outfit_data:
            outfit_data = outfit_data["recommendation"]
            
        return {
            "date": brief.brief_date.isoformat(),
            "weather": brief.weather_context,
            "recommended_outfit": outfit_data,
            "confidence": brief.confidence_score,
            "style_tip": brief.style_tip,
            "daily_insight": brief.insight,
            "consecutive_days": brief.consecutive_days
        }

daily_stylist_service = DailyStylistService()
