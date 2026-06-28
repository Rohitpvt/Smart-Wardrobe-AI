# Smart Wardrobe AI — Deployment Guide

This guide provides a platform-neutral checklist for deploying Smart Wardrobe AI to production environments.

---

## 1. Environment Variable Pre-Flight

Before deploying, ensure the production environment contains securely injected secrets. Never commit a `.env` file to version control.

**Critical Variables (Backend):**
- `DATABASE_URL`: Must point to the production PostgreSQL instance.
- `USER_AI_KEY_ENCRYPTION_SECRET`: Must be a secure Fernet key to safely encrypt user API keys.
- `CLERK_SECRET_KEY`: Your production Clerk secret key.
- `CLERK_WEBHOOK_SECRET`: The signing secret from your Clerk Webhook dashboard.
- `FRONTEND_URLS`: A comma-separated list of exact domains allowed to communicate with the backend (e.g., `https://mywardrobe.app`). This secures CORS.

**Critical Variables (Frontend):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your production Clerk publishable key.
- `NEXT_PUBLIC_API_URL`: Points directly to the production backend (e.g., `https://api.mywardrobe.app/api`).

**BYOK Architecture Notice:**
Smart Wardrobe AI uses a Bring Your Own Key model for Gemini AI.
Users must add their own Gemini API key in `/settings/ai-access`.
Clerk login is only for authentication and does not provide Gemini API tokens.
The user’s Gemini quota is managed by Google AI Studio, not by Smart Wardrobe AI.

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
- Ensure `NEXT_PUBLIC_API_URL` points directly to the production backend.

---

## 5. Clerk Authentication Setup

Smart Wardrobe AI uses Clerk for authentication and user management.

1. Navigate to the Clerk Dashboard for your production instance.
2. Ensure your domain is set up correctly in Clerk.
3. Configure **Webhooks** in Clerk:
   - Endpoint URL: `https://api.mywardrobe.app/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the Webhook Signing Secret into your backend `CLERK_WEBHOOK_SECRET` environment variable.
5. Without this webhook, new users will not be synced to the Smart Wardrobe AI database, preventing them from uploading clothes or using AI features.

---

## 6. Post-Deployment Smoke Tests

Once deployed, manually verify the following against the live domains:
1. Load the frontend URL; verify no React hydration errors occur in the console.
2. Hit the backend `/api/health` (if implemented) or root docs `/docs` to verify the server is responding.
3. Register a test user via Clerk and verify the user appears in the local PostgreSQL database (testing webhook synchronization).
4. Upload an image to verify static file serving permissions and media token generation are correct.
5. Generate an outfit recommendation or chat after providing a personal Gemini Key to verify the BYOK flow and AI connection.
