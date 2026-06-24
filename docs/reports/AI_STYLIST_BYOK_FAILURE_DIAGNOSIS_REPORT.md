# AI Stylist BYOK Failure Diagnosis Report

## Goal
Diagnose why AI Stylist Chat fails to generate replies despite the user's Gemini key being verified and stored successfully.

---

## Testing & Diagnosis

### Exact User Flow Tested
1. Logged into the frontend as a test user with a verified Gemini API key.
2. Navigated to AI Stylist Chat (`http://localhost:3000/stylist`).
3. Sent a message: `"Suggest a casual outfit."`
4. Observed network request, backend logs, and frontend state.

### Endpoint Information
- **Frontend Route Tested:** `/stylist`
- **Backend Endpoint Hit:** `POST /api/chat/sessions/{session_id}/messages`

### 1. The Immediate Failure (From the User's Manual Run)
During the manual test run, the frontend did not generate a reply because the API call completely failed.

- **Request Status Code:** `500 Internal Server Error`
- **Response Error Body:** `{"detail":"Failed to process chat message"}`
- **Browser Console Errors:** `POST /api/chat/sessions/.../messages 500 (Internal Server Error)`
- **Backend Log Snippet:**
  ```text
  [AI_PROVIDER] user_gemini Failed | method=generate_chat_response | provider_used=user_gemini | failover_trigger=ClientError | error=429 RESOURCE_EXHAUSTED. {'error': {'code': 429, 'message': 'You exceeded your current quota...
  [AI_PROVIDER] Switching To nvidia | failover_trigger=ClientError
  [AI_PROVIDER] gemini Non-Retriable Error | method=generate_chat_response | provider_used=gemini | error=400 INVALID_ARGUMENT. {'error': {'code': 400, 'message': 'API key not valid. Please pass a valid API key.'}}
  google.genai.errors.ClientError: 400 INVALID_ARGUMENT
  ```
- **Did `credential_source=user_gemini` appear?** Yes. The system correctly prioritized the user's key first.
- **Did Gemini return success?** No. It returned `429 RESOURCE_EXHAUSTED` (Quota exceeded for the provided API key).

**Why it failed here:**
Because the user's key hit a rate/quota limit (`429`), the system triggered a failover to the platform key. However, because the platform key is mocked/invalid (`400 API key not valid`), the fallback also failed. The exception propagated up, causing a 500 error in the backend, meaning no assistant message was saved to the database.

---

### 2. The Silent Parsing Failure (When the API Succeeds)
Even when the Gemini API works successfully (as verified in my backend integration test), the frontend still fails to present the AI reply correctly due to a silent parsing bug.

- **Request Status Code:** `200 OK`
- **Did Gemini return success?** Yes.
- **The Issue:** Gemini returns the structured JSON response wrapped in Markdown code blocks:
  ```json
  ```json
  {
    "recommendation": "I can help with that! Let me generate a casual outfit...",
    "reasons": []
  }
  ```
  ```

**Why it fails here:**
1. In `stylist_chat_service.py`, `json.loads()` throws a `JSONDecodeError` because of the ````json` Markdown wrapping.
2. The code catches the error and falls back to treating the entire raw Markdown string as the `recommendation`.
3. It returns an empty list `[]` for `actions` and `reasons`.
4. As a result, the frontend receives raw JSON markdown text instead of a formatted reply, and it fails to trigger the outfit generation Action Cards or render the Reasoning UI.

---

## Suspected Root Cause

There are two distinct root causes:
1. **Uncaught Quota/Fallback Errors:** When a user's API key hits `429 RESOURCE_EXHAUSTED` and the platform fallback fails, an unhandled exception bubbles up as a 500 error, crashing the chat session.
2. **Markdown JSON Parsing Bug:** Gemini frequently returns JSON wrapped in ````json` markdown tags. The backend's `json.loads()` fails to strip these tags, causing the JSON decode to fail, which swallows the `reasons` and `actions` data.

## Recommended Fix

1. **Fix the JSON Parsing:** 
   Update `stylist_chat_service.py` to strip Markdown formatting before calling `json.loads()`.
   ```python
   text_to_parse = response["text"].strip()
   if text_to_parse.startswith("```json"):
       text_to_parse = text_to_parse.replace("```json", "", 1)
   if text_to_parse.endswith("```"):
       text_to_parse = text_to_parse[:-3]
   parsed = json.loads(text_to_parse)
   ```
2. **Improve Error Propagation / Failover:** 
   Update `ai_provider_router.py` or the frontend so that if all keys fail due to quota/invalid keys, the frontend receives a clean error (e.g. `402 Payment Required` or `429 Too Many Requests`) informing the user their API key has run out of quota, rather than a generic 500 error.

## Files Likely Needing Changes
1. `backend/app/services/stylist_chat_service.py`
2. `backend/app/services/ai/ai_provider_router.py` (optional, to improve error UX)
