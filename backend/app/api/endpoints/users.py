from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core import security
from app.models import User, RefreshToken
from app.models.user_preference import UserPreference
from app.schemas import UserRead, UserUpdate, UserChangePassword
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Fetch styling preference
    pref_query = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
    pref = pref_query.scalar_one_or_none()
    current_user.styling_preference = pref.styling_preference if pref else "neutral"
    return current_user

@router.put("/profile", response_model=UserRead)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)
    
    pref_val = update_data.pop("styling_preference", None)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    db.add(current_user)
    
    if pref_val:
        pref_query = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
        pref = pref_query.scalar_one_or_none()
        if pref:
            pref.styling_preference = pref_val
        else:
            pref = UserPreference(user_id=current_user.id, styling_preference=pref_val)
            db.add(pref)
            
    await db.commit()
    await db.refresh(current_user)
    
    # Reload styling preference for the response
    pref_query = await db.execute(select(UserPreference).where(UserPreference.user_id == current_user.id))
    pref = pref_query.scalar_one_or_none()
    current_user.styling_preference = pref.styling_preference if pref else "neutral"
    
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

from fastapi import File, UploadFile
from app.services.storage import local as storage_service

@router.post("/profile-picture", response_model=UserRead)
async def upload_profile_picture(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    storage_service.validate_upload(image)
    file_path = await storage_service.save_upload(image, current_user.id)
    
    # URL is generated via the uploads endpoint, e.g. /api/uploads/users/{user_id}/{filename}
    # But wait, storage_service.save_file usually returns the relative path "uploads/users/{user_id}/xxx.jpg"
    # Or just the filename. Let's assume it returns relative path and we construct the URL.
    # We can just store the relative path or the full URL.
    # Usually in this codebase it stores relative path or URL. Let's store the URL format.
    # Wait, the frontend might expect a specific format. Let's just store the file_path directly.
    # Actually, let's look at how ClothingItem stores image_url.
    
    current_user.profile_image_url = f"/api/{file_path}" if not file_path.startswith("/api/") else file_path
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.delete("/profile-picture", response_model=UserRead)
async def delete_profile_picture(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Optional: Delete file from storage service here.
    current_user.profile_image_url = None
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
