# AI Access Architecture Correction Report

## The Incorrect Assumption
During Phase 9, an assumption was made that integrating Google OAuth would automatically grant the platform access to the user's Google Gemini API tokens. The planned flow suggested a seamless experience where users wouldn't need to manually configure API keys because their Google login would cover it.

## The Architectural Reality
- Google OAuth is an identity and basic profile authorization protocol.
- Google does **not** expose a user's API keys (such as those generated in Google AI Studio) through standard OAuth scopes.
- Furthermore, a user's subscription to Gemini Advanced (via Google One) does not confer programmatic API usage rights to third-party applications.

## The Correction Strategy
To rectify this before production impact, the architecture was pivoted to an explicit "Bring Your Own Key" (BYOK) model. 

1. **Explicit Consent & Configuration:** Users must now explicitly generate an API key from Google AI Studio and paste it into the application.
2. **Backend Encryption:** Because keys are highly sensitive, the backend was updated to encrypt keys at rest using symmetric encryption (Fernet).
3. **Graceful Failover Disabled:** Platform fallback is disabled by default to prevent unexpected cost overruns on the platform's root API key.
4. **Subscription Postponement:** All Stripe and internal subscription messaging was hidden to align the platform purely with the BYOK reality.

## Conclusion
This correction ensures the platform operates within the technical constraints of Google's API ecosystem, prevents unauthorized token scraping attempts, and stabilizes the financial model of Smart Wardrobe AI.
