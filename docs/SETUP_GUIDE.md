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
   - `GEMINI_API_KEY` (Required for AI features)

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

### Change AI Plan Quota (Optional)
To test different quota tiers (free, premium, pro):
```bash
python scripts/set_user_ai_plan.py --email your_registered_email@example.com --plan premium
```

---

## 5. Verification

You can verify your environment health by running:
```bash
python backend/scripts/verify_env_health.py
```
This script will tell you if any critical environment variables are missing from your `.env` file.
