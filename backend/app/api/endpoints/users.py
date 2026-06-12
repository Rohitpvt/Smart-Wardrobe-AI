from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core import security
from app.models import User, RefreshToken
from app.schemas import UserRead, UserUpdate, UserChangePassword
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserRead)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.put("/password")
async def change_password(
    password_data: UserChangePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not security.verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
        
    current_user.password_hash = security.hash_password(password_data.new_password)
    db.add(current_user)
    
    # Revoke all active refresh tokens for the user
    stmt = select(RefreshToken).where(RefreshToken.user_id == current_user.id)
    result = await db.execute(stmt)
    tokens = result.scalars().all()
    for token in tokens:
        await db.delete(token)
        
    await db.commit()
    return {"message": "Password updated successfully"}
