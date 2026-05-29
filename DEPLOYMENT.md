# Smart Wardrobe AI - Deployment Guide

This guide covers deploying the Smart Wardrobe AI application to a production environment.

## 1. Frontend Deployment (Vercel)

Vercel is the recommended hosting provider for the Next.js frontend.

1.  Push your code to a GitHub/GitLab/Bitbucket repository.
2.  Import the project into Vercel.
3.  Set the **Framework Preset** to `Next.js`.
4.  Set the **Root Directory** to `frontend`.
5.  Add the following Environment Variables in the Vercel dashboard:
    *   `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://api.smartwardrobe.com`).
    *   `NEXT_PUBLIC_APP_NAME`: `Smart Wardrobe AI`
    *   `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID (if using Google login).
6.  Click **Deploy**.

## 2. Backend Deployment (Render / Railway / EC2)

You can deploy the FastAPI backend to any provider that supports Python web applications or Docker containers.

### Requirements:
*   Python 3.11+
*   PostgreSQL Database
*   AWS S3 Bucket

### Environment Variables for Production
Ensure the following are set in your production environment:
*   `DATABASE_URL`: Connection string provided by your managed PostgreSQL service.
*   `SECRET_KEY`: A strong, randomly generated string.
*   `CORS_ORIGINS`: Your Vercel frontend URL (e.g., `https://smartwardrobe.vercel.app`).
*   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`.
*   Google OAuth secrets and AI Provider keys (if applicable).

### Start Command
If not using Docker, use Uvicorn to run the application in production:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Database Migrations
Before starting the application, ensure migrations are run against the production database:
```bash
alembic upgrade head
```

## 3. Storage (AWS S3)

Ensure your S3 bucket is configured correctly for production:

1.  **Block Public Access**: Keep all public access blocked. The app uses presigned URLs.
2.  **CORS Policy**: Ensure the S3 CORS policy matches your production frontend domain:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["https://your-production-frontend-domain.com"],
        "ExposeHeaders": []
    }
]
```

## 4. Google OAuth Configuration

1.  Go to the Google Cloud Console > APIs & Services > Credentials.
2.  Edit your OAuth 2.0 Client ID.
3.  Add your production frontend domain to **Authorized JavaScript origins**.
4.  Add your production backend domain (or frontend callback route depending on implementation) to **Authorized redirect URIs**.
