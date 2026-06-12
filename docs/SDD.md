# System Design Document (SDD)

# Smart Wardrobe AI

Version: 1.0
Status: Approved
Owner: Rohit Ghosh

---

# 1. System Overview

Smart Wardrobe AI is a full-stack web application that allows users to:

* Create accounts
* Upload clothing images
* Analyze clothing using Gemini Vision
* Manage a digital wardrobe
* Receive outfit recommendations
* Receive weather-aware suggestions
* Interact with an AI wardrobe assistant

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
FastAPI Backend
│
┌──────┼──────┐
▼      ▼      ▼
PostgreSQL Gemini OpenWeather
Database    API      API

---

# 3. Technology Stack

Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* Shadcn/UI
* TanStack Query
* Axios

Backend

* FastAPI
* SQLAlchemy
* Alembic
* Pydantic
* JWT Authentication
* Python logging (rotating file handler)

Database

* PostgreSQL

AI

* Gemini 2.5 Flash

External Services

* OpenWeather API

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
auth/
users/
wardrobe/
recommendations/
weather/
chat/

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

(auth)
(dashboard)

dashboard/
wardrobe/
recommendations/
chat/
settings/

components/

ui/
dashboard/
wardrobe/
chat/

hooks/

lib/

services/

types/

---

# 5. Database Design

Table: users

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| email         | VARCHAR   |
| password_hash | VARCHAR   |
| first_name    | VARCHAR   |
| last_name     | VARCHAR   |
| created_at    | TIMESTAMP |
| updated_at    | TIMESTAMP |

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

Table: chat_conversations

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| title      | VARCHAR   |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

Table: chat_messages

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| conversation_id | UUID      |
| role            | VARCHAR   |
| content         | TEXT      |
| created_at      | TIMESTAMP |
| updated_at      | TIMESTAMP |

---

Table: refresh_tokens

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| token_hash | TEXT      |
| expires_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# 6. Authentication Design

Authentication Type

JWT

Flow

Register
↓
Login
↓
Access Token
↓
Refresh Token
↓
Protected APIs

Token Lifetimes

Access Token:
15 Minutes

Refresh Token:
7 Days

Refresh Token Storage

Database (refresh_tokens table)

Token Rotation

New token issued on each refresh.
Old token invalidated.

Password Security

bcrypt hashing

---

# 7. Clothing Upload Workflow

Step 1

User uploads image.

Step 2

Backend validates:

* File type
* File size

Allowed Types

* JPG
* PNG
* WEBP

Maximum Size

10 MB

Step 3

Image stored locally.

Storage Path:

uploads/users/{user_id}/{uuid}.{extension}

Filenames are UUID-based to prevent collisions.

Step 4

Gemini analysis triggered.

Step 5

Metadata extracted.

Step 6

Results stored in PostgreSQL.

---

# 8. Pagination Standard

All list endpoints return paginated responses.

Request:

* page (default: 1)
* page_size (default: 20, max: 100)

Response:

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

Applies To:

* GET /api/wardrobe
* GET /api/chat/history
* GET /api/recommendations

---

# 8. AI Analysis Workflow

Gemini receives image.

Expected Output:

{
"type": "",
"category": "",
"color": "",
"pattern": "",
"material": "",
"season": ""
}

Important Rules

* JSON only response
* No markdown
* No explanations
* Store result permanently

Re-analysis only if image changes.

---

# 9. Outfit Recommendation Engine

Version 1

Rule-Based System

No AI generation.

Rules:

Topwear
+
Bottomwear
+
Footwear

Filter By:

* Color Compatibility
* Season
* Occasion

Occasions:

* Casual
* College
* Office
* Party
* Formal

Response Time Goal

< 500ms

---

# 10. Weather Recommendation Workflow

Frontend
↓
Backend
↓
OpenWeather API
↓
Current Weather
↓
Recommendation Engine

Examples

Hot Weather

Suggest:

* T-Shirts
* Shorts

Cold Weather

Suggest:

* Jackets
* Hoodies

Rainy Weather

Suggest:

* Waterproof Items

---

# 11. AI Chat Assistant

Purpose

Natural language wardrobe assistant.

Example Queries

"What should I wear today?"

"Show my black shirts."

"Suggest an outfit for college."

Workflow

User Query
↓
Fetch User Wardrobe
↓
Build Context
↓
Send to Gemini
↓
Generate Response

Important

Gemini must receive wardrobe data as context.

Never allow hallucinated clothing items.

Only recommend existing wardrobe items.

---

# 12. API Design

Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/refresh

POST /api/auth/logout

---

Users

GET /api/users/profile

PUT /api/users/profile

PUT /api/users/password

---

Wardrobe

POST /api/wardrobe/upload

GET /api/wardrobe

GET /api/wardrobe/{id}

PUT /api/wardrobe/{id}

DELETE /api/wardrobe/{id}

---

Recommendations

GET /api/recommendations

GET /api/recommendations/weather

---

Chat

POST /api/chat

GET /api/chat/history

---

Dashboard

GET /api/dashboard/stats

---

# 13. Frontend Pages

Public

/ (Landing Page)

/login

/register

---

Protected

/dashboard

/wardrobe

/wardrobe/upload

/recommendations

/chat

/settings

---

# 14. Error Handling

Standard Response Format

{
"success": false,
"message": "",
"error_code": ""
}

Logging

* API errors
* Database errors
* AI errors
* Weather API errors

---

# 15. Security Requirements

JWT Authentication

Password Hashing

Input Validation

File Type Validation

File Size Validation

SQL Injection Protection

CORS Protection

Rate Limiting

Secure Environment Variables

---

# 16. Performance Requirements

Dashboard:
< 2 seconds

API Response:
< 2 seconds

Recommendation Engine:
< 500 ms

Image Analysis:
< 10 seconds

---

# 17. Deployment Architecture

Development

Frontend:
localhost:3000

Backend:
localhost:8000

Database:
localhost:5432

Production (Future)

Frontend:
Vercel

Backend:
Railway or Render

Database:
PostgreSQL Managed Instance

---

# 18. Development Order

Phase 1

Project Setup

Database

Authentication

---

Phase 2

Wardrobe CRUD

Image Upload

Gemini Analysis

---

Phase 3

Dashboard

Filters

Search

---

Phase 4

Recommendation Engine

Weather Integration

---

Phase 5

AI Chat Assistant

Testing

Optimization

---

# 19. Definition of Done

The system is complete when:

✓ Authentication works

✓ Clothing upload works

✓ AI analysis works

✓ Wardrobe CRUD works

✓ Dashboard works

✓ Outfit recommendations work

✓ Weather suggestions work

✓ AI chat assistant works

✓ All APIs documented

✓ All tests pass
