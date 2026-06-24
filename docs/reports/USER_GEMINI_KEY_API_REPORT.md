# User Gemini Key API Report

## API Design for User-Owned Keys

This report documents the newly introduced REST endpoints managing user Gemini keys within the FastAPI backend.

### Endpoints

#### `GET /api/user-ai-keys/status`
Retrieves the connection status of the authenticated user's Gemini key.
- **Response `200 OK`:**
  ```json
  {
    "gemini": {
      "connected": true,
      "key_fingerprint": "AIzaSy...wxyz",
      "last_verified_at": "2026-06-21T12:00:00Z",
      "last_used_at": "2026-06-21T12:30:00Z",
      "last_error": null
    }
  }
  ```

#### `POST /api/user-ai-keys/gemini`
Submits, tests, encrypts, and stores a new Gemini API key.
- **Payload:**
  ```json
  { "api_key": "AIzaSy..." }
  ```
- **Response `200 OK`:** Status object confirming connection.
- **Response `400 Bad Request`:** If the key is invalid or lacks necessary permissions.

#### `POST /api/user-ai-keys/gemini/test`
Manually triggers a validation request using the stored key.
- **Response `200 OK`:** Updates `last_verified_at` if successful.
- **Response `400 Bad Request`:** Deactivates the key and updates `last_error` if the test fails.

#### `DELETE /api/user-ai-keys/gemini`
Removes the API key completely from the database.
- **Response `200 OK`:** Success message.

### Integration with `AIProviderRouter`
The central AI router dynamically injects the `GeminiProvider` instantiated with the user's decrypted key. If no key is present, the router immediately throws a `403 Forbidden` with a specialized payload (`ai_access_required`) prompting frontend features to display the `AIFeatureLock` component.
