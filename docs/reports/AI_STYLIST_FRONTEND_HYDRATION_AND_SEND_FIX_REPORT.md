# AI Stylist Frontend Hydration and Send Fix Report

**Date:** 2026-06-25
**Status:** PASSED

---

## Summary

Fixed two critical issues in the AI Stylist (`/stylist`) page:
1. **Nested `<button>` hydration error** — HTML spec violation causing a React hydration warning overlay.
2. **Chat message send failure** — user Gemini key quota error (429) was being swallowed by a platform fallback failure (400), resulting in a generic "Failed to send message" toast and no error card.

---

## Root Cause Analysis

### 1. Nested Button Error

**Root cause:** In `stylist-client.tsx`, the conversation list rendered each session row as an outer `<button>` element (line 71) with an inner delete `<button>` element (line 90). The HTML specification forbids `<button>` as a descendant of `<button>`.

React's hydration validation detected this and displayed the error overlay:
```text
In HTML, <button> cannot be a descendant of <button>.
This will cause a hydration error.
```

### 2. Chat Message Failure

**Root cause:** A chain of three failures in the BYOK error propagation path:

1. **User Gemini key** returned `429 RESOURCE_EXHAUSTED` (quota exceeded).
2. The AI provider router correctly classified this as `user_ai_quota_exceeded` and triggered failover.
3. **Platform Gemini key** (fallback) returned `400 INVALID_ARGUMENT: API key not valid` (mocked/expired platform key).
4. The router correctly classified this as non-retriable (`_is_failover_eligible` → False).
5. **BUG:** At line 324 of `ai_provider_router.py`, the BYOK error was only raised `if provider_name == "user_gemini"`, but at this point `provider_name` was `"gemini"` (the platform fallback). So the raw `ClientError` exception was raised instead.
6. The chat endpoint's `except Exception` handler (line 103) caught this and converted it to a generic `HTTPException(500, "Failed to process chat message")`.
7. The frontend's `onError` handler showed the generic toast: "Failed to send message. Please try again."

**Additional factor:** The Axios client had a 10-second timeout (`timeout: 10000`), while AI chat calls can take up to 15 seconds. This could cause a client-side timeout before the server responds.

---

## Files Changed

### Frontend

| File | Change |
|------|--------|
| `frontend/src/app/(dashboard)/stylist/stylist-client.tsx` | Replaced outer `<button>` with `<div role="button" tabIndex={0}>` for conversation list items. Added Enter/Space keyboard handling. Inner delete `<button>` remains unchanged. |
| `frontend/src/hooks/use-chat.ts` | Replaced generic toast with BYOK-aware error messages: quota, invalid key, Gemini busy, timeout. |
| `frontend/src/lib/axios.ts` | Increased Axios timeout from 10s to 30s to allow AI chat calls to complete. |
| `frontend/.env.example` | Updated `NEXT_PUBLIC_API_URL` to include `/api` suffix and added production deployment notes. |

### Backend

| File | Change |
|------|--------|
| `backend/app/services/ai/ai_provider_router.py` | Fixed BYOK error preservation: when platform fallback fails after a user key failure, the user's original error classification (e.g. quota exceeded) is now surfaced instead of the raw platform error. Applied at both non-retriable (line 324) and all-providers-exhausted (line 356) paths. |
| `backend/app/services/stylist_chat_service.py` | Removed test hooks (`test 429`, `test 403`, `test 503`, `test markdown`) that should not be in production code. |

---

## Chat Endpoint Diagnosis

| Property | Value |
|----------|-------|
| **Endpoint URL** | `POST /api/chat/sessions/{session_id}/messages` |
| **Status Code (before fix)** | `500 Internal Server Error` |
| **Status Code (after fix)** | `429 Too Many Requests` |
| **Response Body (after fix)** | `{"detail": {"status": "user_ai_quota_exceeded", "action": "replace_or_wait", "message": "Your Gemini API key has reached its quota...", "provider": "gemini", "credential_source": "user_gemini"}}` |
| **credential_source** | `user_gemini` ✓ |
| **User Gemini Error** | `429 RESOURCE_EXHAUSTED: You exceeded your current quota` |
| **Platform Gemini Error** | `400 INVALID_ARGUMENT: API key not valid` |

---

## Browser Verification Results

| Test | Result |
|------|--------|
| Nested button hydration error | **NOT PRESENT** ✓ |
| Next.js error overlay | **NOT PRESENT** ✓ |
| User message visible after send | **YES** — "What should I wear tomorrow?" stays visible ✓ |
| BYOK error card displayed | **YES** — "Gemini quota reached" card with quota message ✓ |
| "Manage Gemini Key" button | **YES** — links to `/settings/ai-access` ✓ |
| Generic empty state | **NOT PRESENT** ✓ |
| Generic toast-only failure | **NOT PRESENT** ✓ |
| Backend logs safe routing | **YES** — `credential_source=user_gemini`, `429 Too Many Requests` ✓ |
| No plaintext Gemini key in UI | **CONFIRMED** ✓ |

---

## Production-Safety: Next.js API Rewrite

The `next.config.mjs` rewrite rule is production-safe:
- Derives `apiHost`, `apiProtocol`, `apiPort` from `NEXT_PUBLIC_API_URL` environment variable
- No hardcoded `localhost:8000`
- `.env.example` updated with production deployment guidance
- Fallback uses `http://localhost:8000/api/v1` only when env var is undefined

---

## Screenshots

| Screenshot | Description |
|------------|-------------|
| `stylist_page_loaded_*.png` | AI Stylist page loaded with sidebar conversations, no hydration error |
| `stylist_quota_reached_*.png` | Chat showing user message + "Gemini quota reached" error card |

---

## Security Confirmation

- **PASSED:** No plaintext Gemini API keys appear in the UI, React components, browser console, network responses, or backend logs.
- **PASSED:** The `key_fingerprint` field uses masked format (`AQ.A...0grg`), never the full key.
- **PASSED:** Backend error messages are sanitized — raw API key strings are stripped from error payloads.
- **PASSED:** Test hooks removed from production code.

---

## Final Status

**PASSED**
