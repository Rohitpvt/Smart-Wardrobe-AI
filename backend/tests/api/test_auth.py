import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import User, RefreshToken
from app.core import security
from app.core.config import settings
from app.core.lockout import failed_login_cache
from app.core.rate_limit import limiter

@pytest.fixture(autouse=True)
def clear_lockout_cache():
    failed_login_cache.clear()
    limiter._storage.storage.clear()
    limiter._storage.expirations.clear()

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    email = f"testauth_{uuid.uuid4().hex}@example.com"
    response = await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={
            "email": email,
            "password": "securepassword123",
            "first_name": "Test",
            "last_name": "User",
            "city": "TestCity",
            "country_code": "TC"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert "id" in data

@pytest.mark.asyncio
async def test_register_duplicate_user(client: AsyncClient, db: AsyncSession):
    email = f"dup_{uuid.uuid4().hex}@example.com"
    # Register first
    await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "securepassword123", "first_name": "D", "last_name": "U"}
    )
    # Register again
    response = await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "securepassword123", "first_name": "D", "last_name": "U"}
    )
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    email = f"login_{uuid.uuid4().hex}@example.com"
    # Register
    await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "securepassword123", "first_name": "L", "last_name": "O"}
    )
    # Login
    response = await client.post(
        f"{settings.API_PREFIX}/auth/login",
        json={"email": email, "password": "securepassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    # Check HttpOnly cookie
    assert "refresh_token" in response.cookies

@pytest.mark.asyncio
async def test_account_lockout(client: AsyncClient):
    email = "lockout@example.com"
    await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "securepassword123", "first_name": "L", "last_name": "O"}
    )
    
    # Fail 5 times
    for _ in range(5):
        response = await client.post(f"{settings.API_PREFIX}/auth/login", json={"email": email, "password": "wrongpassword"})
        assert response.status_code == 401
        
    # The 6th attempt with correct password should also fail
    response = await client.post(f"{settings.API_PREFIX}/auth/login", json={"email": email, "password": "securepassword123"})
    assert response.status_code in [401, 429]

@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    email = f"refresh_{uuid.uuid4().hex}@example.com"
    await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "securepassword123", "first_name": "R", "last_name": "E"}
    )
    login_response = await client.post(
        f"{settings.API_PREFIX}/auth/login",
        json={"email": email, "password": "securepassword123"}
    )
    assert login_response.status_code == 200
    
    # Refresh
    refresh_response = await client.post(f"{settings.API_PREFIX}/auth/refresh")
    assert refresh_response.status_code == 200
    data = refresh_response.json()
    assert "access_token" in data
    assert data["access_token"] != login_response.json()["access_token"]

@pytest.mark.asyncio
async def test_logout(client: AsyncClient, db: AsyncSession):
    email = f"logout_{uuid.uuid4().hex}@example.com"
    await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "securepassword123", "first_name": "L", "last_name": "O"}
    )
    login_response = await client.post(
        f"{settings.API_PREFIX}/auth/login",
        json={"email": email, "password": "securepassword123"}
    )
    assert login_response.status_code == 200
    
    logout_response = await client.post(f"{settings.API_PREFIX}/auth/logout")
    assert logout_response.status_code == 200
    
    # Try refresh, should fail
    refresh_response = await client.post(f"{settings.API_PREFIX}/auth/refresh")
    assert refresh_response.status_code == 401

@pytest.mark.asyncio
async def test_update_profile(client: AsyncClient):
    email = f"prof_{uuid.uuid4().hex}@example.com"
    await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "securepassword123", "first_name": "Old", "last_name": "Name"}
    )
    login_response = await client.post(
        f"{settings.API_PREFIX}/auth/login",
        json={"email": email, "password": "securepassword123"}
    )
    token = login_response.json()["access_token"]
    
    update_response = await client.put(
        f"{settings.API_PREFIX}/users/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"first_name": "New", "city": "NewCity"}
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["first_name"] == "New"
    assert data["last_name"] == "Name" # unchanged
    assert data["city"] == "NewCity"

@pytest.mark.asyncio
async def test_change_password(client: AsyncClient, db: AsyncSession):
    email = f"pass_{uuid.uuid4().hex}@example.com"
    await client.post(
        f"{settings.API_PREFIX}/auth/register",
        json={"email": email, "password": "oldpassword123", "first_name": "P", "last_name": "W"}
    )
    login_response = await client.post(
        f"{settings.API_PREFIX}/auth/login",
        json={"email": email, "password": "oldpassword123"}
    )
    token = login_response.json()["access_token"]
    
    # Change password
    change_response = await client.put(
        f"{settings.API_PREFIX}/users/password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "oldpassword123", "new_password": "newpassword123"}
    )
    assert change_response.status_code == 200
    
    # Old refresh token should be revoked
    refresh_response = await client.post(f"{settings.API_PREFIX}/auth/refresh")
    assert refresh_response.status_code == 401
    
    # Login with new password
    new_login = await client.post(
        f"{settings.API_PREFIX}/auth/login",
        json={"email": email, "password": "newpassword123"}
    )
    assert new_login.status_code == 200
