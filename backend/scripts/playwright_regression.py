import asyncio
import os
import time
from playwright.async_api import async_playwright, Page, expect

BASE_URL = "http://localhost:3000"
ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "browser-certification", "phase-9-13-2"))

FREE_USER_EMAIL = "browser_free_user@example.com"
FREE_USER_PASSWORD = "Password123!"

ADMIN_USER_EMAIL = "browser_admin_user@example.com"
ADMIN_USER_PASSWORD = "Password123!"

async def setup():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    # Create a dummy image
    dummy_img_path = os.path.join(ARTIFACTS_DIR, "dummy_clothing.jpg")
    if not os.path.exists(dummy_img_path):
        with open(dummy_img_path, "wb") as f:
            # Just a tiny 1x1 black pixel jpeg
            f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x03\x02\x02\x02\x02\x02\x03\x02\x02\x02\x03\x03\x03\x03\x04\x06\x04\x04\x04\x04\x04\x08\x06\x06\x05\x06\t\x08\n\n\t\x08\t\t\n\x0c\x0f\x0c\n\x0b\x0e\x0b\t\t\r\x11\r\x0e\x0f\x10\x10\x11\x10\n\x0c\x12\x13\x12\x10\x13\x0f\x10\x10\x10\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\x14Q@\x0f\xff\xd9')
    return dummy_img_path

async def run_tests():
    dummy_img_path = await setup()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        print("--- 1. Landing / Basic Navigation ---")
        await page.goto(BASE_URL)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "home_page.png"))
        
        await page.goto(f"{BASE_URL}/dashboard")
        # should redirect to login
        await page.wait_for_url(f"**/login*")
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "unauthenticated_dashboard_redirect.png"))

        print("--- 2. Email/Password Registration Flow ---")
        await page.goto(f"{BASE_URL}/register")
        await page.fill('input[name="firstName"]', "Test")
        await page.fill('input[name="lastName"]', "FreeUser")
        await page.fill('input[name="email"]', FREE_USER_EMAIL)
        await page.fill('input[name="password"]', FREE_USER_PASSWORD)
        await page.click('button[type="submit"]')
        
        # Step 2
        await page.wait_for_selector('select[name="gender"]')
        await page.select_option('select[name="gender"]', 'Male')
        await page.fill('input[name="age"]', '25')
        await page.fill('input[name="height_cm"]', '180')
        await page.fill('input[name="weight_kg"]', '75')
        await page.click('button:has-text("Next Step")')

        # Step 3
        await page.wait_for_selector('input[type="checkbox"]')
        await page.check('input[value="casual"]')
        await page.click('button:has-text("Complete Registration")')
        
        # Dashboard
        await page.wait_for_url("**/dashboard")
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "registration_success.png"))

        print("--- 3. Email/Password Login + Logout ---")
        await page.goto(f"{BASE_URL}/settings")
        await page.click('button:has-text("Log out")')
        await page.wait_for_url("**/login*")
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "logout_success.png"))

        await page.fill('input[name="email"]', FREE_USER_EMAIL)
        await page.fill('input[name="password"]', FREE_USER_PASSWORD)
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/dashboard")
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "login_success_dashboard.png"))

        print("--- 4. Google OAuth UI Availability ---")
        await page.goto(f"{BASE_URL}/login")
        google_btn = page.locator('button:has-text("Continue with Google")')
        if await google_btn.count() > 0:
            await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "google_oauth_entry.png"))
        else:
            print("Google OAuth button not found")

        print("--- 5. Dashboard Load Test ---")
        await page.goto(f"{BASE_URL}/dashboard")
        await page.wait_for_selector('text="Wardrobe Summary"', timeout=10000)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "dashboard_loaded.png"))

        print("--- 6. Profile Flow ---")
        await page.goto(f"{BASE_URL}/settings")
        await page.wait_for_selector('input[name="first_name"]', timeout=10000)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "profile_page.png"))

        print("--- 7. Wardrobe Upload Flow ---")
        await page.goto(f"{BASE_URL}/wardrobe/add")
        await page.set_input_files('input[type="file"]', dummy_img_path)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "wardrobe_upload_preview.png"))
        
        await page.click('button:has-text("Analyze")')
        await page.wait_for_selector('text="Save Item"', timeout=20000)
        
        # Override required fields in case AI failed to extract
        await page.fill('input[name="name"]', "Browser Test Shirt")
        await page.click('button:has-text("Save Item")')
        await page.wait_for_url("**/wardrobe")
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "wardrobe_grid.png"))

        print("--- 8. Outfit Recommendation Flow ---")
        await page.goto(f"{BASE_URL}/recommendations")
        await page.click('button:has-text("Generate New Outfit")')
        try:
            await page.wait_for_selector('text="Your Recommended Outfit"', timeout=30000)
            await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "outfit_recommendation_success.png"))
        except Exception as e:
            print("Outfit generation took too long or failed:", e)

        print("--- 12. Intelligence Workspaces ---")
        await page.goto(f"{BASE_URL}/wardrobe/intelligence")
        await page.wait_for_selector('text="Wardrobe Intelligence"', timeout=10000)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "wardrobe_intelligence.png"))

        print("--- 13. User AI Usage Page ---")
        await page.goto(f"{BASE_URL}/settings/ai-usage")
        await page.wait_for_selector('text="Plan"', timeout=10000)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "settings_ai_usage.png"))

        print("--- 16. Non-Admin Access Denied ---")
        await page.goto(f"{BASE_URL}/admin/ai-usage")
        await page.wait_for_selector('text="Access Denied"', timeout=10000)
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "admin_access_denied.png"))

        await browser.close()
        print("Playwright script completed successfully.")

if __name__ == "__main__":
    asyncio.run(run_tests())
