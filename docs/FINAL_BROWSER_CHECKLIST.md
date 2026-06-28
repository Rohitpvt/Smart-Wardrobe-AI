# Final Manual Browser Checklist

Before signing off on a production release, manually execute the following flows in a staging or production-like environment.

## 1. Authentication & Onboarding (Clerk)
- [ ] **Email Registration:** Register a new user with email via the Clerk `<SignUp />` component. Verify email OTP/magic link flow works.
- [ ] **Email Login:** Log out and log back in with the new credentials via `<SignIn />`.
- [ ] **Google OAuth Login:** Authenticate using the Google OAuth button.
- [ ] **Webhook Sync:** Verify that the newly created Clerk users successfully appear in the backend PostgreSQL database (checking `users` table for `clerk_user_id`).
- [ ] **Logout:** Verify session is destroyed by Clerk and user is redirected to the home page or login page.
- [ ] **Protected Routes:** Ensure a logged-out user is immediately redirected when trying to access `/dashboard` or `/wardrobe`.

## 2. Profile & Settings
- [ ] **Profile Load:** Navigate to `/settings`. Verify user data loaded from Clerk/Backend correctly populates.
- [ ] **Weather Geolocation:** Navigate to `/settings` and click 'Use My Current Location'. Grant permission and verify Weather Targeting becomes 'Active' without showing raw coordinates.

## 3. Wardrobe Management & Image Security
- [ ] **Upload Clothing:** Upload a new item. Ensure the item appears instantly or after a brief loading state.
- [ ] **Categorization:** Ensure the AI auto-tagging successfully categorized the new item.
- [ ] **Image Serving (Authorized):** Verify the newly uploaded clothing image renders correctly on the Wardrobe grid (using the backend proxy with secure short-lived media tokens).
- [ ] **Image Serving (Unauthorized):** Open the image URL in an incognito window without an active session. Verify it returns a 403 Forbidden or 404 Not Found.
- [ ] **Delete Item:** Verify you can successfully delete a wardrobe item.

## 4. AI Stylist & Recommendations
- [ ] **Generate Outfit:** Request a new daily outfit recommendation. Ensure latency is acceptable.
- [ ] **Explainability:** Click to view the "Why this outfit?" explanation.
- [ ] **Feedback Engine:** Provide a thumbs up / thumbs down on the outfit. Verify the feedback is acknowledged.
- [ ] **Anchor Item:** Select a specific wardrobe item and request the AI to build an outfit around it.

## 5. Intelligence Center
- [ ] **Wardrobe Goals:** Create a new style goal. Mark it as achieved and verify the status updates.
- [ ] **Style DNA:** Check the Style DNA breakdown. Verify it summarizes the user's color and pattern preferences correctly based on wardrobe contents.
- [ ] **Wardrobe Opportunities:** Check if any AI-suggested wardrobe gaps or styling opportunities are displayed.
- [ ] **Feed Loading:** Verify the feed tips load gracefully with skeleton loaders before rendering content.

## 6. BYOK AI Validation
- [ ] **Provide Gemini Key:** Navigate to `/settings/ai-access` and save a valid Gemini API Key. Verify status turns to 'Connected'.
- [ ] **Quota Exhaustion (429):** Using a test key with no quota, attempt an AI generation. Verify the inline 'Gemini quota reached' error card appears without a generic 500 crash.
- [ ] **Invalid Key (400/403):** Enter an invalid key and verify the 'Key invalid' error card appears gracefully.
- [ ] **AI Activity Log:** Navigate to `/settings/ai-usage`. Verify the recent AI generation activity logs appear correctly without any quota or plan wording.

## 7. Responsive Design
Resize your browser window or use Chrome DevTools Device Mode:
- [ ] **320px (Small Mobile):** Tables overflow horizontally; flex columns stack. No screen breakage.
- [ ] **375px (Standard Mobile):** Modals and navigation menus work via hamburger.
- [ ] **768px (Tablet):** Grids transition smoothly to multi-column.
- [ ] **1024px+ (Desktop):** Full wide layout utilizes space properly.
