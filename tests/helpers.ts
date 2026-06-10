import { type Page, expect } from "@playwright/test";
import { mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Inject the split skin CSS into the current page using AO3's media settings.
 * Call this AFTER page.goto() + waitForLoadState().
 */
export async function injectSkin(page: Page, skin: "dark" | "light") {
  const parts = [
    { file: `${skin}-base.css`, media: "all" },
    { file: `${skin}-tablet.css`, media: "only screen and (max-width: 62em)" },
    { file: `${skin}-phone.css`, media: "only screen and (max-width: 42em)" },
  ];

  for (const part of parts) {
    const css = readFileSync(join(ROOT, "dist", part.file), "utf8");
    await page.addStyleTag({ content: css, media: part.media });
  }

  // Give the browser a moment to apply the new styles
  await page.waitForTimeout(300);
}

/**
 * Log in as testuser. Uses credentials seeded by `rake db:otwseed`.
 * login: testuser / password: testuser
 */
export async function loginAsTestUser(page: Page) {
  await page.goto("/users/login");
  await page.waitForLoadState("domcontentloaded");
  await page.fill("#user_login", "testuser");
  await page.fill("#user_password", "testuser");
  // Use the main login form's submit, not the hidden header dropdown one
  await page.click('#loginform input[type="submit"]');
  // Wait for redirect away from login page
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 20_000,
  });
}

/**
 * Verify the otwarchive server is reachable. Fails the test with a clear
 * message if not, rather than a confusing connection-refused error.
 */
export async function requireArchiveServer(page: Page) {
  try {
    const response = await page.goto("/", { timeout: 5_000 });
    expect(
      response?.ok() || response?.status() === 302,
      "otwarchive server is not running. Start it with:\n  cd ../otwarchive && rails server -p 3000"
    ).toBeTruthy();
  } catch {
    throw new Error(
      "Cannot connect to otwarchive. Start it with:\n  cd ../otwarchive && rails server -p 3000"
    );
  }
}

/**
 * Take a full-page screenshot, falling back to a viewport screenshot
 * if the page is too tall for Chromium's snapshot buffer.
 */
export async function screenshotPage(page: Page, path: string): Promise<void> {
  mkdirSync(dirname(path), { recursive: true });
  try {
    await page.screenshot({ fullPage: true, path });
  } catch {
    // Page too tall (e.g. mobile dashboard) — capture visible viewport instead
    await page.screenshot({ fullPage: false, path });
  }
}
