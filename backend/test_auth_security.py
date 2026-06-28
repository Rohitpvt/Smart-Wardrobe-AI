import asyncio
import httpx
import sys
import os
import random

# Add the app to path so we can import app.main
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

try:
    from app.main import app
    from app.core.rate_limit import limiter
    
    def clear_limiter():
        limiter._storage.storage.clear()
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

async def run_tests():
    print("Running Security Tests for Auth...")
    
    def get_headers():
        return {"X-Forwarded-For": f"10.0.0.{random.randint(1, 255)}", "Content-Type": "application/json"}
    
    from httpx import ASGITransport
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Invalid email
        resp = await client.post("/api/auth/register", json={"email": "bademail", "password": "Password123!", "first_name": "John", "last_name": "Doe", "age": 25, "gender": "male"}, headers=get_headers())
        clear_limiter()
        assert resp.status_code == 400
        assert resp.json()["detail"] == "Unable to create account with the provided information"
        
        # 2. Email with <script>
        resp = await client.post("/api/auth/register", json={"email": "test<script>@example.com", "password": "Password123!", "first_name": "John", "last_name": "Doe", "age": 25, "gender": "male"}, headers=get_headers())
        clear_limiter()
        assert resp.status_code == 400
        
        # 3. Password with control characters
        resp = await client.post("/api/auth/register", json={"email": "test@example.com", "password": "Password123!\x00", "first_name": "John", "last_name": "Doe", "age": 25, "gender": "male"}, headers=get_headers())
        clear_limiter()
        assert resp.status_code == 400
        
        # 4. Display name with HTML tags
        resp = await client.post("/api/auth/register", json={"email": "test2@example.com", "password": "Password123!", "first_name": "John<b>", "last_name": "Doe", "age": 25, "gender": "male"}, headers=get_headers())
        clear_limiter()
        assert resp.status_code == 400
        
        # 5. Null byte in text field
        resp = await client.post("/api/auth/register", json={"email": "test3@example.com", "password": "Password123!", "first_name": "John\x00", "last_name": "Doe", "age": 25, "gender": "male"}, headers=get_headers())
        clear_limiter()
        assert resp.status_code == 400
        
        # 6. Valid signup still works
        email = f"valid{random.randint(10000, 99999)}@example.com"
        resp = await client.post("/api/auth/register", json={"email": email, "password": "Password123!", "first_name": "John", "last_name": "Doe", "age": 25, "gender": "male"}, headers=get_headers())
        clear_limiter()
        assert resp.status_code == 201, f"Signup failed: {resp.text}"
        
        # 7. Valid login still works
        resp = await client.post("/api/auth/login", json={"email": email, "password": "Password123!"}, headers=get_headers())
        clear_limiter()
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        assert "access_token" in resp.json()
        
        # 8. Invalid login returns generic error
        resp = await client.post("/api/auth/login", json={"email": email, "password": "WrongPassword!"}, headers=get_headers())
        clear_limiter()
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Incorrect email or password"
        
        # 9. Malformed JSON
        resp = await client.post("/api/auth/login", data="this is not json", headers={"X-Forwarded-For": f"10.0.0.{random.randint(1, 255)}", "Content-Type": "application/json"})
        clear_limiter()
        assert resp.status_code == 401
        
        print("All tests passed!")

if __name__ == "__main__":
    asyncio.run(run_tests())
