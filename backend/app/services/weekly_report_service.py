import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.intelligence import WeeklyReport
from app.services.dashboard import get_dashboard_intelligence, get_predictive_insights
from app.services.ai_coach_service import ai_coach_service

logger = logging.getLogger(__name__)

class WeeklyReportService:
    async def get_or_generate_report(self, session: AsyncSession, user_id: uuid.UUID) -> Optional[WeeklyReport]:
        """
        Fetches the latest weekly report. If it's older than 7 days, generates a new one.
        """
        stmt = select(WeeklyReport).where(WeeklyReport.user_id == user_id).order_by(WeeklyReport.report_date.desc()).limit(1)
        latest = (await session.execute(stmt)).scalars().first()

        now = datetime.now(timezone.utc)
        
        # Check cache window (7 days)
        if latest:
            # Add timezone awareness if missing for comparison
            latest_date = latest.report_date
            if latest_date.tzinfo is None:
                latest_date = latest_date.replace(tzinfo=timezone.utc)
                
            if (now - latest_date).days < 7:
                return latest

        # Generate new report
        logger.info(f"Generating new Weekly Report for user {user_id}")
        
        # 1. Gather Metrics Snapshot
        dashboard_data = await get_dashboard_intelligence(session, user_id)
        health = dashboard_data.get("health", {})
        predictive = await get_predictive_insights(session, user_id)
        
        snapshot = {
            "rotation_score": predictive.get("rotation", {}).get("rotation_score", 0),
            "efficiency_score": health.get("efficiency_score", 0),
            "average_cpw": health.get("average_cpw", 0),
            "style_dna": predictive.get("style_dna", {})
        }
        
        # 2. Get AI Coaching Advice
        coaching = await ai_coach_service.generate_coaching_insight(
            db=session,
            user_id=user_id,
            context_dict={
                "health": health,
                "predictive": predictive
            }
        )
        
        report = WeeklyReport(
            user_id=user_id,
            report_date=now,
            snapshot_json=snapshot,
            coaching_advice=coaching
        )
        
        session.add(report)
        await session.commit()
        await session.refresh(report)
        return report

weekly_report_service = WeeklyReportService()
