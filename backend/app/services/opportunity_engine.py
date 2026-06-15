import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.intelligence import WardrobeOpportunity
from app.services.dashboard import get_predictive_insights, get_purchase_recommendations

logger = logging.getLogger(__name__)

class OpportunityEngine:
    """
    Detects and manages WardrobeOpportunities.
    """
    async def generate_opportunities(self, session: AsyncSession, user_id: uuid.UUID) -> None:
        """
        Analyzes wardrobe state to generate new opportunities.
        Dismissed/Completed opportunities are respected and not duplicated.
        """
        # Fetch current active opportunities
        stmt = select(WardrobeOpportunity).where(
            WardrobeOpportunity.user_id == user_id,
            WardrobeOpportunity.status == "active"
        )
        active_opps = list((await session.execute(stmt)).scalars().all())
        active_titles = {opp.title for opp in active_opps}

        new_opportunities = []

        # 1. Check Rotation Insights
        predictive = await get_predictive_insights(session, user_id)
        rotation = predictive.get("rotation", {})
        underused = rotation.get("recommended_rotation", [])
        
        if underused:
            title = "Improve Rotation: Wear Underutilized Items"
            if title not in active_titles:
                new_opportunities.append(
                    WardrobeOpportunity(
                        user_id=user_id,
                        title=title,
                        description=f"You have {len(underused)} items that haven't been worn recently. Try incorporating them this week to improve your rotation score.",
                        impact_score=85.0,
                        expires_at=datetime.now(timezone.utc) + timedelta(days=3)
                    )
                )

        # 2. Check Purchase Recommendations
        purchase_data = await get_purchase_recommendations(session, user_id)
        recs = purchase_data.get("recommendations", [])
        
        for rec in recs:
            if rec.get("priority") == "High":
                cat = rec.get("category", "Essential")
                title = f"High ROI Purchase: {cat}"
                if title not in active_titles:
                    new_opportunities.append(
                        WardrobeOpportunity(
                            user_id=user_id,
                            title=title,
                            description=rec.get("reason", f"Adding a {cat} will significantly improve your wardrobe versatility."),
                            impact_score=92.0,
                            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
                        )
                    )

        if new_opportunities:
            session.add_all(new_opportunities)
            await session.commit()

        # 3. Cleanup expired
        await self._cleanup_expired(session, user_id)

    async def _cleanup_expired(self, session: AsyncSession, user_id: uuid.UUID):
        now = datetime.now(timezone.utc)
        stmt = (
            update(WardrobeOpportunity)
            .where(
                WardrobeOpportunity.user_id == user_id,
                WardrobeOpportunity.status == "active",
                WardrobeOpportunity.expires_at < now
            )
            .values(status="expired")
        )
        await session.execute(stmt)
        await session.commit()

opportunity_engine = OpportunityEngine()
