# Database Schema Document

# Smart Wardrobe AI

Version: 1.0

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
6. Refresh Tokens

Relationship Overview

```text
User
│
├── Clothing Items
│
├── Outfit Recommendations
│
├── Refresh Tokens
│
├── User Preferences
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

Stores user account information.

Columns

| Column        | Type         | Nullable |
| ------------- | ------------ | -------- |
| id                       | UUID         | No       |
| email                    | VARCHAR(255) | No       |
| password_hash            | VARCHAR(255) | No       |
| first_name               | VARCHAR(100) | No       |
| last_name                | VARCHAR(100) | No       |
| city                     | VARCHAR(100) | Yes      |
| country_code             | VARCHAR(10)  | Yes      |
| weather_city             | VARCHAR(100) | Yes      |
| weather_country          | VARCHAR(10)  | Yes      |
| weather_latitude         | FLOAT        | Yes      |
| weather_longitude        | FLOAT        | Yes      |
| weather_location_enabled | BOOLEAN      | No       |
| created_at               | TIMESTAMP    | No       |
| updated_at               | TIMESTAMP    | No       |

Constraints

* Primary Key: id
* Unique: email

Indexes

```sql
users_email_idx
```

Relationships

```text
users
│
├── clothing_items
├── outfit_recommendations
└── chat_conversations
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
* Foreign Key: user_id → users.id

Indexes

```sql
clothing_items_user_id_idx
clothing_items_category_idx
clothing_items_color_idx
```

Delete Rule

```text
Delete User
      ↓
Delete Clothing Items
```

(CASCADE)

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

Foreign Keys

```text
user_id
    → users.id

top_item_id
    → clothing_items.id

bottom_item_id
    → clothing_items.id

footwear_item_id
    → clothing_items.id
```

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

Foreign Key

```text
user_id
    → users.id
```

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

Foreign Key

```text
conversation_id
     → chat_conversations.id
```

Indexes

```sql
chat_messages_conversation_id_idx
```

Delete Rule

```text
Delete Conversation
       ↓
Delete Messages
```

(CASCADE)

---

# 8. Table: refresh_tokens

Purpose

Stores active refresh tokens for JWT authentication.

Columns

| Column     | Type                     | Nullable |
| ---------- | ------------------------ | -------- |
| id         | UUID                     | No       |
| user_id    | UUID                     | No       |
| token_hash | TEXT                     | No       |
| expires_at | TIMESTAMP WITH TIME ZONE | No       |
| created_at | TIMESTAMP                | No       |
| updated_at | TIMESTAMP                | No       |

Constraints

* Primary Key: id
* Foreign Key: user_id → users.id

Indexes

```sql
refresh_tokens_user_id_idx
refresh_tokens_token_hash_idx
```

Delete Rule

```text
Delete User
      ↓
Delete Refresh Tokens
```

(CASCADE)

---

# 8b. Table: user_preferences

Purpose

Stores long-term user personalization settings such as styling preference.

Columns

| Column             | Type         | Nullable |
| ------------------ | ------------ | -------- |
| id                 | UUID         | No       |
| user_id            | UUID         | No       |
| styling_preference | VARCHAR(20)  | No       |
| created_at         | TIMESTAMP    | No       |
| updated_at         | TIMESTAMP    | No       |

Constraints

* Primary Key: id
* Foreign Key: user_id → users.id (Unique)

Indexes

```sql
user_preferences_user_id_idx
```

Delete Rule

```text
Delete User
      ↓
Delete User Preferences
```

(CASCADE)

---

# 9. Relationship Diagram

```text
users
│
├── clothing_items
│      (1:N)
│
├── outfit_recommendations
│      (1:N)
│
├── refresh_tokens
│      (1:N)
│
└── chat_conversations
        │
        └── chat_messages
              (1:N)
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
* Email cannot be null.

Clothing Items

* Must belong to exactly one user.
* Must contain an image.
* Must contain a category.

Recommendations

* Must belong to exactly one user.

Chat

* Messages must belong to exactly one conversation.

---

# 13. Future Expansion Reserved Tables

Not implemented in MVP.

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

✓ Users table exists

✓ Clothing items table exists

✓ Outfit recommendations table exists

✓ Chat conversations table exists

✓ Chat messages table exists

✓ Refresh tokens table exists

✓ UUID primary keys implemented

✓ Foreign keys implemented

✓ Cascade rules implemented

✓ Indexes created

✓ Alembic migrations generated

✓ PostgreSQL running successfully
