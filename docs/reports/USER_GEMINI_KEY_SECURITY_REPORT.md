# User Gemini Key Security Report

## Overview
Securing user API keys is paramount. The Smart Wardrobe AI platform handles user-provided Gemini API keys through an encrypted pipeline ensuring that keys are protected at rest and during transit.

## Security Measures

### 1. Symmetric Encryption at Rest
- **Algorithm:** Fernet (AES-128-CBC with HMAC-SHA256).
- **Implementation:** `user_ai_key_encryption_service.py` securely encrypts plain text API keys before they touch the database.
- **Secret Management:** Encryption relies on the `USER_AI_KEY_ENCRYPTION_SECRET` environment variable, which is strictly kept out of version control and the codebase.

### 2. Zero-Knowledge Frontend
- The frontend never receives the plain-text API key back from the server after it is submitted.
- The `/status` endpoint only returns a masked **key fingerprint** (e.g., `AIzaSy...XXXX`) and connection status metadata.

### 3. Graceful Deactivation
- In the event of an API key revocation by Google, the system detects `401 Unauthorized` or `403 Forbidden` responses.
- The `ai_provider_router` intercepts these errors, immediately marks the key as `is_active = False`, and records the exact error snippet. This prevents infinite retry loops and alerts the user to update their credentials.

### 4. Key Verification
- When a user submits a key, it is immediately tested against a lightweight Gemini endpoint (`generate_text` with minimal tokens) before being accepted and stored. This prevents garbage data from filling the database.

## Threat Modeling
- **Database Breach:** If the database is compromised, the API keys remain encrypted. The attacker would also need access to the environment variables on the application server.
- **Transit:** All API key transmissions from the client to the server occur over HTTPS, preventing Man-In-The-Middle (MITM) extraction.
