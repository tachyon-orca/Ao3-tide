/**
 * Ao3-tide visual regression tests
 *
 * For each page type × skin (dark/light) × viewport (desktop/tablet/mobile):
 *   1. Navigate to a real otwarchive page
 *   2. Inject the split skin CSS with AO3 media settings
 *   3. Take a full-page screenshot (saved by Playwright's HTML reporter)
 *
 * Prerequisites:
 *   - Run `bun run build` first (or `bun test` which does this automatically)
 *   - otwarchive must be running: cd ../otwarchive && rails server -p 3000
 *   - Database seeded: rake db:otwseed
 *
 * Page URLs use fixture data from otwarchive's test/fixtures/:
 *   - work ID 40: unrestricted, posted work
 *   - testuser: login=testuser / password=testuser
 *   - "No Fandom" tag: exists in tag fixtures
 */

import { test } from "@playwright/test";
import { injectSkin, loginAsTestUser, requireArchiveServer, screenshotPage } from "./helpers";

// Pages that don't require login
const PUBLIC_PAGES = [
  { name: "work-reading", url: "/works/40" },
  { name: "works-listing", url: "/tags/No%20Fandom/works" },
  { name: "search-results", url: "/works?work_search%5Bquery%5D=test" },
  { name: "user-profile", url: "/users/testuser/profile" },
  { name: "collections", url: "/collections" },
] as const;

// Pages that require login
const AUTH_PAGES = [
  { name: "my-works", url: "/users/testuser/works" },
  { name: "bookmarks", url: "/users/testuser/bookmarks" },
] as const;

for (const skin of ["dark", "light"] as const) {
  test.describe(`${skin} skin`, () => {
    // Verify server is up once before running any tests in this describe block
    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await requireArchiveServer(page);
      await page.close();
    });

    test.describe("public pages", () => {
      for (const { name, url } of PUBLIC_PAGES) {
        test(name, async ({ page }, testInfo) => {
          await page.goto(url);
          await page.waitForLoadState("load");
          await injectSkin(page, skin);
          const project = testInfo.project.name;
          await screenshotPage(page, `screenshots/${skin}/${project}-${name}.png`);
        });
      }
    });

    test.describe("authenticated pages", () => {
      test.beforeEach(async ({ page }) => {
        await loginAsTestUser(page);
      });

      for (const { name, url } of AUTH_PAGES) {
        test(name, async ({ page }, testInfo) => {
          await page.goto(url);
          await page.waitForLoadState("load");
          await injectSkin(page, skin);
          const project = testInfo.project.name;
          await screenshotPage(page, `screenshots/${skin}/${project}-${name}.png`);
        });
      }
    });
  });
}
