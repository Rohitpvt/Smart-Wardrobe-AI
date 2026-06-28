# Technical Requirements Document (TRD)

# Smart Wardrobe AI

Version: 1.1

Status: Approved

Owner: Rohit Ghosh

Purpose: This document defines all technical requirements, implementation constraints, coding standards, architecture decisions, and development rules for Smart Wardrobe AI. All development must follow this document unless explicitly approved otherwise.

---

# 1. Project Objective

Build a production-quality AI-powered wardrobe management platform that allows users to:

* Upload clothing items
* Automatically analyze garments using AI
* Manage a digital wardrobe
* Generate outfit recommendations
* Receive weather-aware suggestions
* Interact with an AI wardrobe assistant
* Understand their Style DNA and Wardrobe Health

The system must prioritize:

* Simplicity
* Maintainability
* Scalability
* Performance
* Low operational cost

---

# 2. Approved Technology Stack

## Frontend

Mandatory:

* Next.js 14/15
* TypeScript
* Tailwind CSS
* Shadcn/UI
* TanStack Query
* Axios
* Clerk `@clerk/nextjs`

Prohibited:

* Redux
* MobX
* Angular
* Vue
* jQuery

---

## Backend

Mandatory:

* FastAPI
* Python 3.12+
* SQLAlchemy 2.x
* Alembic
* Pydantic v2
* Clerk `@clerk/backend`

Prohibited:

* Django
* Flask
* Node.js Backend
* Express.js

---

## Database

Mandatory:

* PostgreSQL

Prohibited:

* MongoDB
* Firebase Firestore
* SQLite Production Usage

---

## Authentication

Mandatory:

* Clerk (OAuth, Magic Links, Passwords)
* Short-Lived Media Tokens (JWT signed by Backend for IDOR-free image access)
* Webhook User Synchronization

Prohibited:
* Legacy custom JWT Auth
* Storing plaintext passwords

---

## AI

Mandatory:

* Bring Your Own Key (BYOK) Architecture
* AI Provider Router (Gemini Primary, Fallback if enabled)
* AES/Fernet Encryption for User API Keys

Permitted Usage:

* Clothing Analysis
* AI Wardrobe Chat Assistant
* Intelligence Center Analytics
* Accessory Recommendations and Rationale

Prohibited Usage:

* Wardrobe CRUD
* Search
* Filtering
* Dashboard Statistics
* Core Outfit Recommendation Logic (Must remain rule-based)

---

## Weather

Mandatory:

* OpenWeather API

Weather Location Source

User profile fields: weather_latitude, weather_longitude, weather_city, weather_country

User sets location via Browser Geolocation API ("Use My Current Location") or manually in settings.

Weather API called using stored precise coordinates.

---

# 3. Architecture Requirements

Architecture Type:

Monolithic Modular Architecture

Reason:

* Faster MVP development
* Easier deployment
* Lower infrastructure complexity

---

Mandatory Structure:

Frontend (Clerk UI)
↓
FastAPI Backend (Webhook Sync & JWT Validation)
↓
PostgreSQL Database

External Services

* Gemini API
* OpenWeather API
* Clerk API

---

# 4. Backend Folder Structure

Required Structure

backend/
app/
  api/
    endpoints/
      users.py
      wardrobe.py
      recommendations.py
      weather.py
      chat.py
      intelligence.py
      webhooks.py
  models/
  schemas/
  services/
    ai/
    weather/
    storage/
  core/
    config.py
    database.py
    security.py
    lockout.py (Deprecated)
  main.py
tests/

Any deviation requires approval.

---

# 5. Frontend Folder Structure

Required Structure

frontend/
src/
  app/
    (auth)/
    (dashboard)/
      dashboard/
      wardrobe/
      recommendations/
      chat/
      settings/
      intelligence/
  components/
    ui/
    dashboard/
    wardrobe/
    chat/
  hooks/
  services/
  lib/
  types/

---

# 6. Database Standards

Primary Key Type

UUID

Required Fields

created_at
updated_at

Naming Convention

snake_case

Example

user_id
clothing_item_id

---

Foreign Keys

Must be enforced.

---

Indexes

Required on:

users.email
users.clerk_user_id
clothing_items.user_id
chat_conversations.user_id
chat_messages.conversation_id
wardrobe_opportunities.user_id
wardrobe_goals.user_id

---

# 7. API Standards

Architecture

REST API

Response Format

Success

{
"success": true,
"data": {}
}

Failure

{
"success": false,
"message": "",
"error_code": ""
}

---

Requirements

* JSON responses only
* Proper HTTP status codes
* Request validation required
* Response validation required

---

Pagination Standard

All list endpoints must support pagination.

Request Parameters

* page (integer, default: 1)
* page_size (integer, default: 20, max: 100)

Response Format

{
"success": true,
"data": [],
"pagination": {
"page": 1,
"page_size": 20,
"total_items": 0,
"total_pages": 0
}
}

Paginated Endpoints

* GET /api/wardrobe
* GET /api/chat/history
* GET /api/recommendations

---

# 8. Authentication Standards

Identity Provider

Clerk

Protected Routes

Require valid Clerk session, verified by backend using `clerk.verify_token()`.

---

User Profile Management

Users may:

* Update profile details via Clerk Profile components.
* Update their BYOK Gemini key via custom backend endpoints.

---

# 9. File Upload Standards

Allowed Types

* jpg
* jpeg
* png
* webp

Maximum Size

10 MB

Validation Required

* MIME type validation
* Extension validation
* File size validation

---

Storage

Development:
Local File Storage

Production:
Cloud Storage Ready (S3/GCS)

---

Image Storage Convention

Directory Structure

uploads/
├── users/
│   └── {user_id}/
│       └── {image_filename}

Filename Format

{uuid}.{original_extension}

Requirements

* UUID-based filenames to prevent collisions
* Preserve original file extension
* One directory per user
* Serve images via dedicated API endpoint: `GET /api/uploads/{user_id}/{filename}?token={media_token}`
* `media_token` must be cryptographically signed by backend and expire in a short time.
* Strip EXIF metadata on upload for privacy

---

# 10. AI Requirements

Clothing Analysis Workflow

Upload Image
↓
AI Analysis (User Key -> Fallback System Key)
↓
Structured JSON
↓
Database Storage

---

Optimization Rule

Clothing analysis occurs once.
Metadata must be stored permanently.
Never re-analyze existing clothing items unless image changes.

---

# 11. Outfit Recommendation Requirements

Version 1

Rule-Based Engine Only

No LLM-based outfit generation.

Recommendation Inputs

* Clothing Category
* Color Compatibility
* Occasion
* Season

Target Response Time

Less than 500ms

---

# 12. AI Chat Assistant Requirements

Allowed Queries

* What should I wear today?
* Show my black shirts.
* Suggest an outfit for college.
* What matches with blue jeans?

---

Requirements

Assistant must use:

* User wardrobe data
* Weather data when applicable

Assistant must never invent clothing items.

Only existing wardrobe items may be referenced.

---

# 13. Frontend Standards

Language

TypeScript Strict Mode

Required

* Functional Components
* React Hooks
* Reusable Components

---

State Management

Allowed

* React State
* TanStack Query

Prohibited

* Redux
* MobX
* Zustand

---

# 14. Backend Standards

Required

* Type Hints
* Pydantic Validation
* Service Layer Pattern
* Dependency Injection

Prohibited

* Business logic in route handlers
* Raw SQL in API routes

---

# 15. Security Requirements

Mandatory

* Clerk Authentication (OAuth, JWKS)
* Object Ownership validation (`user_id == current_user.id`)
* Media Tokens (IDOR prevention on static files)
* AES/Fernet Encryption for BYOK Keys
* Input Validation
* SQL Injection Protection
* XSS Protection
* CORS Configuration
* Environment Variable Protection

---

Secrets

Must only exist inside:

.env

Never hardcode:

* API Keys
* Database Credentials
* JWT Secrets
* Clerk Secrets

---

# 16. Logging Requirements

Framework

Python standard logging module

Configuration

* Rotating file handler
* Maximum file size: 10 MB
* Retain last 5 log files
* Log format: JSON structured
* Log output: stdout + file

Log Levels

* DEBUG: Development only
* INFO: Authentication events, API requests
* WARNING: Rate limit approaches, deprecated usage
* ERROR: API errors, database errors, AI errors, weather errors
* CRITICAL: System failures

Do Not Log

* Passwords
* Tokens
* API Keys
* Sensitive User Information

---

# 17. Performance Requirements

Dashboard:
< 2 seconds

API Response:
< 2 seconds

Recommendation Engine:
< 500 ms

Image Upload:
< 10 seconds

AI Analysis:
< 10 seconds

---

# 18. Testing Requirements

Backend

* Unit Tests
* API Tests

Frontend

* Component Tests
* Page Tests

---

Minimum Coverage Goal

70%

---

# 19. Deployment Requirements

Development

Frontend:
localhost:3000

Backend:
localhost:8000

Database:
localhost:5432

Production Ready Targets

Frontend:
Vercel

Backend:
Railway or Render

Database:
Managed PostgreSQL

---

# 20. Definition of Done

The system is complete when:

✓ Clerk Authentication works
✓ Clothing upload works with secure media tokens
✓ AI analysis works via BYOK
✓ Wardrobe CRUD works with strict ownership checks
✓ Dashboard and Intelligence Center works
✓ Outfit recommendations work
✓ Weather suggestions work
✓ AI chat assistant works
✓ All APIs documented
✓ All tests pass
