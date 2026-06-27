# Smart Wardrobe AI — Deployment Guide

This guide provides a platform-neutral checklist for deploying Smart Wardrobe AI to production environments.

---

## 1. Environment Variable Pre-Flight

Before deploying, ensure the production environment contains securely injected secrets. Never commit a `.env` file to version control.

**Critical Variables:**
- `DATABASE_URL`: Must point to the production PostgreSQL instance.
- `SECRET_KEY`: Must be a cryptographically secure, randomly generated hash (min 64 chars). **Never reuse the local dev secret.**
- `USER_AI_KEY_ENCRYPTION_SECRET`: Must be a secure Fernet key to safely encrypt user API keys.
- `FRONTEND_URLS`: A comma-separated list of exact domains allowed to communicate with the backend (e.g., `https://mywardrobe.app`). This secures CORS.

**BYOK Architecture Notice:**
Smart Wardrobe AI uses a Bring Your Own Key model for Gemini AI.
Users must add their own Gemini API key in /settings/ai-access.
Google login is only for authentication and does not provide Gemini API tokens.
The user’s Gemini quota is managed by Google AI Studio, not by Smart Wardrobe AI.

Run the verification script in your CI pipeline if possible:
```bash
python scripts/verify_env_health.py
```

---

## 2. Database Migration Checklist

The production database schema must match the SQLAlchemy models.
Execute Alembic migrations before starting the backend application servers.

```bash
alembic upgrade head
```

*Rollback Note:* If an emergency rollback is required, use `alembic downgrade -1` before rolling back the application code version.

---

## 3. Backend Deployment Checklist

- Ensure the python environment runs with production flags (e.g. `DEBUG=false`).
- Configure a process manager (like Gunicorn with Uvicorn workers) rather than using the raw `uvicorn --reload` dev server.
  Example:
  ```bash
  gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
  ```
- **File Uploads:** By default, images are saved to a local `uploads/` directory. If deploying to a multi-node environment or serverless architecture (like Heroku or AWS ECS), you **must** configure a shared volume, or modify the app to upload to AWS S3 / Google Cloud Storage, otherwise profile pictures and clothing uploads will be lost when containers restart.

---

## 4. Frontend Deployment Checklist

- The frontend requires Node.js to serve the Next.js application, or it can be deployed seamlessly to Vercel.
- Build the production bundle:
  ```bash
  npm run build
  ```
- Start the production server:
  ```bash
  npm start
  ```
- Ensure `NEXT_PUBLIC_API_URL` points directly to the production backend (e.g., `https://api.mywardrobe.app/api`).

---

## 5. Google OAuth Setup (Phase 2)

If utilizing Google OAuth for sign-in:
1. Navigate to the Google Cloud Console.
2. Select your project and go to API & Services > Credentials.
3. Update the **Authorized JavaScript origins** to match your production frontend URL.
4. Update the **Authorized redirect URIs** to match your production frontend redirect paths (e.g., `https://mywardrobe.app/auth/callback`).
5. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are injected into your production backend environment.

---

## 6. Post-Deployment Smoke Tests

Once deployed, manually verify the following against the live domains:
1. Load the frontend URL; verify no React hydration errors occur in the console.
2. Hit the backend `/api/health` (if implemented) or root docs `/docs` to verify the server is responding.
3. Register a test user.
4. Upload an image to verify static file serving permissions are correct.
5. Generate an outfit recommendation after providing a personal Gemini Key to verify AI connection.
