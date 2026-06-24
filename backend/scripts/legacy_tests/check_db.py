import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv('backend/.env')
engine = create_async_engine(os.getenv('DATABASE_URL'))

async def test():
    async with engine.begin() as conn:
        res1 = await conn.execute(text("SELECT email FROM users WHERE email LIKE 'feedback_cert_%'"))
        print('Users:', res1.fetchall())
        
        res2 = await conn.execute(text("SELECT f.rating, f.recommendation_id, r.user_id FROM outfit_feedback f JOIN outfit_recommendations r ON f.recommendation_id = r.id"))
        print('Feedback:', res2.fetchall())
        
        res3 = await conn.execute(text("SELECT * FROM user_feedback_affinities"))
        print('Affinities:', len(res3.fetchall()))

asyncio.run(test())
