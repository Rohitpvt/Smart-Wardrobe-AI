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
| `AI_PROVIDER` | AI Provider (`gemini`, `nvidia`, `mock`) | `mock` |
| `GEMINI_API_KEY` | Google Gemini API Key | - |
| `WEATHER_PROVIDER` | Weather Provider (`openweather`, `mock`) | `mock` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API Key | - |
| `GOOGLE_CLIENT_ID` | OAuth Client ID | - |
| `GOOGLE_CLIENT_SECRET` | OAuth Secret | - |

## Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL | `http://localhost:8000/api/v1` |
