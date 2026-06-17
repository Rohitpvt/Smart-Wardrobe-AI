# Smart Wardrobe AI

Smart Wardrobe AI is an advanced, AI-powered digital closet and personal styling assistant. By leveraging deterministic logic, predictive algorithms, and real-time wardrobe tracking, it provides users with actionable insights into their closet economics, outfit utilization, and shopping opportunities.

## Key Features
- **Wardrobe Intelligence Center**: Real-time insights into your wardrobe's performance.
- **Wardrobe Health Analytics**: Tracks utilization, formal vs. casual balance, and financial efficiency.
- **Closet Economics**: Provides total wardrobe valuation and cost-per-wear metrics.
- **Smart Purchases & Gap Analysis**: Deterministically identifies missing categories (e.g., Outerwear, Footwear) based on your real wardrobe data to optimize ROI.
- **Outfit Effectiveness Engine**: Computes realistic success rates based on wear history.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy (Async), PostgreSQL
- **Frontend**: Next.js (Turbopack), React, Tailwind CSS

## Architecture
The system employs a deterministic analytics pipeline:
- `SeasonalIntelligenceService`: Aligning inventory with hemisphere-specific seasonal changes.
- `PurchaseOpportunityEngine`: Real-time gap analysis avoiding hypothetical hallucinations.
- `ReadinessService`: Scores wardrobe readiness across Formal, Winter, and Summer contexts.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
