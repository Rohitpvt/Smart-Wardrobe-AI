# Smart Wardrobe AI

**Smart Wardrobe AI** is a full-stack, AI-powered clothing analyzer and digital wardrobe manager. It allows users to digitize their closet, receive intelligent outfit recommendations, and track their clothing usage using a sleek, premium dark-mode interface.

---

## 🌟 Key Features

*   **Digital Wardrobe Management**: Upload, categorize, and track clothing items.
*   **AI Image Analysis**: Automatic tagging of clothing type, color, and pattern via AI (Mock, Gemini, or NVIDIA).
*   **Smart Outfit Engine**: Rule-based recommendation engine considering weather, occasion, color harmony, and gender-specific styling.
*   **Weather-Aware Styling**: Outfits customized to your current local weather conditions.
*   **Outfit Tracking**: Save favorite combinations and log worn outfits to track clothing usage statistics.
*   **Advanced Analytics**: Dashboard showing wardrobe breakdowns, rarely used items, and condition reports.
*   **Secure & Private**: Robust JWT authentication, Google OAuth, and secure S3 presigned URLs ensure your wardrobe data is strictly private.

---

## 💻 Tech Stack

### Frontend
*   **Framework**: Next.js 15 (App Router)
*   **Library**: React 19
*   **Language**: TypeScript 5
*   **Styling**: Tailwind CSS v4 (CSS-first config)
*   **Design System**: Custom "Midnight Terminal Glow" UI

### Backend
*   **Framework**: FastAPI 0.115+
*   **Language**: Python 3.11+
*   **Database**: PostgreSQL 15+ (asyncpg)
*   **ORM**: SQLAlchemy 2.0+ & Alembic
*   **Auth**: JWT (JSON Web Tokens) + Google OAuth
*   **Storage**: AWS S3 (Presigned URLs)

---

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v20+)
*   Python (3.11+)
*   PostgreSQL (v15+) or Docker

### 1. Database Setup
Start a PostgreSQL database. You can use Docker:
```bash
docker run --name smart-wardrobe-db -e POSTGRES_USER=smartwardrobe -e POSTGRES_PASSWORD=smartwardrobe123 -e POSTGRES_DB=smart_wardrobe_ai -p 5432:5432 -d postgres:15
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
```

Create your `.env` file:
```bash
cp .env.example .env
# Edit .env with your specific secrets
```

Run database migrations:
```bash
alembic upgrade head
```
*(If `alembic upgrade head` fails due to local env issues, check `migrations/versions/` or create a manual migration script based on `app/models/`)*

Start the development server:
```bash
uvicorn app.main:app --reload
```
The backend API will be available at `http://localhost:8000/api/v1`.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create your `.env.local` file:
```bash
cp .env.example .env.local
# Edit .env.local if your backend URL differs
```

Start the frontend development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 🔑 Environment Variables Guide

### Backend (`backend/.env`)
*   `DATABASE_URL`: Connection string to your PostgreSQL instance.
*   `SECRET_KEY`: A strong, random string for JWT signing.
*   `GOOGLE_CLIENT_ID` / `SECRET`: Credentials for Google OAuth login.
*   `AWS_*`: Your AWS credentials and bucket name for image storage.
*   `AI_PROVIDER`: Choose between `mock`, `gemini`, or `nvidia`.
*   `GEMINI_API_KEY` / `GEMINI_MODEL`: API Key and Model (e.g. `gemini-2.0-flash`) for Google Gemini AI.
*   `WEATHER_PROVIDER`: Choose between `mock` or `openweather`.
*   `OPENWEATHER_API_KEY`: API Key from OpenWeatherMap (if using `openweather`).
*   `CORS_ORIGINS`: Comma-separated list of allowed frontend origins (e.g., `http://localhost:3000`).

### Frontend (`frontend/.env.local`)
*   `NEXT_PUBLIC_API_URL`: The URL of your backend API (e.g., `http://localhost:8000`).

---

## ☁️ AWS S3 Setup

1.  Create a **Private** S3 Bucket. Do not enable public access.
2.  Create an IAM User with programmatic access and attach a policy allowing `s3:PutObject` and `s3:GetObject` on `arn:aws:s3:::YOUR_BUCKET_NAME/*`.
3.  Configure the CORS policy on your S3 bucket to allow direct uploads from your frontend domain.

---

## 🤖 AI Provider Setup

By default, the application runs using a `mock` AI provider, which simulates responses without requiring an API key. 

To use real Google Gemini AI vision analysis:
1.  Get an API key from [Google AI Studio](https://aistudio.google.com/).
2.  Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=your_key_here` in your backend `.env`.
3.  (Optional) Set `GEMINI_MODEL=gemini-2.0-flash`.
4.  Ensure your AWS S3 URLs are valid, as the backend will download them temporarily to send to Gemini.

---

## 🌤️ Weather Provider Setup

By default, the application runs using a `mock` Weather provider.

To use live real-world weather data:
1.  Get a free API key from [OpenWeatherMap](https://openweathermap.org/).
2.  Set `WEATHER_PROVIDER=openweather` and `OPENWEATHER_API_KEY=your_key_here` in your backend `.env`.
3.  The frontend will automatically fetch real-time temperature, humidity, condition, and wind speed.

---

## ✅ Production Checklist

Before deploying, ensure you have configured the following:

- [ ] Set `DATABASE_URL` (Production PostgreSQL instance)
- [ ] Set `SECRET_KEY` (Strong, random string for JWT)
- [ ] Set `GOOGLE_CLIENT_ID`
- [ ] Set `GOOGLE_CLIENT_SECRET`
- [ ] Set `GOOGLE_REDIRECT_URI` (Must match your production domain, e.g., `https://my-frontend.com/login`)
- [ ] Set `AWS_ACCESS_KEY_ID`
- [ ] Set `AWS_SECRET_ACCESS_KEY`
- [ ] Set `AWS_REGION`
- [ ] Set `AWS_S3_BUCKET_NAME`
- [ ] Set `CORS_ORIGINS` in backend (Your frontend production URL, e.g., `https://my-frontend.com`)
- [ ] Set `NEXT_PUBLIC_API_URL` in frontend (Your backend production URL, e.g., `https://api.my-backend.com`)
- [ ] Configure CORS policy on your S3 bucket
- [ ] Keep S3 bucket private (Block all public access)
- [ ] Never commit `.env` or `.env.local` files to version control

---

## 🚢 Deployment

*   **Frontend**: Recommended deployment via [Vercel](https://vercel.com). Set `NEXT_PUBLIC_API_URL` in the Vercel dashboard.
    *   **Build Command**: `npm run build`
    *   **Start Command**: `npm run start` (if not using Vercel's automatic serverless deployment)
*   **Backend**: Recommended deployment via Render, Railway, or AWS EC2. Ensure you set the `CORS_ORIGINS` environment variable to match your Vercel frontend domain.
    *   **Migration Command**: `alembic upgrade head` (run this before starting the app)
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
*   **Database**: Use a managed PostgreSQL service like Neon, Supabase, or AWS RDS.

See `DEPLOYMENT.md` for more detailed instructions.

---

## 🧪 Testing & Code Quality
The project enforces strict TypeScript checking and ESLint rules. 
To verify frontend stability before deployment:
```bash
cd frontend
npm run lint
npm run build
```
