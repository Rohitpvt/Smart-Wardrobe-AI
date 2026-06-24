# BYOK Gemini Provider Fix Report

## Date: 2026-06-24
## Phase: 9.13.4

---

## Bugs Found & Fixed

### Bug #1 — GeminiProvider Constructor (Critical)

**File:** `backend/app/services/ai/gemini_provider.py` (Line 27)

**Problem:** `GeminiProvider.__init__(self)` did not accept an `api_key` parameter. Calling `GeminiProvider(api_key=user_key)` raised `TypeError: __init__() got an unexpected keyword argument 'api_key'`, which was silently caught by `_test_gemini_key()`, making every valid key appear invalid.

**Fix:**
```diff
- def __init__(self):
-     self.client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None
+ def __init__(self, api_key: str | None = None):
+     key = api_key or settings.GEMINI_API_KEY
+     self.client = genai.Client(api_key=key) if key else None
```

**Status:** FIXED

---

### Bug #2 — Double `/api` Prefix (Critical)

**File:** `backend/app/api/endpoints/user_ai_keys.py` (Line 19)

**Problem:** The router defined `prefix="/api/user-ai-keys"` but `main.py` already mounts it with `prefix=settings.API_PREFIX` (which is `/api`). This created URLs at `/api/api/user-ai-keys/*` instead of `/api/user-ai-keys/*`, causing 404 responses.

**Fix:**
```diff
- router = APIRouter(prefix="/api/user-ai-keys", tags=["User AI Keys"])
+ router = APIRouter(prefix="/user-ai-keys", tags=["User AI Keys"])
```

**Status:** FIXED

---

### Bug #3 — Transient Error Misclassification (Medium)

**File:** `backend/app/api/endpoints/user_ai_keys.py` (Lines 34-72)

**Problem:** `_test_gemini_key()` treated ALL exceptions as "invalid key", including Google API transient errors (503 Service Unavailable, 429 Rate Limit). This caused valid keys to be rejected during Google API outages or high-demand periods.

**Fix:** Rewrote `_test_gemini_key()` to return a `tuple[bool, str | None]` distinguishing:
- `(True, None)` — key valid and working
- `(False, "invalid")` — auth errors (401/403/400), key is truly invalid
- `(False, "transient")` — server errors (503/429/502/504), key saved optimistically

**Status:** FIXED

---

## API Verification Results

| Test | Endpoint | Expected | Actual | Status |
|------|----------|----------|--------|--------|
| Status (no key) | `GET /api/user-ai-keys/status` | 200, connected=false | 200, `connected:false` | PASS |
| Invalid key | `POST /api/user-ai-keys/gemini` | 400, rejected | 400, `invalid or lacks permissions` | PASS |
| Valid key | `POST /api/user-ai-keys/gemini` | 200, connected=true | 200, `connected:true, fingerprint:AQ.A...0grg` | PASS |
| Status (with key) | `GET /api/user-ai-keys/status` | 200, connected=true, fingerprint | 200, `key_fingerprint:AQ.A...0grg` | PASS |
| Test Connection (503) | `POST /api/user-ai-keys/gemini/test` | 503, key kept active | 503, `Google API temporarily unavailable` | PASS |
| Delete key | `DELETE /api/user-ai-keys/gemini` | 200, deleted | 200, `Key deleted successfully` | PASS |
| Status (after delete) | `GET /api/user-ai-keys/status` | 200, connected=false | 200, `connected:false` | PASS |

---

## Security Observations

| Check | Result |
|-------|--------|
| Plaintext key in API responses | Not present — only fingerprint shown |
| Plaintext key in backend logs | Not present — only error type/message logged |
| Key encrypted in database | Fernet encryption via encryption_service |
| No API key logged by logger | Verified in backend log output |

---

## BYOK Priority Chain (Verified)

```
1. User Gemini API key (user_gemini)      — FIRST PRIORITY
2. Platform Gemini key (if PLATFORM_AI_FALLBACK_ENABLED=true)
3. Platform NVIDIA key (if PLATFORM_AI_FALLBACK_ENABLED=true)
4. HTTPException 403 with ai_access_required
```

---

## Test Users Used

| Email | Purpose |
|-------|---------|
| byok_test_5@example.com | API-level verification of all BYOK endpoints |

---

## Files Modified

| File | Change |
|------|--------|
| `backend/app/services/ai/gemini_provider.py` | Added `api_key` parameter to `__init__` |
| `backend/app/api/endpoints/user_ai_keys.py` | Fixed router prefix, rewrote `_test_gemini_key()`, updated error handling |

---

## Note on Google API 503

During testing, Google's `gemini-2.5-flash` model returned `503 Service Unavailable` ("This model is currently experiencing high demand"). This is a transient Google-side issue, not a bug in Smart Wardrobe AI. The system now correctly:
1. Accepts the key optimistically during 503 errors
2. Keeps the key active (does not deactivate)
3. Informs the user with a clear message
4. Will work normally once Google's demand normalizes

---

## Final Status

### PASSED

All three bugs have been identified and fixed. The BYOK system correctly:
- Accepts valid keys
- Rejects invalid keys
- Handles transient Google API errors gracefully
- Stores keys encrypted
- Never exposes plaintext keys in responses or logs
- Routes with correct URL paths
