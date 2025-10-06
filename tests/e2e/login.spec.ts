import { expect, test, type Page } from "@playwright/test";

const EMAIL = process.env.E2E_EMAIL ?? "victorazesc@hotmail.com";
const PASSWORD = process.env.E2E_PASSWORD ?? "corte99!))WC";

const SIGN_IN_PATH = "/auth/sign-in";
const ONBOARDING_PATH = "/onboarding/create-workspace";

async function performLogin(page: Page) {
  await page.goto(SIGN_IN_PATH, { waitUntil: "networkidle" });

  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/senha/i).fill(PASSWORD);

  await Promise.all([
    page.waitForLoadState("networkidle").catch(() => {}),
    page.getByRole("button", { name: /^entrar$/i }).click(),
  ]);
}

test.describe("Login", () => {
  test("redirects a fresh account to onboarding", async ({ page }) => {
    await performLogin(page);

    try {
      await expect(page).toHaveURL(new RegExp(`${ONBOARDING_PATH}`), {
        timeout: 10_000,
      });
    } catch (error) {
      const currentUrl = page.url();
      console.log("Debug redirect path", currentUrl);
      throw error;
    }

    await expect(page.getByRole("heading", { name: /crie seu (primeiro|novo) workspace/i })).toBeVisible();
  });
});
