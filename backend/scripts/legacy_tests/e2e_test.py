import asyncio
import time
import os
import uuid
from playwright.async_api import async_playwright
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/wardrobe_ai" # adjust if needed
# We will use API routes to test backend if needed, or check DB directly
engine = create_async_engine(DATABASE_URL)

async def check_db_feedback(email):
    async with engine.begin() as conn:
        res = await conn.execute(text(f"SELECT f.rating, f.recommendation_id FROM outfit_feedback f JOIN users u ON f.user_id = u.id WHERE u.email = '{email}'"))
        return res.fetchall()

async def run_scenario_1_and_2(page, email):
    print("--- Running Scenario 1 (LOVE Rating) & 2 (Undo Flow) ---")
    await page.goto("http://localhost:3000/recommendations")
    await page.wait_for_load_state('networkidle')
    
    # Generate Recommendation
    gen_btn = await page.query_selector('button:has-text("Generate")')
    if gen_btn:
        await gen_btn.click()
        await page.wait_for_selector('text=Why This Outfit', timeout=15000)
    else:
        print("No generate button found, assuming recommendation exists.")
        
    await page.wait_for_timeout(2000)
    await page.screenshot(path="artifacts/screenshots/scenario1_before_love.png")
    
    # Click LOVE
    await page.click('button:has-text("Love It"), button:has-text("LOVE"), button:has-text("❤️")')
    print("Clicked LOVE. Waiting for UI state change...")
    await page.wait_for_timeout(1000)
    await page.screenshot(path="artifacts/screenshots/scenario1_after_love.png")
    
    # Verify Undo exists
    undo_btn = await page.query_selector('button:has-text("Undo")')
    if undo_btn:
        print("Undo button appeared successfully.")
    else:
        print("Undo button missing!")
        
    # Wait 11 seconds for commit
    print("Waiting 11 seconds for feedback commit...")
    await page.wait_for_timeout(11000)
    
    db_feedback = await check_db_feedback(email)
    print("DB Feedback after 11s:", db_feedback)
    if any(r[0] == 'LOVE' for r in db_feedback):
        print("Scenario 1 Passed.")
    else:
        print("Scenario 1 Failed. Feedback not committed to DB.")

    # --- Scenario 2: Undo ---
    print("--- Running Scenario 2 (Undo Flow) ---")
    if gen_btn:
        await gen_btn.click()
        await page.wait_for_selector('text=Why This Outfit', timeout=15000)
    
    await page.click('button:has-text("Like It"), button:has-text("LIKE"), button:has-text("👍")')
    await page.wait_for_timeout(1000)
    
    undo_btn = await page.query_selector('button:has-text("Undo")')
    if undo_btn:
        await undo_btn.click()
        print("Clicked Undo.")
    else:
        print("Undo button not found to click!")
        
    print("Waiting 11 seconds...")
    await page.wait_for_timeout(11000)
    db_feedback2 = await check_db_feedback(email)
    if sum(1 for r in db_feedback2 if r[0] == 'LIKE') == 0:
        print("Scenario 2 Passed. LIKE was undone.")
    else:
        print("Scenario 2 Failed. LIKE was committed despite Undo.")

async def run_scenario_3(page, email):
    print("--- Running Scenario 3 (Duplicate Protection) ---")
    await page.goto("http://localhost:3000/recommendations")
    await page.wait_for_load_state('networkidle')
    
    gen_btn = await page.query_selector('button:has-text("Generate")')
    if gen_btn:
        await gen_btn.click()
        await page.wait_for_timeout(5000)
        
    await page.click('button:has-text("Like It"), button:has-text("LIKE"), button:has-text("👍")')
    print("Clicked LIKE for dup test. Waiting 11 seconds for commit...")
    await page.wait_for_timeout(11000)
    
    print("Refreshing page...")
    await page.reload()
    await page.wait_for_load_state('networkidle')
    
    like_btn = await page.query_selector('button:has-text("Like It"), button:has-text("LIKE"), button:has-text("👍")')
    if like_btn:
        print("UI Bug: Rating buttons are still visible after reload!")
        await like_btn.click()
        print("Clicked LIKE again.")
        await page.wait_for_timeout(11000)
    else:
        print("Rating buttons hidden, UI prevents duplicate.")
        
    db_feedback = await check_db_feedback(email)
    print("DB Feedback:", db_feedback)
    if len(db_feedback) > len(set([r[1] for r in db_feedback])):
        print("Scenario 3 Failed. Duplicate feedbacks exist in DB!")
    else:
        print("Scenario 3 Passed. No duplicate feedbacks.")

async def run_scenario_6(page, email):
    print("--- Running Scenario 6 (Page Refresh During Pending Undo) ---")
    await page.goto("http://localhost:3000/recommendations")
    await page.wait_for_load_state('networkidle')
    
    gen_btn = await page.query_selector('button:has-text("Generate")')
    if gen_btn:
        await gen_btn.click()
        await page.wait_for_timeout(5000)
        
    await page.click('button:has-text("Love It"), button:has-text("LOVE"), button:has-text("❤️")')
    print("Clicked LOVE. Immediately refreshing...")
    await page.reload()
    
    print("Waiting 15 seconds to see if it committed...")
    await page.wait_for_timeout(15000)
    db_feedback = await check_db_feedback(email)
    print("DB Feedback:", db_feedback)
    # the exact expected behavior depends on architecture, but we document it.

async def main():
    os.makedirs("artifacts/screenshots", exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()
        
        email = f"feedback_cert_{int(time.time())}@example.com"
        print("Registering:", email)
        await page.goto("http://localhost:3000/register")
        await page.wait_for_load_state('networkidle')
        await page.fill('input[placeholder*="First"]', 'Test')
        await page.fill('input[placeholder*="Last"]', 'User')
        await page.fill('input[type="email"]', email)
        await page.fill('input[type="password"]', 'StrongPassword123!')
        confirm_pw = await page.query_selector('input[placeholder*="Re-enter"]')
        if confirm_pw:
            await confirm_pw.fill('StrongPassword123!')
        
        await page.click('button:has-text("Next")')
        await page.wait_for_timeout(1000)
        age = await page.query_selector('input[placeholder="25"]')
        if age:
            await age.fill('25')
        gender = await page.query_selector('select')
        if gender:
            await gender.select_option('Male')
            
        await page.click('button:has-text("Next"), button:has-text("Complete")')
        await page.wait_for_timeout(3000)
        
        # Login
        if "login" in page.url:
            await page.fill('input[type="email"]', email)
            await page.fill('input[type="password"]', 'StrongPassword123!')
            await page.click('button[type="submit"]')
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(2000)
            
        # Bypass onboarding
        await page.goto("http://localhost:3000/recommendations")
        await page.wait_for_load_state('networkidle')
        
        await run_scenario_1_and_2(page, email)
        await run_scenario_3(page, email)
        await run_scenario_6(page, email)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
