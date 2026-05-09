---
name: amazon-in-playwright-auth
description: Automate Amazon India login and product search with Playwright using credentials from a local `.env` file and a persistent Chromium profile. Use when Codex needs to sign in to `amazon.in`, reuse a saved authenticated session, handle OTP or transaction-approval checkpoints, search products such as iPhone 16, or generate/update Playwright auth helpers and tests for Amazon India flows.
---

# Amazon India Playwright Auth

Use this skill for `amazon.in` authentication and search automation where session reuse matters.

## Workflow

1. Read `.env` and require `GMAIL_ID` plus `AMAZON_PASSWORD`.
2. Use `chromium.launchPersistentContext()` with a dedicated profile directory so login survives future runs.
3. Check whether Amazon is already signed in before attempting credentials.
4. If not signed in, fill the Amazon email step, continue to password, and submit.
5. If Amazon presents OTP, transaction approval, or CVF verification, stop automatic credential entry and let the user complete the checkpoint in the browser.
6. After authentication, continue to the requested Amazon page or product search.
7. When asked for tests or reusable code, generate a persistent-auth helper and a Playwright spec that reuses it.

## Rules

- Use official Playwright APIs only.
- Prefer stable role-based selectors first, then Amazon ids such as `#ap_email_login` and `#ap_password`.
- Do not attempt CAPTCHA bypasses, OTP interception, or other unsafe workarounds.
- Treat OTP and verification screens as a manual handoff point.
- Keep the browser profile outside git-tracked files and ignore it in `.gitignore`.
- Reuse existing workspace files such as `amazon-auth.js` or `tests/amazon-iphone16.spec.ts` when they already exist and match the request.

## Reference

Read [references/amazon-playwright-workflow.md](references/amazon-playwright-workflow.md) before generating or modifying Amazon login/search automation.
