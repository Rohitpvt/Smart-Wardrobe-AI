import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.clothing_item import ClothingItem
from app.services.recommendations.engine import outfit_engine
from app.services.weather.provider import WeatherContext

@pytest.mark.asyncio
async def test_large_wardrobe_performance(db: AsyncSession):
    from app.models.user import User
    from app.core.security import hash_password
    user = User(email=f"test_{uuid.uuid4()}@example.com", password_hash=hash_password("test"), first_name="Test", last_name="User")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    user_id = user.id
    
    # Insert 5000 mock items safely
    items = []
    # 1000 tops, 1000 bottoms, 1000 shoes, 2000 accessories
    for i in range(1000):
        items.append(ClothingItem(user_id=user_id, image_url="test", clothing_type="t-shirt", name=f"Top {i}", category="TOPWEAR", color="black", season="ALL_SEASON"))
        items.append(ClothingItem(user_id=user_id, image_url="test", clothing_type="jeans", name=f"Bot {i}", category="BOTTOMWEAR", color="black", season="ALL_SEASON"))
        items.append(ClothingItem(user_id=user_id, image_url="test", clothing_type="sneakers", name=f"Sho {i}", category="FOOTWEAR", color="black", season="ALL_SEASON"))
        items.append(ClothingItem(user_id=user_id, image_url="test", clothing_type="watch", name=f"Acc1 {i}", category="ACCESSORY", color="gold", season="ALL_SEASON"))
        items.append(ClothingItem(user_id=user_id, image_url="test", clothing_type="hat", name=f"Acc2 {i}", category="HEADWEAR", color="black", season="ALL_SEASON"))
        
    db.add_all(items)
    await db.commit()
    
    weather = WeatherContext(temperature_celsius=20, condition="Sunny", city="Paris", weather_used=True)
    
    # Generate outfit, should not crash and should complete efficiently
    import time
    start = time.perf_counter()
    print("Calling generate_outfit...")
    top, bottom, shoe = await outfit_engine.generate_outfit(db, user_id, "CASUAL", weather)
    end = time.perf_counter()
    print(f"generate_outfit took {end - start:.4f} seconds")
    
    assert top is not None
    assert bottom is not None
    assert shoe is not None
    
    # Should resolve within expected query time boundaries
    assert (end - start) < 10.0
    
    # Cleanup
    await db.rollback()
