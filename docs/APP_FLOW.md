# Application Flow Document (APP_FLOW)

# Smart Wardrobe AI

Version: 1.1

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
Register/Login (Clerk UI)
      ↓
Onboarding (Optional, if new)
      ↓
Dashboard
      ↓
Upload Clothing
      ↓
AI Analysis
      ↓
Digital Wardrobe
      ↓
Recommendations & Intelligence Center
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
├── Sign In / Sign Up (Clerk Hosted)
│
└── Protected Area (Clerk @clerk/nextjs middleware)
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
        ├── AI Access (BYOK - API Keys)
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
Click Register/Login
        ↓
Clerk Auth Flow
```

---

# 5. Registration & Login Flow (Clerk)

Purpose:

Authenticate users securely via a trusted identity provider.

Flow:

```
User Clicks Login / Register
      ↓
Clerk UI Components (Email, Google OAuth)
      ↓
Authentication Successful
      ↓
Clerk Webhook Triggers Backend Sync (creates User in DB)
      ↓
Dashboard
```

Validation Rules:

* Email verification, password complexity, and social auth logic are natively handled by Clerk.

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
* Intelligence Feed (Tips & Insights)

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
Upload (Authenticated with secure short-lived media token)
      ↓
AI Analysis (Gemini/Fallback)
      ↓
Metadata Generated & Saved
      ↓
Wardrobe Page
```

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
Vision AI (Primary: User's Gemini Key, Fallback: System Gemini/NVIDIA)
      ↓
Structured Analysis
      ↓
Database Storage
```

Expected Output:

* Clothing Type, Category, Color, Pattern, Material, Season

---

# 10. Digital Wardrobe Flow

Purpose:

Manage uploaded clothing items.

Components:

* Search Bar, Filter Panel, Sort Dropdown
* Clothing Grid (Protected media rendering)
* Upload Button

---

# 12. Recommendation Flow

Purpose:

Generate outfit recommendations.

Inputs:

* Wardrobe Data, Occasion, Weather Conditions

Flow:

```
Recommendations Page
        ↓
Select Occasion & Weather Context
        ↓
Rule Engine
        ↓
Outfit Generated
        ↓
Display Result
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

---

# 14. AI Assistant Flow

Purpose:

Allow natural-language interaction using AI Context.

Flow:

```
User Message
      ↓
Fetch Wardrobe Data & Preferences
      ↓
Build Context
      ↓
AI Provider Router (User Key -> System Key)
      ↓
Generate Response
      ↓
Display Message
```

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
Fetch Style DNA, Goals, Opportunities
        ↓
Display Insights
```

---

# 15. Settings Flow (BYOK & Profile)

Purpose:

Allow user account and preferences management.

Functions:

* Profile (handled via Clerk settings mostly)
* Weather Targeting
* AI Access (Bring Your Own Key for Gemini AI) - Users can securely input and validate their own Gemini key.
* AI Activity (View recent AI generation logs)

Flow (BYOK Key Setup):

```
Settings -> AI Access
      ↓
Input Gemini Key
      ↓
Backend Validates Key against Google AI
      ↓
If Valid -> Encrypt with Fernet & Save
      ↓
Subsequent AI calls use User Key
```

---

# 16. Error Flows

AI Analysis Error

```
Upload Success
      ↓
AI Failure (Key invalid or quota reached)
      ↓
Mark Analysis Pending
      ↓
Allow Retry / Prompt user to update BYOK key
```

Authentication Error

```
Protected Route accessed without Clerk Session
    ↓
Redirect to /sign-in
```

---

# 17. AI Trigger Points

Allowed AI Calls

✓ Clothing Upload Analysis
✓ AI Assistant Chat
✓ Outfit Explanation and Reasoning
✓ Accessory Recommendations
✓ BYOK Key Validation

---

# 18. AI Provider Router Flow (BYOK)

Purpose:
Ensure user costs are prioritized to their own keys, with fallback logic.

Flow:
```
AI Request Initiated
        ↓
Does User Have Custom Gemini Key?
        ↓ (Yes) -> Use User Key
        ↓ (No)  -> Use System Key (Subject to global quotas)
        ↓
If Failure (Rate Limit) -> Attempt Fallback Provider (NVIDIA NIM)
        ↓
Return Response
```

---

# 19. Authorization & Session Flow (Clerk)

Public Routes

* /
* /sign-in
* /sign-up

Protected Routes

* /dashboard, /wardrobe, /recommendations, /chat, /settings, /intelligence

Session Flow:

```
Login via Clerk
   ↓
Clerk sets secure Session Cookies
   ↓
Frontend reads session via ClerkProvider
   ↓
Backend validates request via @clerk/backend `require_auth`
   ↓
Logout triggers session destruction via Clerk
```

---

# 20. MVP Completion Flow

The application flow is considered complete when a user can:

1. Register / Login (Clerk)
2. Upload clothing
3. Receive AI analysis
4. Manage wardrobe items
5. Receive weather-aware suggestions
6. Chat with the AI assistant
7. Set up BYOK AI Keys
8. View Intelligence insights
9. Logout successfully
