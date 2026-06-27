# Smart Wardrobe AI — Developer Setup Guide

Follow this guide to set up a full local development environment for Smart Wardrobe AI.

## Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database (local or cloud like Neon)

---

## 1. Clone the Repository
```bash
git clone <repository-url>
cd wardrobe-ai
```

## 2. Backend Setup

### Create a Virtual Environment
```bash
cd backend
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Configure Environment Variables
1. Copy the template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in:
   - `DATABASE_URL`
   - `SECRET_KEY` (use any string for local dev)
   - `USER_AI_KEY_ENCRYPTION_SECRET` (Required to securely store user API keys)

### Run Database Migrations
```bash
alembic upgrade head
```

### Start the Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```
The API is now running at `http://localhost:8000`. You can view the swagger docs at `http://localhost:8000/docs`.

---

## 3. Frontend Setup

Open a new terminal window.

### Install Dependencies
```bash
cd frontend
npm install
```

### Configure Environment Variables
1. Copy the template:
   ```bash
   cp .env.example .env.local
   ```
2. The default `NEXT_PUBLIC_API_URL=http://localhost:8000` is already correct for local development.

### Start the Frontend Server
```bash
npm run dev
```
The application is now running at `http://localhost:3000`.

---

## 4. Bootstrapping Your First User

### Create a User Account
1. Open your browser and go to `http://localhost:3000`.
2. Navigate to the Sign Up page and register a new account using an email and password.
3. Complete the onboarding flow (sizing, style preferences).

### Promote to Admin (Optional but Recommended)
To view the AI Usage Admin Dashboard, you need admin privileges.
In your backend terminal, run the bootstrap script:
```bash
python scripts/promote_admin.py --email your_registered_email@example.com
```

### Setup Your Gemini API Key (BYOK)
Smart Wardrobe AI uses a Bring Your Own Key model for Gemini AI.
Users must add their own Gemini API key in /settings/ai-access.
Google login is only for authentication and does not provide Gemini API tokens.
The user’s Gemini quota is managed by Google AI Studio, not by Smart Wardrobe AI.

## 5. Verification

You can verify your environment health by running:
```bash
python backend/scripts/verify_env_health.py
```
This script will tell you if any critical environment variables are missing from your `.env` file.
