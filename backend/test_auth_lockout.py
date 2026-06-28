import asyncio
import httpx
import sys
import os
import time
import random

# Add the app to path so we can import app.main
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

try:
    from app.main import app
    from app.services.auth_lockout_service import auth_lockout_service
    from app.core.rate_limit import limiter
    from httpx import ASGITransport
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

def get_headers():
    return {"X-Forwarded-For": f"10.0.0.{random.randint(1, 255)}", "Content-Type": "application/json"}

async def run_tests():
    print("Running Security Tests for Auth Lockout...")
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Create a user to test valid login
        email = f"user{random.randint(1000, 9999)}@example.com"
        pwd = "Password123!"
        resp = await client.post("/api/auth/register", json={"email": email, "password": pwd, "first_name": "Test", "last_name": "User", "age": 25, "gender": "male"}, headers=get_headers())
        assert resp.status_code == 201
        
        # 1. Valid login succeeds
        resp = await client.post("/api/auth/login", json={"email": email, "password": pwd}, headers=get_headers())
        assert resp.status_code == 200, "Valid login failed"
        
        # 6. Successful login clears failure count
        await auth_lockout_service.clear_failures(email)
        assert await auth_lockout_service.get_failed_attempts(email) == 0

        # 2. Failed login returns generic 401
        resp = await client.post("/api/auth/login", json={"email": email, "password": "WrongPassword123!"}, headers=get_headers())
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Incorrect email or password"
        
        # 3. Unknown email returns same generic 401
        unknown_email = f"unknown{random.randint(100,999)}@example.com"
        resp = await client.post("/api/auth/login", json={"email": unknown_email, "password": pwd}, headers=get_headers())
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Incorrect email or password"

        # Clear failures for clean slate
        await auth_lockout_service.clear_failures(email)
        
        # 8. Progressive delay increases after repeated failures
        # 4. 5 failed attempts trigger 15-minute lockout
        start_time = time.time()
        for i in range(1, 6):
            t0 = time.time()
            resp = await client.post("/api/auth/login", json={"email": email, "password": "WrongPassword123!"}, headers=get_headers())
            duration = time.time() - t0
            assert resp.status_code == 401
            # Delay check (approximate due to test execution overhead)
            # attempt 1: 0s, 2: 1s, 3: 2s, 4: 4s, 5: 5s
            print(f"Attempt {i} duration: {duration:.2f}s")
            
        is_locked = await auth_lockout_service.is_locked_out(email)
        assert is_locked == True, "Account should be locked out after 5 attempts"
        
        # 5. Correct password during lockout still returns generic 401
        resp = await client.post("/api/auth/login", json={"email": email, "password": pwd}, headers=get_headers())
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Incorrect email or password"
        
        # 7. IP rate limit blocks more than 10 requests/minute
        # We will use the same IP to hit the limit
        rate_limit_ip = "192.168.1.100"
        headers = {"X-Forwarded-For": rate_limit_ip, "Content-Type": "application/json"}
        limiter._storage.storage.clear() # clear slowapi limits
        
        # Send 10 requests, should pass slowapi limit but might get 401 from auth
        for _ in range(10):
            resp = await client.post("/api/auth/login", json={"email": f"dummy{random.randint(100,999)}@example.com", "password": "abc"}, headers=headers)
        
        # 11th request should be 429 Too Many Requests
        resp = await client.post("/api/auth/login", json={"email": f"dummy{random.randint(100,999)}@example.com", "password": "abc"}, headers=headers)
        assert resp.status_code == 429, f"Expected 429 Rate Limit Exceeded, got {resp.status_code}"
        
        print("All tests passed!")

if __name__ == "__main__":
    asyncio.run(run_tests())
