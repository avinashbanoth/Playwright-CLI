# Amazon India Playwright Workflow

## Inputs

- `.env`
- `GMAIL_ID=<amazon login email>`
- `AMAZON_PASSWORD=<amazon password>`

## Persistent profile

Use a dedicated persistent Chromium profile, for example:

```js
const context = await chromium.launchPersistentContext(profileDir, {
  channel: "chrome",
  headless: process.env.HEADLESS === "true",
  viewport: null,
  args: ["--start-maximized"],
});
```

Recommended profile path:

```txt
playwright-profile/amazon
```

Ignore that folder in `.gitignore`.

## Login flow

1. Open `https://www.amazon.in/`.
2. Detect whether the user is already signed in.
3. If not signed in, go to `https://www.amazon.in/ap/signin`.
4. Fill email using:

```js
page.locator("#ap_email_login, input[name='email']").first()
```

5. Click:

```js
page.getByRole("button", { name: /^Continue$/ })
```

6. Fill password using:

```js
page.locator("#ap_password, input[type='password']").first()
```

7. Submit with:

```js
page.getByRole("button", { name: /^Sign in$/ })
```

## Verification checkpoint

Amazon may redirect to URLs containing `transactionapproval` or `cvf`.

Treat these as a manual checkpoint:

- Tell the user to complete OTP or approval in the opened browser window.
- Wait for the page to leave the verification URL.
- Recheck signed-in state before continuing.

Do not automate OTP retrieval.

## Signed-in detection

Useful signals:

- Signed-out:
  - `page.getByRole("link", { name: /hello, sign in/i })`
- Signed-in:
  - `page.getByRole("link", { name: /account & lists/i })`
  - Header text such as `Hello, <name>`

## Product search

Use the main header search box:

```js
const searchBox = page.getByRole("searchbox", { name: /search amazon\.in/i }).first();
await searchBox.fill("iPhone 16");
await page.getByRole("button", { name: /^Go$/ }).click();
await page.waitForURL(/\/s\?/i);
await page.locator("[data-component-type='s-search-result']").first().waitFor();
```

## Expected outputs

When the user asks for reusable automation, produce:

- A persistent-auth helper such as `amazon-auth.js`
- A Playwright test such as `tests/amazon-iphone16.spec.ts`
- `.gitignore` entries for `.env` and the persistent profile directory when missing

## Existing workspace pattern

When the current workspace already contains Amazon automation files, prefer updating them instead of creating a second parallel implementation.
