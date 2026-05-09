import { expect, test } from "@playwright/test";
import { initializeAmazonSession, searchAmazon } from "../amazon-auth.js";

test.describe("Amazon India search", () => {
  test("login and search for iPhone 16", async () => {
    const { context, page } = await initializeAmazonSession();

    try {
      await searchAmazon(page, "iPhone 16");
      await expect(page).toHaveURL(/\/s\?/i);
      const resultSelector = "[data-component-type='s-search-result'], .s-result-item, [data-asin]";
      await expect(page.locator(resultSelector).first()).toBeVisible({ timeout: 20000 });
    } finally {
      await context.close();
    }
  });
});
