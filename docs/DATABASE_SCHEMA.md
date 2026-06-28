# Database Schema Document

# Smart Wardrobe AI

Version: 1.1

Status: Approved

Owner: Rohit Ghosh

Purpose: This document defines the complete database structure for Smart Wardrobe AI Version 1 (MVP), including tables, relationships, indexes, constraints, enums, and data integrity rules.

Database Engine:

PostgreSQL

Primary Key Strategy:

UUID

Naming Convention:

snake_case

Timestamp Standard:

All tables must contain:

* created_at
* updated_at

Timezone Standard:

UTC

---

# 1. Database Overview

The MVP database consists of the following core entities:

1. Users
2. Clothing Items
3. Outfit Recommendations
4. Chat Conversations
5. Chat Messages
6. Wardrobe Opportunities
7. Wardrobe Goals
8. Intelligence Feed Items
9. Weekly Reports
10. Insight Quality Metrics

Relationship Overview

```text
User
│
├── Clothing Items
│
├── Outfit Recommendations
│
├── User Preferences (Deprecated, merged into Users)
│
├── Wardrobe Opportunities
│
├── Wardrobe Goals
│
├── Intelligence Feed Items
│
├── Weekly Reports
│
├── Insight Quality Metrics
│
└── Chat Conversations
        │
        └── Chat Messages
```

---

# 2. Enumerations

## Clothing Category Enum

```text
TOPWEAR
BOTTOMWEAR
FOOTWEAR
OUTERWEAR
ACCESSORY
```

---

## Season Enum

```text
SUMMER
WINTER
SPRING
AUTUMN
ALL_SEASON
```

---

## Occasion Enum

```text
CASUAL
COLLEGE
OFFICE
PARTY
FORMAL
```

---

## Chat Role Enum

```text
USER
ASSISTANT
```

---

# 3. Table: users

Purpose

Stores user account information. Authentication and session management are handled by Clerk, synchronized to this table via webhooks (`clerk_user_id`).

Columns

| Column                       | Type         | Nullable | Notes |
| ---------------------------- | ------------ | -------- | ----- |
| id                           | UUID         | No       |       |
| email                        | VARCHAR(255) | No       | Unique |
| clerk_user_id                | VARCHAR(255) | Yes      | Unique. Synced from Clerk. |
| password_hash                | VARCHAR(255) | Yes      | Deprecated. Handled by Clerk. |
| google_id                    | VARCHAR(255) | Yes      | Unique |
| auth_provider                | VARCHAR(50)  | No       | Default: 'local' |
| is_active                    | BOOLEAN      | No       | Default: True |
| email_verified               | BOOLEAN      | No       | Default: False |
| ai_plan                      | VARCHAR(50)  | No       | Default: 'free' |
| is_admin                     | BOOLEAN      | No       | Default: False |
| first_name                   | VARCHAR(100) | No       |       |
| last_name                    | VARCHAR(100) | Yes      |       |
| city                         | VARCHAR(100) | Yes      |       |
| country_code                 | VARCHAR(10)  | Yes      |       |
| age                          | INTEGER      | Yes      |       |
| gender                       | VARCHAR(50)  | Yes      |       |
| height_cm                    | INTEGER      | Yes      |       |
| body_type                    | VARCHAR(50)  | Yes      |       |
| fashion_experience           | VARCHAR(50)  | Yes      |       |
| primary_style                | VARCHAR(50)  | Yes      |       |
| weather_city                 | VARCHAR(100) | Yes      |       |
| weather_country              | VARCHAR(10)  | Yes      |       |
| weather_latitude             | FLOAT        | Yes      |       |
| weather_longitude            | FLOAT        | Yes      |       |
| weather_location_enabled     | BOOLEAN      | No       | Default: True |
| gemini_api_key_encrypted     | BYTEA        | Yes      | For BYOK feature |
| profile_image_url            | VARCHAR(500) | Yes      |       |
| avatar_url                   | VARCHAR(500) | Yes      |       |
| created_at                   | TIMESTAMP    | No       |       |
| updated_at                   | TIMESTAMP    | No       |       |

Constraints

* Primary Key: id
* Unique: email, clerk_user_id, google_id

Indexes

```sql
users_email_idx
users_clerk_user_id_idx
```

---

# 4. Table: clothing_items

Purpose

Stores all wardrobe items uploaded by users.

Columns

| Column        | Type         | Nullable |
| ------------- | ------------ | -------- |
| id            | UUID         | No       |
| user_id       | UUID         | No       |
| image_url     | TEXT         | No       |
| name          | VARCHAR(255) | No       |
| clothing_type | VARCHAR(100) | No       |
| category      | VARCHAR(50)  | No       |
| color         | VARCHAR(100) | No       |
| pattern       | VARCHAR(100) | Yes      |
| material      | VARCHAR(100) | Yes      |
| season        | VARCHAR(50)  | Yes      |
| brand         | VARCHAR(100) | Yes      |
| notes         | TEXT         | Yes      |
| created_at    | TIMESTAMP    | No       |
| updated_at    | TIMESTAMP    | No       |

Constraints

* Primary Key: id
* Foreign Key: user_id → users.id (CASCADE)

Indexes

```sql
clothing_items_user_id_idx
clothing_items_category_idx
clothing_items_color_idx
```

---

# 5. Table: outfit_recommendations

Purpose

Stores generated outfit combinations.

Columns

| Column           | Type        | Nullable |
| ---------------- | ----------- | -------- |
| id               | UUID        | No       |
| user_id          | UUID        | No       |
| top_item_id      | UUID        | Yes      |
| bottom_item_id   | UUID        | Yes      |
| footwear_item_id | UUID        | Yes      |
| occasion         | VARCHAR(50) | No       |
| created_at       | TIMESTAMP   | No       |
| updated_at       | TIMESTAMP   | No       |

Constraints

* Primary Key: id
* Foreign Key: user_id → users.id (CASCADE)
* Foreign Keys: top_item_id, bottom_item_id, footwear_item_id → clothing_items.id

Indexes

```sql
outfit_recommendations_user_id_idx
```

---

# 6. Table: chat_conversations

Purpose

Stores AI chat sessions.

Columns

| Column     | Type         | Nullable |
| ---------- | ------------ | -------- |
| id         | UUID         | No       |
| user_id    | UUID         | No       |
| title      | VARCHAR(255) | Yes      |
| created_at | TIMESTAMP    | No       |
| updated_at | TIMESTAMP    | No       |

Constraints

* Primary Key: id
* Foreign Key: user_id → users.id (CASCADE)

Indexes

```sql
chat_conversations_user_id_idx
```

---

# 7. Table: chat_messages

Purpose

Stores individual chat messages.

Columns

| Column          | Type        | Nullable |
| --------------- | ----------- | -------- |
| id              | UUID        | No       |
| conversation_id | UUID        | No       |
| role            | VARCHAR(50) | No       |
| content         | TEXT        | No       |
| created_at      | TIMESTAMP   | No       |
| updated_at      | TIMESTAMP   | No       |

Constraints

* Primary Key: id
* Foreign Key: conversation_id → chat_conversations.id (CASCADE)

Indexes

```sql
chat_messages_conversation_id_idx
```

---

# 8. Intelligence Center Tables

## Table: wardrobe_opportunities

Purpose

Stores suggested additions to a user's wardrobe generated by the Intelligence Center.

Columns

| Column          | Type         | Nullable | Notes |
| --------------- | ------------ | -------- | ----- |
| id              | UUID         | No       |       |
| user_id         | UUID         | No       |       |
| type            | VARCHAR(50)  | No       | e.g. "gap_fill", "style_upgrade" |
| title           | VARCHAR(255) | No       |       |
| description     | TEXT         | No       |       |
| recommended_item| VARCHAR(255) | No       |       |
| reason          | TEXT         | No       |       |
| status          | VARCHAR(50)  | No       | e.g. "active", "dismissed" |
| created_at      | TIMESTAMP    | No       |       |
| updated_at      | TIMESTAMP    | No       |       |

Constraints

* Primary Key: id
* Foreign Key: user_id → users.id (CASCADE)

## Table: wardrobe_goals

Purpose

Stores styling and wardrobe goals set by the user or suggested by AI.

Columns

| Column          | Type         | Nullable | Notes |
| --------------- | ------------ | -------- | ----- |
| id              | UUID         | No       |       |
| user_id         | UUID         | No       |       |
| title           | VARCHAR(255) | No       |       |
| description     | TEXT         | No       |       |
| status          | VARCHAR(50)  | No       |       |
| target_date     | TIMESTAMP    | Yes      |       |
| created_at      | TIMESTAMP    | No       |       |
| updated_at      | TIMESTAMP    | No       |       |

Constraints

* Primary Key: id
* Foreign Key: user_id → users.id (CASCADE)

## Table: intelligence_feed_items

Purpose

Stores insights and tips for the user's dashboard feed.

Columns

| Column          | Type         | Nullable | Notes |
| --------------- | ------------ | -------- | ----- |
| id              | UUID         | No       |       |
| user_id         | UUID         | No       |       |
| item_type       | VARCHAR(50)  | No       | e.g. "insight", "tip" |
| content         | TEXT         | No       |       |
| priority        | INTEGER      | No       |       |
| is_read         | BOOLEAN      | No       |       |
| created_at      | TIMESTAMP    | No       |       |
| updated_at      | TIMESTAMP    | No       |       |

Constraints

* Primary Key: id
* Foreign Key: user_id → users.id (CASCADE)

## Table: weekly_reports
*Stores AI-generated weekly summaries for users.*

## Table: insight_quality_metrics
*Stores user feedback (thumbs up/down) on AI generated insights.*

---

# 9. Relationship Diagram

```text
users
│
├── clothing_items (1:N)
│
├── outfit_recommendations (1:N)
│
├── wardrobe_opportunities (1:N)
│
├── wardrobe_goals (1:N)
│
├── intelligence_feed_items (1:N)
│
└── chat_conversations
        │
        └── chat_messages (1:N)
```

---

# 10. UUID Standard

All IDs must use:

```text
UUID Version 4
```

Generated by backend.

Clients must never generate IDs.

---

# 11. Timestamp Standard

All timestamps must use:

```text
TIMESTAMP WITH TIME ZONE
```

Stored in UTC.

Example:

2026-06-12T18:30:00Z

---

# 12. Data Integrity Rules

Users

* Email must be unique.
* Clerk User ID (`clerk_user_id`) must be unique.

Clothing Items

* Must belong to exactly one user.
* Must contain an image and a category.

Recommendations & Intelligence

* Must belong to exactly one user.

Chat

* Messages must belong to exactly one conversation.

---

# 13. Future Expansion Reserved Tables

Reserved for Version 2+:

```text
outfit_calendar
shopping_recommendations
packing_lists
wardrobe_analytics
notifications
```

No migrations should create these tables during MVP development.

---

# 14. Migration Requirements

All schema changes must use:

Alembic

Requirements:

* No manual database edits
* No raw SQL schema changes
* All changes tracked through migrations

---

# 15. MVP Database Completion Checklist

The database layer is considered complete when:

✓ Users table exists and incorporates Clerk Webhooks
✓ Clothing items table exists
✓ Outfit recommendations table exists
✓ Chat conversations and messages tables exist
✓ Intelligence Center tables exist (Opportunities, Goals, Feed)
✓ UUID primary keys implemented
✓ Foreign keys and Cascade rules implemented
✓ Alembic migrations generated
✓ PostgreSQL running successfully
