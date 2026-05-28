# Smart Wardrobe AI

> AI-powered clothing analyzer and smart wardrobe management application.

A full-stack web application where users can upload clothing images, manage their wardrobe, and receive intelligent outfit recommendations based on weather, season, occasion, color coordination, and personal style preferences.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI, Python 3.11+, SQLAlchemy 2, Alembic |
| Database | PostgreSQL 15+ |
| Storage | AWS S3 (private bucket, presigned URLs) |
| Auth | JWT + Google OAuth |
| AI | Pluggable provider abstraction (Mock → Gemini / NVIDIA NIM / HuggingFace) |

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 15+ (Phase 2+)
- **AWS Account** with S3 access (Phase 2+)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repo-url>
cd "Wardrobe AI"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env with your actual values

# Run the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

**Health Check:** `GET http://localhost:8000/health`

**API Docs (Swagger):** `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local from example
cp .env.example .env.local
# Edit .env.local with your actual values

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Phase 2+ |
| `SECRET_KEY` | JWT signing secret | Phase 2+ |
| `ALGORITHM` | JWT algorithm (default: HS256) | Phase 2+ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL | Phase 2+ |
| `AWS_ACCESS_KEY_ID` | AWS credentials | Phase 2+ |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | Phase 2+ |
| `AWS_REGION` | AWS region | Phase 2+ |
| `AWS_S3_BUCKET` | S3 bucket name | Phase 2+ |
| `AI_PROVIDER` | AI provider name (mock/gemini/nvidia/huggingface) | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Phase 2+ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Phase 2+ |
| `CORS_ORIGINS` | Allowed CORS origins | Yes |

### Frontend (`frontend/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application display name | Yes |

---

## Project Structure

```
Wardrobe AI/
├── DESIGN.md               # UI design system reference
├── PROJECT_MEMORY.md        # Permanent project memory (always read/update)
├── README.md                # This file
├── frontend/                # Next.js frontend
│   ├── src/app/             # App Router pages
│   ├── src/components/      # Reusable components
│   ├── src/lib/             # Utilities and API client
│   └── src/types/           # TypeScript type definitions
└── backend/                 # FastAPI backend
    ├── app/api/             # API endpoints
    ├── app/models/          # SQLAlchemy models
    ├── app/schemas/         # Pydantic schemas
    ├── app/services/        # Business logic & AI providers
    └── migrations/          # Alembic migrations
```

---

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Project scaffolding, landing page, health check |
| Phase 2 | 🔲 Pending | Auth, database, S3 upload, clothing CRUD |
| Phase 3 | 🔲 Pending | AI analysis, recommendations, wardrobe gallery, dashboard |
| Phase 4 | 🔲 Pending | Usage tracking, feedback loop, advanced features |

---

## Design System

The UI follows the **Midnight Terminal Glow** design system defined in `DESIGN.md`:

- Dark charcoal backgrounds (`#27272a`)
- Carbon black cards (`#000000`)
- Cyber cyan accents (`#52e1fe`)
- Inter font for UI, monospace for technical labels
- Translucent borders and subtle glows
- Premium, developer-tool-inspired aesthetic

---

## License

MIT
