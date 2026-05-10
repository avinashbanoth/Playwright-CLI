const { chromium } = require('playwright');
const path = require('path');

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to http://localhost:5173...");
    await page.goto('http://localhost:5173', { timeout: 10000 });
    // Wait for content to render
    await page.waitForSelector('h1', { timeout: 5000 });
    
    const screenshotPath = path.resolve(__dirname, 'ui-debug.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);
  } catch (err) {
    console.error("Failed to capture UI. Is 'npm run dev' running?");
    console.error(err.message);
  } finally {
    await browser.close();
  }
}

capture();
