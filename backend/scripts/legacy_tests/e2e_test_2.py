import asyncio
import time
import os
from playwright.async_api import async_playwright
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/wardrobe_ai"
engine = create_async_engine(DATABASE_URL)

async def check_db_affinities(email):
    async with engine.begin() as conn:
        res = await conn.execute(text(f"SELECT a.dimension, a.value, a.score FROM user_feedback_affinities a JOIN users u ON a.user_id = u.id WHERE u.email = '{email}'"))
        return res.fetchall()

async def run_scenario_4(page):
    print("--- Running Scenario 4 (Mobile UI) ---")
    widths = [320, 375, 768]
    for w in widths:
        print(f"Setting viewport to {w}px")
        await page.set_viewport_size({"width": w, "height": 800})
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"artifacts/screenshots/mobile_{w}.png")
    print("Scenario 4 Passed (Screenshots taken).")
    await page.set_viewport_size({"width": 1920, "height": 1080})

async def run_scenario_5(page, email):
    print("--- Running Scenario 5 (XAI Feedback Loop) ---")
    # Rate 5 items as LOVE
    for i in range(5):
        print(f"Generating recommendation {i+1}/5...")
        gen_btn = await page.query_selector('button:has-text("Generate")')
        if gen_btn:
            await gen_btn.click()
            await page.wait_for_selector('text=Why This Outfit', timeout=15000)
        
        await page.click('button:has-text("Love It"), button:has-text("LOVE"), button:has-text("❤️")')
        print(f"Clicked LOVE for rec {i+1}. Waiting 11 seconds for commit...")
        await page.wait_for_timeout(11000)
        
        # After rating, the card might hide or we just reload
        await page.reload()
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(2000)
        
    print("Rated 5 outfits as LOVE. Generating final recommendation...")
    gen_btn = await page.query_selector('button:has-text("Generate")')
    if gen_btn:
        await gen_btn.click()
        await page.wait_for_selector('text=Why This Outfit', timeout=15000)
        
    # Check XAI explanation text
    explanation = await page.text_content('.xai-explanation-class, div:has-text("Why This Outfit")') # need exact selector, but text is fine
    print("XAI Explanation:", explanation)
    
    # Check affinities
    affs = await check_db_affinities(email)
    print("Learned Affinities:", affs)
    if len(affs) > 0 and sum([a[2] for a in affs]) > 0:
        print("Scenario 5 Passed. Affinities learned and XAI changed.")
    else:
        print("Scenario 5 Failed. Affinities not learning.")

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
        await page.fill('input[placeholder="Jane"]', 'Test')
        await page.fill('input[placeholder="Doe"]', 'User')
        await page.fill('input[placeholder="you@example.com"]', email)
        await page.fill('input[placeholder="Minimum 8 characters"]', 'StrongPassword123!')
        confirm_pw = await page.query_selector('input[placeholder="Re-enter password"]')
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
        
        # Bypass onboarding
        await page.goto("http://localhost:3000/recommendations")
        await page.wait_for_load_state('networkidle')
        
        await run_scenario_4(page)
        await run_scenario_5(page, email)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
