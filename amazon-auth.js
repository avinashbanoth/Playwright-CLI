require("dotenv").config();

const path = require("node:path");
const { chromium } = require("playwright");

const AMAZON_PROFILE_DIR = path.resolve(__dirname, "playwright-profile", "amazon");
const AMAZON_HOME_URL = "https://www.amazon.in/";
const AMAZON_SIGNIN_URL = "https://www.amazon.in/ap/signin";

async function launchPersistentAmazonContext() {
  return chromium.launchPersistentContext(AMAZON_PROFILE_DIR, {
    channel: "chrome",
    headless: process.env.HEADLESS === "true",
    viewport: null,
    args: ["--start-maximized"],
  });
}

async function getPrimaryPage(context) {
  const existingPage = context.pages()[0];
  return existingPage ?? context.newPage();
}

async function isAmazonLoggedIn(page) {
  try {
    await page.goto(AMAZON_HOME_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch (e) {
    // Ignore navigation errors for login check
  }
  
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  const signInLink = page.getByRole("link", { name: /hello, sign in/i }).first();
  const accountLink = page.getByRole("link", { name: /account & lists/i }).first();

  if (await signInLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    return false;
  }

  return accountLink.isVisible({ timeout: 5000 }).catch(() => false);
}

async function enterEmail(page, email) {
  console.log(`Navigating to Sign-In URL: ${AMAZON_SIGNIN_URL}`);
  await page.goto(AMAZON_SIGNIN_URL, { waitUntil: "domcontentloaded" });
  console.log(`Current URL after navigation: ${page.url()}`);

  const emailField = page.locator("#ap_email_login, input[name='email']").first();
  await emailField.waitFor({ state: "visible", timeout: 30000 });
  await emailField.fill(email);

  await page.getByRole("button", { name: /^Continue$/ }).click();
}

async function enterPassword(page, password) {
  const passwordField = page.locator("#ap_password, input[type='password']").first();
  await passwordField.waitFor({ state: "visible", timeout: 30000 });
  await passwordField.fill(password);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
}

async function waitForVerificationIfNeeded(page, timeoutMs = 180_000) {
  const verificationCodeField = page.locator("input[type='tel'], input[name='code'], input[name='cvf_captcha_input']").first();
  const verifyWhatsappButton = page.getByRole("button", { name: /verify with whatsapp/i }).first();

  const needsVerification =
    (await verificationCodeField.isVisible({ timeout: 3000 }).catch(() => false)) ||
    (await verifyWhatsappButton.isVisible({ timeout: 3000 }).catch(() => false)) ||
    /transactionapproval|cvf/i.test(page.url());

  if (!needsVerification) {
    return;
  }

  console.log("Amazon verification required. Complete the OTP/approval challenge in the opened browser window.");

  await page.waitForFunction(
    () => !/transactionapproval|cvf|ap\/signin/i.test(window.location.href),
    null,
    { timeout: timeoutMs },
  );
}

async function ensureAmazonAuthenticated(page, { email, password }) {
  if (!email || !password) {
    throw new Error("Missing GMAIL_ID or AMAZON_PASSWORD in .env");
  }

  if (await isAmazonLoggedIn(page)) {
    return { loggedIn: true, reusedSession: true };
  }

  await enterEmail(page, email);
  await enterPassword(page, password);
  await waitForVerificationIfNeeded(page);

  if (!(await isAmazonLoggedIn(page))) {
    throw new Error("Amazon login did not complete successfully.");
  }

  return { loggedIn: true, reusedSession: false };
}

async function searchAmazon(page, query) {
  console.log(`Searching Amazon for: ${query}`);
  await page.goto(AMAZON_HOME_URL, { waitUntil: "domcontentloaded" });

  const searchBox = page.getByRole("searchbox", { name: /search amazon\.in/i }).first();
  await searchBox.waitFor({ state: "visible", timeout: 30000 });
  await searchBox.fill(query);
  await page.getByRole("button", { name: /^Go$/ }).click();

  await page.waitForURL(/\/s\?/i, { timeout: 30000 });
  // Using a very robust set of selectors for search results
  const resultSelector = "[data-component-type='s-search-result'], .s-result-item, [data-asin]";
  await page.locator(resultSelector).first().waitFor({
    state: "visible",
    timeout: 30000,
  });
}

async function initializeAmazonSession() {
  const context = await launchPersistentAmazonContext();
  const page = await getPrimaryPage(context);

  try {
    const authState = await ensureAmazonAuthenticated(page, {
      email: process.env.GMAIL_ID,
      password: process.env.AMAZON_PASSWORD,
    });

    return { context, page, authState };
  } catch (error) {
    await context.close().catch(() => {});
    throw error;
  }
}

async function run() {
  try {
    const { page, authState } = await initializeAmazonSession();
    await searchAmazon(page, "iPhone 16");

    const mode = authState.reusedSession ? "reused persistent Amazon session" : "performed fresh Amazon login";
    console.log(`Amazon session ready (${mode}).`);
    console.log(`Profile path: ${AMAZON_PROFILE_DIR}`);
    console.log("Search completed for: iPhone 16");
  } catch (error) {
    console.error("Failed to initialize Amazon session.");
    console.error(error?.message ?? error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  AMAZON_HOME_URL,
  AMAZON_PROFILE_DIR,
  ensureAmazonAuthenticated,
  initializeAmazonSession,
  launchPersistentAmazonContext,
  searchAmazon,
};
