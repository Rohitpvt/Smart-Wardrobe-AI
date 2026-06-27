# Final Manual Browser Checklist

Before signing off on a production release, manually execute the following flows in a staging or production-like environment.

## 1. Authentication & Onboarding
- [ ] **Email Registration:** Register a new user with email and password. Verify validation rules (password complexity).
- [ ] **Email Login:** Log out and log back in with the new credentials.
- [ ] **Google Login:** Authenticate using the Google OAuth button.
- [ ] **Google Registration Flow:** Ensure a newly created Google OAuth user correctly lands on the onboarding flow (sizing, style preferences) before accessing the dashboard.
- [ ] **Logout:** Verify session is destroyed and user is redirected to `/login`.

## 2. Profile & Settings
- [ ] **Profile Load:** Navigate to `/settings`. Verify all user fields load correctly.
- [ ] **Image Serving:** If the user has a profile avatar (from Google or manual upload), verify the image renders without 404/403 errors.

## 3. Wardrobe Management
- [ ] **Upload Clothing:** Upload a new item. Ensure the item appears instantly or after a brief loading state.
- [ ] **Categorization:** Ensure the AI auto-tagging successfully categorized the new item.
- [ ] **Image Serving:** Verify the newly uploaded clothing image renders correctly on the Wardrobe grid.
- [ ] **Delete Item:** Verify you can successfully delete a wardrobe item.

## 4. AI Stylist & Recommendations
- [ ] **Generate Outfit:** Request a new daily outfit recommendation. Ensure latency is acceptable.
- [ ] **Explainability:** Click to view the "Why this outfit?" explanation.
- [ ] **Feedback Engine:** Provide a thumbs up / thumbs down on the outfit. Verify the feedback is acknowledged.
- [ ] **Anchor Item:** Select a specific wardrobe item and request the AI to build an outfit around it.

## 5. BYOK AI Validation
- [ ] **Provide Gemini Key:** Navigate to `/settings/ai-access` and save a valid Gemini API Key. Verify status turns to 'Connected'.
- [ ] **Quota Exhaustion (429):** Using a test key with no quota, attempt an AI generation. Verify the inline 'Gemini quota reached' error card appears without a generic 500 crash.
- [ ] **Invalid Key (400/403):** Enter an invalid key and verify the 'Key invalid' error card appears gracefully.
- [ ] **Weather Geolocation:** Navigate to `/settings` and click 'Use My Current Location'. Grant permission and verify Weather Targeting becomes 'Active' without showing raw coordinates.

## 6. Dashboards
- [ ] **AI Activity Log:** Navigate to `/settings/ai-usage`. Verify the recent AI generation activity logs appear correctly without any quota or plan wording.

## 7. Responsive Design
Resize your browser window or use Chrome DevTools Device Mode:
- [ ] **320px (Small Mobile):** Tables overflow horizontally; flex columns stack. No screen breakage.
- [ ] **375px (Standard Mobile):** Modals and navigation menus work via hamburger.
- [ ] **768px (Tablet):** Grids transition smoothly to multi-column.
- [ ] **1024px+ (Desktop):** Full wide layout utilizes space properly.
