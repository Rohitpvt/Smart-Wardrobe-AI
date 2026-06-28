import asyncio
import os
import hashlib
import bcrypt
from app.models.user import User
from app.core.security import hash_password, verify_and_upgrade_password, needs_rehash

class MockDB:
    def add(self, obj):
        pass
    async def commit(self):
        pass
    async def refresh(self, obj):
        pass
    async def rollback(self):
        pass

async def run_tests():
    print("Running Security Tests for Password Hashing Audit and Upgrade...")
    
    db = MockDB()
    plain_pwd = "SecurePassword123!"
        
    # 1. New signup stores bcrypt hash with cost 12
    new_hash = hash_password(plain_pwd)
    assert new_hash.startswith("$2")
    assert "$12$" in new_hash
    assert len(new_hash) == 60
    assert new_hash != plain_pwd
    print("1-3. New hashes are bcrypt cost 12 and not plaintext - PASSED")
    
    # Create a mock user
    user = User(
        email="testhash@example.com",
        first_name="Test",
        last_name="Hash",
        password_hash=new_hash
    )
    
    # 4. Valid login succeeds
    assert await verify_and_upgrade_password(plain_pwd, user, db) == True
    print("4. Valid login succeeds - PASSED")
    
    # 5. Wrong password fails generically
    assert await verify_and_upgrade_password("WrongPassword123!", user, db) == False
    print("5. Wrong password fails - PASSED")
    
    # 7. Low-cost bcrypt upgrades on successful login
    low_cost_salt = bcrypt.gensalt(rounds=10) # cost 10
    low_cost_hash = bcrypt.hashpw(plain_pwd.encode("utf-8"), low_cost_salt).decode("utf-8")
    user.password_hash = low_cost_hash
    assert await verify_and_upgrade_password(plain_pwd, user, db) == True
    assert user.password_hash != low_cost_hash
    assert "$12$" in user.password_hash
    print("7. Low-cost bcrypt upgrades on successful login - PASSED")
    
    # 8. MD5 legacy hash upgrades on successful login
    md5_hash = hashlib.md5(plain_pwd.encode('utf-8')).hexdigest()
    user.password_hash = md5_hash
    assert await verify_and_upgrade_password(plain_pwd, user, db) == True
    assert user.password_hash != md5_hash
    assert "$12$" in user.password_hash
    print("8. MD5 legacy hash upgrades - PASSED")
    
    # 9. SHA-1 legacy hash upgrades on successful login
    sha1_hash = hashlib.sha1(plain_pwd.encode('utf-8')).hexdigest()
    user.password_hash = sha1_hash
    assert await verify_and_upgrade_password(plain_pwd, user, db) == True
    assert user.password_hash != sha1_hash
    assert "$12$" in user.password_hash
    print("9. SHA-1 legacy hash upgrades - PASSED")
    
    # 11. Plaintext migration is disabled by default
    user.password_hash = plain_pwd
    assert await verify_and_upgrade_password(plain_pwd, user, db) == False
    
    # Enable it explicitly to test fallback
    os.environ["ALLOW_LEGACY_PLAINTEXT_PASSWORD_MIGRATION"] = "true"
    assert await verify_and_upgrade_password(plain_pwd, user, db) == True
    assert user.password_hash != plain_pwd
    assert "$12$" in user.password_hash
    os.environ["ALLOW_LEGACY_PLAINTEXT_PASSWORD_MIGRATION"] = "false"
    print("11. Plaintext migration properly guarded - PASSED")
    
    # 10. Unknown hash format fails generically
    user.password_hash = "unknown_weird_hash_format_that_is_not_md5_sha1_or_bcrypt123"
    assert await verify_and_upgrade_password(plain_pwd, user, db) == False
    print("10. Unknown hash format fails safely - PASSED")
    
    print("All backend hashing and legacy migration tests passed!")

if __name__ == "__main__":
    asyncio.run(run_tests())
