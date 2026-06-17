import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.intelligence import IntelligenceFeedItem
from app.services.dashboard import get_dashboard_intelligence, get_predictive_insights
from app.services.context.confidence_engine import confidence_engine
from app.services.context.behavioral_pattern_service import behavioral_pattern_service
from app.services.context.seasonal_intelligence_service import seasonal_intelligence_service
from app.services.context.weather_trigger_service import weather_trigger_service

logger = logging.getLogger(__name__)

class IntelligenceFeedService:
    async def get_or_generate_feed(self, session: AsyncSession, user_id: uuid.UUID) -> List[IntelligenceFeedItem]:
        now = datetime.now(timezone.utc)
        
        stmt = select(IntelligenceFeedItem).where(IntelligenceFeedItem.user_id == user_id).order_by(IntelligenceFeedItem.created_at.desc()).limit(1)
        latest = (await session.execute(stmt)).scalars().first()
        
        needs_generation = True
        if latest:
            latest_date = latest.created_at
            if latest_date.tzinfo is None:
                latest_date = latest_date.replace(tzinfo=timezone.utc)
            if (now - latest_date).total_seconds() < 24 * 3600:
                needs_generation = False
                
        if needs_generation:
            logger.info(f"Generating new Contextual Intelligence Feed for user {user_id}")
            await self._generate_feed_items(session, user_id)
            
        # Ranking formula: impact_score * 0.6 + confidence_score * 0.4
        stmt = (
            select(IntelligenceFeedItem)
            .where(
                IntelligenceFeedItem.user_id == user_id,
                (IntelligenceFeedItem.expires_at == None) | (IntelligenceFeedItem.expires_at > now)
            )
            .order_by((IntelligenceFeedItem.impact_score * 0.6 + IntelligenceFeedItem.confidence_score * 0.4).desc(), IntelligenceFeedItem.created_at.desc())
            .limit(20)
        )
        return list((await session.execute(stmt)).scalars().all())

    async def _generate_feed_items(self, session: AsyncSession, user_id: uuid.UUID):
        now = datetime.now(timezone.utc)
        new_items = []
        
        dashboard_data = await get_dashboard_intelligence(session, user_id)
        health = dashboard_data.get("health", {})
        predictive = await get_predictive_insights(session, user_id)
        
        # 1. Operational: CPW Improvement
        efficiency_score = health.get("efficiency_score", 0)
        if efficiency_score > 80:
            new_items.append(IntelligenceFeedItem(
                user_id=user_id,
                item_type="insight",
                content="Your Cost Per Wear efficiency is excellent this week. Keep up the good rotation!",
                impact_score=85.0,
                confidence_score=95.0, # Math is exact, very high confidence
                feed_category="operational",
                source_services=["wardrobe_health"],
                expires_at=now + timedelta(days=2)
            ))

        # 2. Operational: Rotation Alert
        rotation = predictive.get("rotation", {})
        underused_count = len(rotation.get("recommended_rotation", []))
        if underused_count > 0:
            new_items.append(IntelligenceFeedItem(
                user_id=user_id,
                item_type="alert",
                content=f"You have {underused_count} items that are at risk of being underutilized.",
                impact_score=90.0,
                confidence_score=90.0,
                feed_category="operational",
                source_services=["rotation_engine"],
                action_payload={"action": "view_underutilized"},
                expires_at=now + timedelta(days=2)
            ))
            
        # 3. Behavioral Insights (Guardrail: Conf > 70)
        # We currently do not have live generation tracking tables enabled.
        # Removing mock logic:
        usage_data = {} # Empty data, deterministic. No hallucination.
        behavioral_insights = behavioral_pattern_service.generate_behavioral_insights(usage_data)
        for b_insight in behavioral_insights:
            new_items.append(IntelligenceFeedItem(
                user_id=user_id,
                item_type="insight",
                content=b_insight["message"],
                impact_score=75.0,
                confidence_score=b_insight["confidence_score"],
                feed_category="behavioral",
                source_services=["behavioral_pattern_service"],
                expires_at=now + timedelta(days=5)
            ))

        # 4. Seasonal Intelligence
        season = seasonal_intelligence_service.get_current_season()
        if season != "Unknown":
            new_items.append(IntelligenceFeedItem(
                user_id=user_id,
                item_type="insight",
                content=f"{season} is active. Ensure your wardrobe rotation reflects the current season.",
                impact_score=60.0,
                confidence_score=85.0,
                feed_category="seasonal",
                source_services=["seasonal_intelligence_service"],
                expires_at=now + timedelta(days=7)
            ))

        # 5. Weather Triggers
        # Removed weather_mock. We do not generate synthetic weather data.
        # If no live weather integration exists, we return no weather triggers.

        if new_items:
            session.add_all(new_items)
            await session.commit()

intelligence_feed_service = IntelligenceFeedService()
