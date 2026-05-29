# Smart Wardrobe AI | Midnight Fashion Intelligence
![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square) ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)

An AI-powered digital wardrobe and personal stylist built with Next.js and FastAPI. It analyzes clothing images, organizes your closet, and generates weather-aware outfit recommendations.

## 📖 Problem Statement
Managing a physical wardrobe is often chaotic, leading to decision fatigue and forgotten clothing. Existing apps require tedious manual data entry and lack intelligent, context-aware styling advice.

## 💡 Solution Summary
Smart Wardrobe AI leverages NVIDIA's Vision AI models (via NIM API) to automatically categorize clothing uploads and extract visual metadata (color, pattern, material). The integrated recommendation engine then pairs items based on real-time weather data and occasion context, removing the friction of manual outfit planning.

---

## 🌟 Key Features
- **Automated Categorization**: AI vision analysis via NVIDIA NIM extracts type, color, and patterns automatically.
- **Direct-to-S3 Uploads**: Secure image uploading bypassing backend limits via temporary presigned URLs.
- **Real-Time Weather Styling**: Outfit generation adapted to current local temperatures and conditions.
- **Interactive Dashboard**: Filter your wardrobe, track worn items, and view usage analytics.
- **Secure Authentication**: Robust Google OAuth and encrypted JWT token flows.

---

## 📸 Screenshots

*(To be added after deployment - replace with actual screenshots)*
- `![Dashboard view](docs/dashboard.png)`
- `![Wardrobe gallery](docs/wardrobe.png)`
- `![Outfit recommender](docs/recommender.png)`

---

## 💻 Tech Stack
- **Frontend:** Next.js 15, React 19, TailwindCSS, TypeScript.
- **Backend:** FastAPI, Python 3.11, SQLAlchemy (Async), PostgreSQL.
- **Infrastructure:** AWS S3, Render, Vercel.
- **External APIs:** NVIDIA NIM (Llama 3.2 Vision), OpenWeatherMap.

---

## 🔒 Security Highlights
- **Private S3 Architecture**: The AWS S3 bucket is completely locked down. Images are uploaded via expiring `POST` presigned URLs and viewed via short-lived `GET` presigned URLs. Raw S3 links are never exposed.
- **Strong Hashing**: Passwords use `passlib[bcrypt]` with a minimum cost factor of 12.
- **Rate Limiting**: Critical endpoints (`/login`, `/register`, `/presign`) are protected by `slowapi` to prevent brute force attacks.
- **Payload Limits**: FastAPI middleware strictly blocks large payloads (>10MB).
- **IDOR Protections**: All database queries strictly scope down to the authenticated `user_id`.

## 🤖 AI & Integration Highlights
- Utilizes NVIDIA NIM API with OpenAI-compatible chat/completions format for multimodal vision analysis, strictly enforcing structured JSON schema outputs.
- Fallback strategies built-in: Mock providers exist for both AI and Weather allowing seamless local development without needing active API keys.

## 🚀 Architecture & Deployment Highlights
- Cloud-ready FastAPI backend with automated Alembic migrations.
- Configured for seamless deployment across Render (Backend) and Vercel (Frontend).
- Secure CORS policies locked strictly to the live Vercel domain.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+)
- Python (3.11+)
- PostgreSQL (v15+)

### 1. Database Setup
Ensure PostgreSQL is running locally or via Docker:
```bash
docker run --name smart-wardrobe-db -e POSTGRES_USER=smartwardrobe -e POSTGRES_PASSWORD=smartwardrobe123 -e POSTGRES_DB=smart_wardrobe_ai -p 5432:5432 -d postgres:15
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Access the application at `http://localhost:3000`.

---

## 🧪 Final Smoke Test (Demo Instructions)
If you are reviewing this project locally or via the live demo, follow this safe flow:
1. Navigate to the landing page.
2. Register a new account (Use a mock email, do not use your real passwords).
3. Click "Upload" and submit a clear photo of a clothing item.
4. Click "Analyze with AI" and verify the item is successfully tagged.
5. Click "Save Item" and navigate to your Wardrobe to view it.
6. Navigate to the Weather page and enter your current city.
7. Navigate to the Outfit Recommender to generate an outfit based on local weather.
8. Save the recommended outfit and mark it as "Worn".
9. View the Analytics dashboard to see updated usage metrics.

> **Note on Fallbacks**: If you are running locally without API keys, set `AI_PROVIDER=mock` and `WEATHER_PROVIDER=mock` in your backend `.env` file to simulate external service responses.

---

## ⚠️ Known Limitations
While positioned as production-ready, this project retains the following known limitations:
- **Rate Limiting**: Currently utilizes memory-based tracking via `slowapi`; scaling to multiple load-balanced instances requires swapping to a Redis backend.
- **S3 Temp Files**: Unused temporary uploads (images uploaded but not saved) require an automated AWS Lifecycle rule for 24-hour cleanup to prevent storage bloat.
- **Provider Quotas**: Heavy usage of the free tiers for OpenWeatherMap and NVIDIA NIM may occasionally hit rate limits.
- **AI Variability**: NVIDIA vision analysis accuracy depends heavily on the image lighting, angle, and quality.
- **Security**: Upload malware scanning (e.g., via AWS Macie or Lambda triggers) is not yet implemented.

---

## 📚 Documentation
For more detailed instructions, please refer to the following guides:
- [Environment Variables](ENVIRONMENT_VARIABLES.md)
- [Deployment Checklist & Runbook](DEPLOYMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Security Policy](SECURITY.md)
