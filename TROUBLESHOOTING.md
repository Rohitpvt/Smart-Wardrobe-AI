# Troubleshooting Guide

## Deployment Issues
- **Render Build Fails:** Check if you deployed the root directory instead of `backend/`. Also, ensure Python 3.11 is used.
- **Database Connection Fails:** If you use Neon or Supabase, verify you appended `?ssl=require` to your `DATABASE_URL`. Ensure the scheme is `postgresql+asyncpg://`.

## Feature Issues
- **Upload Fails / CORS Error from S3:** Ensure your S3 CORS policy explicitly lists your frontend domain in `AllowedOrigins` and includes `"PUT"` in `AllowedMethods`.
- **Gemini AI Returns Error:** The API will not fallback to mock silently in production. If you see a 502 Bad Gateway, verify your `GEMINI_API_KEY` is valid and the image was uploaded correctly.
- **Google OAuth Mismatch:** Ensure the OAuth callback URL in Google Cloud Console matches your backend exactly (including trailing slashes).
