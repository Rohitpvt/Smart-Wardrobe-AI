# Product Requirements Document (PRD)

# Smart Wardrobe AI

Version: 1.1
Status: Approved for Development
Owner: Rohit Ghosh

---

# 1. Executive Summary

Smart Wardrobe AI is an AI-powered digital wardrobe management platform that allows users to organize clothing items, automatically analyze garments using computer vision, receive outfit recommendations, and interact with an AI wardrobe assistant.

The primary goal is to help users manage their wardrobe efficiently and make faster clothing decisions based on available wardrobe items and current weather conditions.

This PRD defines the complete scope for Version 1 (MVP) and includes advanced Phase 9 features like BYOK AI access and the Intelligence Center.

---

# 2. Product Vision

Provide every user with a personal AI-powered wardrobe assistant capable of:

* Understanding clothing items
* Organizing wardrobe collections
* Recommending outfits
* Providing weather-aware clothing suggestions
* Answering wardrobe-related questions
* Providing deep wardrobe analytics and style guidance

The product should eliminate wardrobe confusion and simplify daily outfit selection.

---

# 3. Problem Statement

Most users:

* Forget what clothing items they own
* Waste time deciding what to wear
* Purchase duplicate clothing items
* Struggle with outfit combinations
* Do not utilize their wardrobe effectively

A centralized AI-powered wardrobe management solution can solve these problems.

---

# 4. Target Audience

Primary Users

* Students
* College attendees
* Working professionals
* Fashion-conscious individuals

Secondary Users

* Stylists
* Content creators
* Personal shoppers

---

# 5. MVP Goals

The MVP must allow users to:

1. Create an account securely (via Clerk)
2. Upload clothing images
3. Automatically analyze clothing using AI
4. Store clothing items in a digital wardrobe
5. Search and filter wardrobe items
6. Receive outfit recommendations
7. Receive weather-based clothing suggestions
8. Chat with an AI wardrobe assistant
9. View AI-driven analytics (Intelligence Center)
10. Supply their own Gemini API keys (BYOK) for AI access

---

# 6. Technical Stack

Frontend

* Next.js 14/15
* React 19
* TypeScript
* Tailwind CSS
* Shadcn/UI

Backend

* FastAPI
* Python 3.12+

Database

* PostgreSQL

Authentication

* Clerk (Identity Provider)
* Webhook Synchronization
* JWT Session Verification (via Clerk JWKS)
* Short-lived Media Tokens (for image access)

AI Services

* Bring Your Own Key (BYOK) Architecture (User provides Gemini Key)
* Multi-Provider AI Architecture (Platform Fallback if enabled)
* Intelligent Provider Router for failover (Gemini -> NVIDIA NIM)
* Explainable Recommendation System

Weather Service

* OpenWeather API
* Geolocation API

Storage

* Local File Storage (MVP) / Cloud Storage (Production)

---

# 7. Section A: Core Platform Features (Original MVP)

## Feature 1: Authentication

Description

Users must be able to securely create and access accounts using a robust third-party identity provider (Clerk).

Requirements

* User registration (Email/Password & Google OAuth)
* User login
* User logout
* Identity synchronization with backend via webhooks
* Protected media routes (IDOR protection)

Acceptance Criteria

* Users can register successfully via Clerk
* Users can log in successfully via Clerk
* Protected routes and media images require valid Clerk sessions/tokens

---

## Feature 2: Clothing Upload

Description

Users can upload clothing images.

Requirements

* Single image upload
* Drag-and-drop support
* Image preview
* Supported formats: JPG, PNG, WEBP

Acceptance Criteria

* Images upload successfully
* Invalid file types are rejected

---

## Feature 3: AI Clothing Analysis

Description

Uploaded clothing items are analyzed automatically using Vision AI (Primary: User's Gemini Key, Fallback: System Gemini/NVIDIA).

Analysis Fields

* Clothing Type, Category, Primary Color, Pattern, Material, Season Suitability

Requirements

* AI analysis occurs only once per upload
* Results stored permanently in database

Acceptance Criteria

* Metadata generated automatically
* Metadata stored successfully

---

## Feature 4: Digital Wardrobe

Description

Users can manage all clothing items.

Functions

* Create, Read, Update, Delete, Search, Filter, Sort

---

## Feature 5: Wardrobe Dashboard

Description

Provide a visual overview of the wardrobe.

Dashboard Information

* Total Clothing Items
* Category Breakdown
* Color Breakdown
* Recently Added Items
* Intelligence Feed (Tips & Insights)

---

## Feature 6: Outfit Recommendation Engine

Description

Generate outfit suggestions from existing wardrobe items.

Recommendation Inputs

* Clothing Categories
* Color Compatibility
* Season
* Occasion

Important

Outfit generation remains deterministic and rule-based. AI is permitted only for explanation, styling rationale, accessory suggestions, personalization refinement, and natural-language fashion insights. AI is never the source of truth for core outfit selection.

---

## Feature 7: Weather-Based Recommendations

Description

Provide outfit recommendations based on current weather.

Data Source: OpenWeather API
Location Source: Browser Geolocation API

---

## Feature 8: AI Wardrobe Assistant

Description

Provide a conversational assistant for wardrobe-related queries.

Requirements

* Assistant must use wardrobe data as context
* Assistant uses AI Provider Router (Gemini 2.5 Flash Primary, NVIDIA NIM Fallback)
* Responses must reference actual wardrobe items

---

## Feature 9: Landing Page

Description

Provide a public-facing landing page to introduce Smart Wardrobe AI and drive user registration via Clerk.

---

## Feature 10: Settings and Profile Management

Description

Allow users to manage their account information.

Functions

* Profile Management (Clerk)
* AI Access (Bring Your Own Key for Gemini AI - encrypted with Fernet)
* Weather Targeting (Geolocation enabled)
* AI Activity Logs

---

# 8. Section B: Advanced Intelligence Features (Implemented)

## Feature 11: Intelligence Center
* Style DNA profile generation
* Wardrobe Health scoring
* Usage Analytics (overused vs neglected items)
* Closet Economics tracking

## Feature 12: Wear Tracking
* Log wear events and occasions
* Calculate Cost Per Wear
* Track outfit repetition warnings

## Feature 13: Shopping Intelligence
* Identify wardrobe gaps deterministically
* Smart purchase recommendations (Wardrobe Opportunities)

## Feature 14: Predictive Stylist
* Outfit success prediction
* Future wardrobe forecasting (Wardrobe Goals)

## Feature 15: Build Around Item Workflow
* Generate complete outfits starting from a single anchor item

---

# 9. Non-Functional Requirements

Performance
* API response under 2 seconds
* Image upload under 10 seconds

Security
* Clerk Authentication (OAuth, JWT)
* Short-lived Media Tokens for Image Access
* BYOK API Key Encryption (Fernet AES)
* Input Validation

Scalability
* Modular architecture
* Service-based backend design

---

# 10. Excluded Features (Not MVP)

* Virtual Try-On
* AI Image Generation
* Social Feed
* Shopping Marketplace
* Vector Databases
* RAG Systems

---

# 11. Success Metrics

Product Metrics
* User Registration Count
* Clothing Upload Count

AI Metrics
* Clothing Classification Accuracy > 90%

Performance Metrics
* API Response Time < 2 Seconds

---

# 12. Development Phases

Phase 1 to Phase 8 (Completed)
* Setup, Basic Wardrobe, Styling Engine, AI Chat

Phase 9 (Completed)
* Intelligence Center (Style DNA, Opportunities, Goals)
* Clerk Authentication Migration
* Bring Your Own Key (BYOK)
* Comprehensive Security Hardening (IDOR Fixes, Uploads)

---

# 13. Current Platform Definition

The current platform capabilities include: a user can:

1. Register and log in securely via Clerk
2. Provide their own Gemini API key for free AI access (BYOK)
3. Upload clothing items
4. Receive automatic clothing analysis
5. Manage a digital wardrobe
6. Search wardrobe items
7. View wardrobe statistics and deep Intelligence insights
8. Receive outfit recommendations
9. Receive weather-aware suggestions
10. Interact with an AI wardrobe assistant
