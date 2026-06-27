# Application Flow Document (APP_FLOW)

# Smart Wardrobe AI

Version: 1.0

Status: Approved

Owner: Rohit Ghosh

Purpose: This document defines the complete user journey, page navigation, feature flow, system interactions, AI trigger points, and screen behavior for Smart Wardrobe AI Version 1 (MVP).

---

# 1. Application Overview

Smart Wardrobe AI is a web-based application that allows users to:

* Create accounts
* Upload clothing images
* Automatically analyze garments using AI
* Build a digital wardrobe
* Receive outfit recommendations
* Receive weather-aware clothing suggestions
* Chat with an AI wardrobe assistant
* Access Intelligence Center (Style DNA, Wardrobe Health)
* Track wear history and Cost Per Wear
* View Shopping Intelligence and Predictive Forecasts

This document describes how users interact with the application from entry to exit.

---

# 2. High-Level User Journey

```
Landing Page
      ↓
Register
      ↓
Login
      ↓
Dashboard
      ↓
Upload Clothing
      ↓
AI Analysis
      ↓
Digital Wardrobe
      ↓
Recommendations
      ↓
AI Assistant
      ↓
Logout
```

---

# 3. Application Navigation Structure

```
/
├── Landing Page
│
├── Login
│
├── Register
│
└── Protected Area
    │
    ├── Dashboard
    │
    ├── Wardrobe
    │   ├── Clothing Details
    │   └── Upload Clothing
    │
    ├── Recommendations
    │   └── Build Around Item
    │
    ├── Intelligence Center
    │
    ├── Shopping & Analytics
    │
    ├── AI Assistant
    │
    └── Settings
        ├── Profile & Security
        ├── AI Access (BYOK)
        └── AI Activity
```

---

# 4. Landing Page Flow

Purpose:

Introduce the application and encourage account creation.

Components:

* Navigation Bar
* Hero Section
* Features Section
* Call To Action
* Footer

User Actions:

```
Visit Landing Page
        ↓
Click Register
        ↓
Register Page
```

or

```
Visit Landing Page
        ↓
Click Login
        ↓
Login Page
```

---

# 5. Registration Flow

Purpose:

Create a new user account.

Required Fields:

* First Name
* Last Name
* Email
* Password
* Confirm Password

Flow:

```
Register Form
      ↓
Validation
      ↓
Create Account
      ↓
Success
      ↓
Login Page
```

Validation Rules:

* Email must be unique
* Password minimum 8 characters
* Passwords must match

---

# 6. Login Flow

Purpose:

Authenticate users.

Required Fields:

* Email
* Password

Flow:

```
Login
    ↓
Authentication
    ↓
JWT Issued
    ↓
Dashboard
```

Failure Flow:

```
Login
    ↓
Invalid Credentials
    ↓
Error Message
```

---

# 7. Dashboard Flow

Purpose:

Provide a quick overview of the user's wardrobe.

Components:

* Welcome Header
* Statistics Cards
* Recent Uploads
* Category Breakdown
* Quick Actions
* Weather Summary

Displayed Information:

* Total Clothing Items
* Topwear Count
* Bottomwear Count
* Footwear Count
* Recent Additions

Quick Actions:

* Upload Clothing
* View Wardrobe
* View Recommendations
* Open AI Assistant

Flow:

```
Login
   ↓
Dashboard
   ↓
Choose Action
```

---

# 8. Clothing Upload Flow

Purpose:

Allow users to add clothing items.

Entry Points:

* Dashboard Upload Button
* Wardrobe Upload Button

Flow:

```
Upload Button
      ↓
Select Image
      ↓
Image Preview
      ↓
Upload
      ↓
Backend Validation
      ↓
AI Analysis
      ↓
Metadata Generated
      ↓
Save To Database
      ↓
Wardrobe Page
```

Accepted Formats:

* JPG
* JPEG
* PNG
* WEBP

Maximum File Size:

10 MB

Image Storage Path:

uploads/users/{user_id}/{uuid}.{extension}

Filenames are UUID-based to prevent collisions.

---

# 9. AI Clothing Analysis Flow

Purpose:

Automatically identify clothing attributes.

Triggered By:

* Successful image upload

Flow:

```
Image Upload
      ↓
Vision AI (Primary: Gemini, Fallback: NVIDIA NIM Phi-4)
      ↓
Structured Analysis
      ↓
Database Storage
```

Expected Output:

* Clothing Type
* Category
* Color
* Pattern
* Material
* Season

Important Rule:

Analysis occurs only once.

Previously analyzed items must never be re-analyzed unless the image changes.

---

# 10. Digital Wardrobe Flow

Purpose:

Manage uploaded clothing items.

Components:

* Search Bar
* Filter Panel
* Sort Dropdown
* Clothing Grid
* Upload Button

User Actions:

* View Item
* Edit Item
* Delete Item
* Search Item
* Filter Item

Flow:

```
Wardrobe Page
      ↓
Select Item
      ↓
Item Details
      ↓
Edit or Delete
```

---

# 11. Clothing Details Flow

Purpose:

Display complete information about a clothing item.

Displayed Information:

* Image
* Name
* Type
* Category
* Color
* Pattern
* Material
* Season
* Brand
* Notes
* Date Added

Actions:

* Edit
* Delete
* Return To Wardrobe

---

# 12. Recommendation Flow

Purpose:

Generate outfit recommendations.

Inputs:

* Wardrobe Data
* Occasion
* Weather Conditions

Supported Occasions:

* Casual
* College
* Office
* Party
* Formal

Flow:

```
Recommendations Page
        ↓
Select Occasion
        ↓
Rule Engine
        ↓
Outfit Generated
        ↓
Display Result
```

Output:

* Topwear
* Bottomwear
* Footwear

Important Rule:

Version 1 uses a rule-based engine only.

No AI model may generate outfits.

---

# 12.5 Build Around Item Flow

Purpose:
Generate a complete outfit utilizing a specific anchor item.

Flow:
```
Select Anchor Item
        ↓
Rule Engine Compiles Outfit
        ↓
AI Generates Accessories & Rationale
        ↓
Display Complete Look
```

---

# 13. Weather Recommendation Flow

Purpose:

Improve outfit recommendations using weather data.

Flow:

```
Open Recommendations
        ↓
Check Weather Targeting Status
        ↓
Fetch Weather via Geolocation Coordinates (or City fallback)
        ↓
Apply Weather Rules
        ↓
Generate Outfit
```

Examples:

Hot Weather:

* T-Shirt
* Shorts

Cold Weather:

* Jacket
* Hoodie

Rainy Weather:

* Waterproof Clothing

---

# 14. AI Assistant Flow

Purpose:

Allow natural-language interaction.

Example Queries:

* What should I wear today?
* Show my black shirts.
* Suggest an outfit for college.
* What matches with blue jeans?

Flow:

```
User Message
      ↓
Fetch Wardrobe Data
      ↓
Build Context
      ↓
Gemini
      ↓
Generate Response
      ↓
Display Message
```

Important Rules:

Assistant must:

* Use actual wardrobe data
* Use weather context when relevant

Assistant must not:

* Invent clothing items
* Recommend unavailable items

---

# 14.5 Intelligence & Wear Tracking Flow

Purpose:
Provide advanced analytics and tracking of wardrobe usage.

Flow (Wear Tracking):
```
Log Wear Event
      ↓
Recalculate Cost Per Wear
      ↓
Update Repetition Warnings
      ↓
Update Intelligence Center
```

Flow (Intelligence Center):
```
Open Intelligence
        ↓
Fetch Style DNA & Health
        ↓
Display Insights
```

---

# 15. Settings Flow

Purpose:

Allow user account management.

Functions:

* Update Profile (Identity Graph)
* Change Password
* Weather Targeting (Use My Current Location via Geolocation API)
* AI Access (Bring Your Own Key for Gemini AI)
* AI Activity (View recent AI generation logs)
* Logout

Flow:

```
Settings
     ↓
Update Information
     ↓
Save Changes
```

---

# 16. Error Flows

Upload Error

```
Upload
   ↓
Failure
   ↓
Display Error
   ↓
Retry
```

AI Analysis Error

```
Upload Success
      ↓
AI Failure
      ↓
Mark Analysis Pending
      ↓
Allow Retry
```

Authentication Error

```
Login
   ↓
Failure
   ↓
Error Message
```

---

# 17. AI Trigger Points

Allowed AI Calls

✓ Clothing Upload Analysis

✓ AI Assistant Chat

✓ Outfit Explanation and Reasoning

✓ Accessory Recommendations

✓ AI Provider Router Fallback/Failover (Gemini <-> NVIDIA NIM)

---

# 18. AI Provider Router Flow

Purpose:
Ensure high availability for AI operations via automatic failover.

Flow:
```
AI Request Initiated
        ↓
Attempt Primary Provider (Gemini 2.5 Flash)
        ↓
If Success -> Return Response
        ↓
If Failure/Rate Limit -> Attempt Fallback Provider (NVIDIA NIM Phi-4)
        ↓
Return Response
```

Forbidden AI Calls

✗ Dashboard Statistics

✗ Search

✗ Filtering

✗ Wardrobe Browsing

✗ Recommendation Engine

✗ Weather Logic

These features must use local application logic.

---

# 18. Authorization Flow

Public Routes

* /
* /login
* /register

Protected Routes

* /dashboard
* /wardrobe
* /recommendations
* /chat
* /settings

Unauthorized Access Flow

```
Protected Page
      ↓
No Token
      ↓
Redirect To Login
```

---

# 19. Session Flow

```
Login
   ↓
Access Token (15 min)
   ↓
Refresh Token (stored in database)
   ↓
Use Application
   ↓
Token Expired
   ↓
Send Refresh Token
   ↓
New Access Token + New Refresh Token
   ↓
Old Refresh Token Invalidated
   ↓
Continue Session
```

If refresh fails:

```
Refresh Failed
       ↓
Delete Refresh Token
       ↓
Logout
       ↓
Login Page
```

Logout Flow:

```
Click Logout
      ↓
Delete Refresh Token from Database
      ↓
Clear Client Tokens
      ↓
Login Page
```

---

# 20. MVP Completion Flow

The application flow is considered complete when a user can:

1. Register
2. Login
3. Upload clothing
4. Receive AI analysis
5. Manage wardrobe items
6. Search wardrobe items
7. Receive recommendations
8. Receive weather-aware suggestions
9. Chat with the AI assistant
10. Logout successfully

All flows must function without requiring manual database modifications or administrative intervention.
