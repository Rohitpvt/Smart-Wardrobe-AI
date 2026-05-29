# Environment Variables

## Backend (`backend/.env`)

| Variable | Description | Safe Default / Example |
|---|---|---|
| `DATABASE_URL` | Database connection string. Must use `postgresql+asyncpg://` | `postgresql+asyncpg://user:pass@host/db` |
| `SECRET_KEY` | JWT Secret Key | `your-secret-key` |
| `ALGORITHM` | JWT Algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| JWT Expiration Time | `43200` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:3000` |
| `AWS_ACCESS_KEY_ID` | IAM User Access Key | - |
| `AWS_SECRET_ACCESS_KEY`| IAM User Secret Key | - |
| `AWS_REGION` | S3 Bucket Region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | S3 Bucket Name | `my-wardrobe-bucket` |
| `AI_PROVIDER` | AI Provider (`nvidia`, `mock`) | `nvidia` |
| `NVIDIA_API_KEY` | NVIDIA NIM API Key (from build.nvidia.com) | `nvapi-********` |
| `NVIDIA_BASE_URL` | NVIDIA NIM endpoint URL | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | Vision-capable model ID | `meta/llama-3.2-11b-vision-instruct` |
| `WEATHER_PROVIDER` | Weather Provider (`openweather`, `mock`) | `mock` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API Key | - |
| `GOOGLE_CLIENT_ID` | OAuth Client ID | - |
| `GOOGLE_CLIENT_SECRET` | OAuth Secret | - |

> **Note:** `GEMINI_API_KEY` and `GEMINI_MODEL` are deprecated. The Gemini provider was removed due to free-tier quota exhaustion. NVIDIA is now the production AI provider.

> **Security:** `NVIDIA_API_KEY` must only exist in the backend `.env` file or hosting provider (Render/Railway) environment variables. It must never be committed to Git or exposed to the frontend.

## Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL | `http://localhost:8000/api/v1` |
