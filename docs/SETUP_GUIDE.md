# Smart Wardrobe AI — Developer Setup Guide

Follow this guide to set up a full local development environment for Smart Wardrobe AI.

## Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database (local or cloud like Neon)
- Clerk Account (Free Tier) for authentication

---

## 1. Clone the Repository
```bash
git clone <repository-url>
cd wardrobe-ai
```

## 2. Clerk Authentication Setup (Required)
Smart Wardrobe AI uses Clerk for all authentication.
1. Create an application in [Clerk Dashboard](https://dashboard.clerk.com).
2. Grab the Publishable Key and Secret Key.
3. Keep the dashboard open to configure Webhooks later.

## 3. Backend Setup

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
   - `CLERK_SECRET_KEY` (from step 2)
   - `CLERK_WEBHOOK_SECRET` (Use a dummy string like 'whsec_test' until you set up ngrok)
   - `USER_AI_KEY_ENCRYPTION_SECRET` (Required to securely store user API keys. Generate via `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)

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

## 4. Frontend Setup

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
2. Open `.env.local` and add:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from step 2)
   - `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Start the Frontend Server
```bash
npm run dev
```
The application is now running at `http://localhost:3000`.

---

## 5. Webhook Syncing (Local Development)

Because users are created in Clerk, your backend needs to know when they register to create a local `users` row.

1. Install `ngrok` (or similar).
2. Expose your local backend port:
   ```bash
   ngrok http 8000
   ```
3. Copy the ngrok `https` URL.
4. Go to your Clerk Dashboard -> Webhooks -> Add Endpoint.
5. Set the URL to: `<your-ngrok-url>/api/webhooks/clerk`
6. Subscribe to: `user.created`, `user.updated`, `user.deleted`
7. Copy the generated **Signing Secret**.
8. Paste it into your backend `.env` as `CLERK_WEBHOOK_SECRET`.
9. Restart your FastAPI server.

---

## 6. Bootstrapping Your First User

### Create a User Account
1. Open your browser and go to `http://localhost:3000`.
2. Navigate to the Sign Up page and register a new account via the Clerk component.
3. Ensure you see the 200 OK webhook logs in your backend terminal.
4. The user is now synced to your PostgreSQL database.

### Setup Your Gemini API Key (BYOK)
Smart Wardrobe AI uses a Bring Your Own Key model for Gemini AI.
Users must add their own Gemini API key in `/settings/ai-access`.
Clerk login is only for authentication and does not provide Gemini API tokens.
The user’s Gemini quota is managed by Google AI Studio, not by Smart Wardrobe AI.
