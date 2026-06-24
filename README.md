# Smart Wardrobe AI

An intelligent, AI-powered wardrobe management and styling platform.

## Features
- **Wardrobe Intelligence:** Upload and categorize your clothing. Let AI automatically detect categories, colors, and styling contexts.
- **Daily AI Stylist:** Receive contextual outfit recommendations based on local weather (`OpenWeather`), the occasion, and your fashion preferences.
- **Style Memory:** An interactive feedback engine that remembers what you like, adjusting future recommendations accordingly.
- **Shopping Intelligence:** Upload items you're considering buying and receive immediate compatibility scores with your existing closet.
- **Predictive Stylist:** AI gracefully falls back (Gemini to NVIDIA NIM) for maximum uptime.
- **Admin Dashboard & Quotas:** Comprehensive tracking of AI token usage, costs, and plan-based quotas (Free, Premium, Pro) natively built-in.
- **Google OAuth Integration:** Secure, seamless one-click login via Google.

## Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy (Async), PostgreSQL (Neon), Alembic
- **Frontend:** Next.js 14, React 18, Tailwind CSS, React Query
- **AI Providers:** Google Gemini (Primary), NVIDIA NIM (Fallback)

---

## 🚀 Quick Start Guide

### 1. Database Setup
Ensure you have a PostgreSQL database running (locally or via Neon).

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Edit .env with your DATABASE_URL, SECRET_KEY, and GEMINI_API_KEY

# Run Migrations
alembic upgrade head

# Start the Backend
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure Environment
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the Frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🛠 Documentation & Guides
- **[Developer Setup Guide](docs/SETUP_GUIDE.md):** Detailed step-by-step instructions for local development, creating test users, and running smoke tests.
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md):** Pre-flight checklists for deploying to production.
- **[Browser Verification Checklist](docs/FINAL_BROWSER_CHECKLIST.md):** Manual QA checklist to ensure full system functionality.

---

## 🚨 Production Deployment Notes
Before deploying to production, you **must**:
1. Run `python backend/scripts/verify_env_health.py` to ensure all necessary API keys and secrets are present.
2. Change the `SECRET_KEY` to a securely generated hash.
3. Configure your allowed `FRONTEND_URLS` in the backend `.env` to prevent unauthorized CORS requests.
4. Set up Google Cloud Console OAuth consent screens and redirect URIs.

See the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for full instructions.
