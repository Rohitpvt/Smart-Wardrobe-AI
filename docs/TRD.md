# Technical Requirements Document (TRD)

# Smart Wardrobe AI

Version: 1.0

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

* Next.js 15
* TypeScript
* Tailwind CSS
* Shadcn/UI
* TanStack Query
* Axios

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

* JWT Authentication
* Refresh Tokens
* bcrypt Password Hashing

---

## AI

Mandatory:

* AI Provider Router (Gemini 2.5 Flash Primary, NVIDIA NIM Fallback)

Permitted Usage:

* Clothing Analysis
* AI Wardrobe Chat Assistant

Prohibited Usage:

* Wardrobe CRUD
* Search
* Filtering
* Dashboard Statistics
* Outfit Recommendation Logic

---

## Weather

Mandatory:

* OpenWeather API

Weather Location Source

User profile fields: city, country_code

User sets city during profile setup or settings.

Weather API called using stored profile location.

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

Frontend
↓
FastAPI Backend
↓
PostgreSQL Database

External Services

* Gemini API
* OpenWeather API

---

Prohibited:

* Microservices
* Service Meshes
* Event-Driven Architecture
* Distributed Systems

---

# 4. Backend Folder Structure

Required Structure

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
database.py
security.py

main.py

tests/

Any deviation requires approval.

---

# 5. Frontend Folder Structure

Required Structure

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

clothing_items.user_id

chat_conversations.user_id

chat_messages.conversation_id

refresh_tokens.user_id

refresh_tokens.token_hash

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

Access Token

15 minutes

Refresh Token

7 days

Password Hashing

bcrypt

Protected Routes

Require valid JWT.

---

Refresh Token Storage

Refresh tokens stored in database table: refresh_tokens

Tokens stored as bcrypt hashes.

Revocation

On logout:
Delete user's refresh token from database.

On password change:
Delete all user's refresh tokens.

Token Rotation

Each refresh request issues a new refresh token and invalidates the old one.

---

User Profile Management

Users may:

* Update first name and last name
* Change password

Password Change Requirements

* Verify current password before accepting new password
* Invalidate all existing refresh tokens on password change

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

Cloud Storage Ready

---

Image Storage Convention

Directory Structure

uploads/
├── users/
│   └── {user_id}/
│       └── {image_filename}

Filename Format

{uuid}.{original_extension}

Example:

a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg

Requirements

* UUID-based filenames to prevent collisions
* Preserve original file extension
* One directory per user
* Serve images via dedicated API endpoint: GET /api/uploads/{user_id}/{filename}
* Strip EXIF metadata on upload for privacy

---

# 10. AI Requirements

Clothing Analysis Workflow

Upload Image
↓
AI Analysis
↓
Structured JSON
↓
Database Storage

---

Required AI Fields

{
"type": "",
"category": "",
"color": "",
"pattern": "",
"material": "",
"season": ""
}

---

Requirements

* JSON output only
* No markdown
* No explanations
* No free-text paragraphs

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

Supported Occasions

* Casual
* College
* Office
* Party
* Formal

Target Response Time

Less than 500ms

---

Color Compatibility Matrix

Minimum supported colors and their compatible pairings:

| Color  | Compatible With                    |
| ------ | ---------------------------------- |
| Black  | White, Grey, Blue, Beige, Red      |
| White  | Black, Blue, Grey, Beige, Brown    |
| Blue   | White, Black, Grey, Beige, Brown   |
| Grey   | Black, White, Blue, Beige          |
| Beige  | Black, White, Blue, Grey, Brown    |
| Brown  | White, Blue, Beige                 |

Usage Rule

Recommendation engine must validate color compatibility before suggesting outfit combinations.

Colors not in the matrix default to compatible with Black, White, and Grey.

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

* JWT Authentication
* Password Hashing
* Input Validation
* SQL Injection Protection
* XSS Protection
* CORS Configuration
* Environment Variable Protection

---

Account Lockout Policy

* Maximum failed login attempts: 5
* Lockout duration: 15 minutes
* Reset failed attempt counter on successful login
* Lockout tracked per email address
* Return generic error message (do not reveal lockout status)

---

Secrets

Must only exist inside:

.env

Never hardcode:

* API Keys
* Database Credentials
* JWT Secrets

---

# 16. Logging Requirements

Framework

Python standard logging module

Prohibited:

* loguru
* structlog
* Third-party logging libraries

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

Log:

* Authentication Events
* API Errors
* Database Errors
* AI Errors
* Weather API Errors

---

Do Not Log

* Passwords
* Tokens
* API Keys
* Sensitive User Information

---

# 17. Performance Requirements

Dashboard

< 2 seconds

API Response

< 2 seconds

Recommendation Engine

< 500 ms

Image Upload

< 10 seconds

AI Analysis

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

---

Production Ready Targets

Frontend:
Vercel

Backend:
Railway or Render

Database:
Managed PostgreSQL

---

# 20. Prohibited Technologies

The following technologies are prohibited unless explicitly approved:

* Kubernetes
* Docker Swarm
* Redis
* Kafka
* RabbitMQ
* Elasticsearch
* MongoDB
* Firebase Firestore
* Microservices
* GraphQL
* RAG Pipelines
* Vector Databases
* Multi-Agent Systems

---

# 21. AI Development Rules

All AI coding agents must:

* Follow PRD strictly
* Follow SDD strictly
* Follow TRD strictly
* Ask before introducing new technologies
* Ask before changing architecture

Agents must not:

* Overengineer solutions
* Replace approved libraries
* Introduce unnecessary dependencies

---

# 22. Definition of Technical Completion

The system is technically complete when:

✓ Authentication works

✓ Wardrobe CRUD works

✓ Clothing upload works

✓ Gemini analysis works

✓ Dashboard works

✓ Recommendations work

✓ Weather integration works

✓ AI assistant works

✓ User profile management works

✓ Tests pass

✓ Documentation is updated

✓ No critical security issues exist
