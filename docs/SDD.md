# System Design Document (SDD)

# Smart Wardrobe AI

Version: 1.1
Status: Approved
Owner: Rohit Ghosh

---

# 1. System Overview

Smart Wardrobe AI is a full-stack web application that allows users to:

* Create accounts
* Upload clothing images
* Analyze clothing using Vision AI (Primary: BYOK Gemini, Fallback: Platform if enabled)
* Manage a digital wardrobe
* Receive outfit recommendations
* Receive weather-aware suggestions
* Interact with an AI wardrobe assistant
* Access advanced wardrobe intelligence and analytics

Architecture Style:

Monolithic Modular Architecture

Reason:

* Faster MVP development
* Easier maintenance
* Simpler deployment
* Lower infrastructure cost

---

# 2. High-Level Architecture

Frontend (Next.js)
│
▼
Clerk (Identity & Session Management)  ──▶  FastAPI Backend (Webhook Sync & JWT Validation)
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                   PostgreSQL      Gemini     OpenWeather
                    Database        API          API

---

# 3. Technology Stack

Frontend

* Next.js 14/15
* TypeScript
* Tailwind CSS
* Shadcn/UI
* Design System V2
* Premium Skeleton Loaders
* TanStack Query
* Axios
* Clerk `@clerk/nextjs`

Backend

* FastAPI
* SQLAlchemy
* Alembic
* Pydantic
* Clerk `@clerk/backend` for Authentication
* Python logging (rotating file handler)

Database

* PostgreSQL

AI

* Bring Your Own Key (BYOK) Architecture
* AI Provider Router (Gemini Primary, NVIDIA NIM Fallback)
* Fernet AES Encryption for API Keys

External Services

* OpenWeather API
* Geolocation API

---

# 4. Folder Structure

Project Root

smart-wardrobe-ai/

backend/
frontend/
docs/

---

Backend

backend/

app/
  api/
    endpoints/
      users.py
      wardrobe.py
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
    security.py
    database.py

  main.py

tests/

---

Frontend

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

  lib/
  services/
  types/

---

# 5. Database Design

Table: users

| Column                       | Type      | Notes |
| ---------------------------- | --------- | ----- |
| id                           | UUID      |       |
| clerk_user_id                | VARCHAR   | Synced from Clerk |
| email                        | VARCHAR   |       |
| is_active                    | BOOLEAN   |       |
| first_name                   | VARCHAR   |       |
| last_name                    | VARCHAR   |       |
| weather_latitude             | FLOAT     |       |
| weather_longitude            | FLOAT     |       |
| weather_city                 | VARCHAR   |       |
| weather_country              | VARCHAR   |       |
| weather_location_enabled     | BOOLEAN   |       |
| gemini_api_key_encrypted     | BYTEA     | BYOK Feature |
| created_at                   | TIMESTAMP |       |
| updated_at                   | TIMESTAMP |       |

---

Table: clothing_items

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| user_id       | UUID      |
| image_url     | TEXT      |
| name          | VARCHAR   |
| clothing_type | VARCHAR   |
| category      | VARCHAR   |
| color         | VARCHAR   |
| pattern       | VARCHAR   |
| material      | VARCHAR   |
| season        | VARCHAR   |
| brand         | VARCHAR   |
| notes         | TEXT      |
| created_at    | TIMESTAMP |

---

Table: outfit_recommendations

| Column           | Type      |
| ---------------- | --------- |
| id               | UUID      |
| user_id          | UUID      |
| top_item_id      | UUID      |
| bottom_item_id   | UUID      |
| footwear_item_id | UUID      |
| occasion         | VARCHAR   |
| created_at       | TIMESTAMP |

---

Table: chat_conversations & chat_messages

*(Standard chat history storage referencing user_id)*

---

Table: wardrobe_opportunities & wardrobe_goals

*(Intelligence Center tables tracking styling goals and purchasing gaps)*

---

# 6. Authentication Design

Authentication Type

Clerk (OAuth, Email/Password, Magic Links)

Flow

Register/Login via Clerk UI
↓
Clerk issues HttpOnly Session Cookies & short-lived JWTs
↓
Frontend includes session in API requests
↓
Backend validates request using `clerk.verify_token` (JWKS validation)
↓
Protected APIs execute with `current_user` injected

User Synchronization

Clerk Webhook (`user.created`, `user.updated`) -> Backend `/api/webhooks/clerk` -> PostgreSQL `users` table

Media Access Security

Frontend requests a short-lived, cryptographically signed token from Backend -> Token appended to Image URL -> `uploads.py` validates token before serving file (prevents IDOR on images).

---

# 7. Clothing Upload Workflow

Step 1
User uploads image.

Step 2
Backend validates file type (JPG, PNG, WEBP) and size (10 MB).

Step 3
Image stored locally `uploads/users/{user_id}/{uuid}.{extension}`.

Step 4
Gemini analysis triggered via User's BYOK Key.

Step 5
Metadata extracted and stored in PostgreSQL.

---

# 8. Pagination Standard

All list endpoints return paginated responses.

Request: `page`, `page_size`
Response: `{ success: true, data: [], pagination: {...} }`

---

# 9. AI Analysis Workflow

Gemini receives image.
Expected Output: structured JSON matching Wardrobe schemas.

Re-analysis only if image changes.

---

# 10. Outfit Recommendation Engine

Hybrid System
Rule-Based System (Color matrix, Season, Weather, Occasion) for deterministic combination.
AI Generation strictly for styling rationale, explanations, and accessories.

Response Time Goal: < 500ms for rules, < 2s for AI reasoning.

---

# 11. Weather Recommendation Workflow

Frontend -> Backend -> OpenWeather API -> Recommendation Engine

---

# 12. AI Chat Assistant

Purpose: Natural language wardrobe assistant.
Important: Gemini must receive wardrobe data as context. Never allow hallucinated clothing items.

---

# 13. API Design

Authentication (Clerk Webhooks)
POST /api/webhooks/clerk

Users
GET /api/users/profile
PUT /api/users/profile
POST /api/users/ai-key (BYOK)

Wardrobe
POST /api/wardrobe/upload
GET /api/wardrobe
GET /api/wardrobe/{id}
PUT /api/wardrobe/{id}
DELETE /api/wardrobe/{id}

Recommendations & Intelligence
GET /api/recommendations
GET /api/intelligence/dashboard

Chat
POST /api/chat

---

# 14. Frontend Pages

Public: `/`, `/sign-in`, `/sign-up`
Protected: `/dashboard`, `/wardrobe`, `/recommendations`, `/chat`, `/settings`, `/intelligence`

---

# 15. Error Handling

Standard Response Format: `{ success: false, message: "", error_code: "" }`

---

# 16. Security Requirements

Clerk JWT Authentication
Short-Lived Media Tokens (IDOR Prevention)
BYOK AES/Fernet Encryption
Input Validation
File Type/Size Validation
SQL Injection Protection
CORS Protection
Rate Limiting (via Clerk)

---

# 17. Performance Requirements

Dashboard: < 2 seconds
API Response: < 2 seconds
Recommendation Engine: < 500 ms
Image Analysis: < 10 seconds

---

# 18. Deployment Architecture

Frontend: Vercel
Backend: Railway or Render
Database: PostgreSQL Managed Instance

---

# 19. Definition of Done

The system is complete when:

✓ Clerk Authentication and Webhooks work
✓ Clothing upload works with secure media tokens
✓ AI analysis works via BYOK
✓ Wardrobe CRUD works with strict ownership checks
✓ Dashboard and Intelligence Center work
✓ Outfit recommendations work
✓ Weather suggestions work
✓ AI chat assistant works
✓ All tests pass
