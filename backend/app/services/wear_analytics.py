"""
Wear Pattern Analytics Engine.
Analyzes item usage patterns to surface insights about wardrobe utilization.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from sqlalchemy import select, func, desc, asc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clothing_item import ClothingItem


class WearAnalyticsService:
    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """Compute comprehensive wear analytics for a user's wardrobe."""
        base_filter = ClothingItem.user_id == user_id

        # Most worn (top 5)
        stmt_most = (
            select(ClothingItem)
            .where(and_(base_filter, ClothingItem.worn_count > 0))
            .order_by(desc(ClothingItem.worn_count))
            .limit(5)
        )
        most_worn = (await session.execute(stmt_most)).scalars().all()

        # Least worn with at least 1 wear (bottom 5)
        stmt_least = (
            select(ClothingItem)
            .where(and_(base_filter, ClothingItem.worn_count > 0))
            .order_by(asc(ClothingItem.worn_count))
            .limit(5)
        )
        least_worn = (await session.execute(stmt_least)).scalars().all()

        # Underutilized: never worn or worn < 2 times and purchased > 30 days ago
        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        stmt_underutil = (
            select(ClothingItem)
            .where(
                and_(
                    base_filter,
                    ClothingItem.worn_count < 2,
                    ClothingItem.created_at <= cutoff,
                )
            )
            .order_by(asc(ClothingItem.worn_count))
            .limit(10)
        )
        underutilized = (await session.execute(stmt_underutil)).scalars().all()

        # Favorite colors (top 5 by item count)
        stmt_colors = (
            select(ClothingItem.color, func.count(ClothingItem.id).label("cnt"))
            .where(base_filter)
            .group_by(ClothingItem.color)
            .order_by(desc("cnt"))
            .limit(5)
        )
        fav_colors = [
            {"name": row[0], "count": row[1]}
            for row in (await session.execute(stmt_colors)).all()
        ]

        # Favorite categories (top 5)
        stmt_cats = (
            select(ClothingItem.category, func.count(ClothingItem.id).label("cnt"))
            .where(base_filter)
            .group_by(ClothingItem.category)
            .order_by(desc("cnt"))
            .limit(5)
        )
        fav_categories = [
            {"name": row[0], "count": row[1]}
            for row in (await session.execute(stmt_cats)).all()
        ]

        # Wear trends by category (total worn_count per category)
        stmt_trends = (
            select(
                ClothingItem.category,
                func.sum(ClothingItem.worn_count).label("total_wears"),
                func.count(ClothingItem.id).label("item_count"),
            )
            .where(base_filter)
            .group_by(ClothingItem.category)
        )
        trends_raw = (await session.execute(stmt_trends)).all()
        wear_trends = {
            row[0]: {"total_wears": int(row[1] or 0), "item_count": row[2]}
            for row in trends_raw
        }

        return {
            "most_worn": most_worn,
            "least_worn": least_worn,
            "underutilized_items": underutilized,
            "favorite_colors": fav_colors,
            "favorite_categories": fav_categories,
            "wear_trends": wear_trends,
        }


wear_analytics_service = WearAnalyticsService()
