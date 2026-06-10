/**
 * Tests against a locally saved AO3 page in test_page/.
 * No server required — the global setup starts a static server before workers run.
 *
 * Run:
 *   node scripts/build.js && bunx playwright test tests/local-page.spec.ts
 */

import { test } from "@playwright/test";
import { injectSkin } from "./helpers.js";
import { STATIC_PORT } from "./global-setup.js";

for (const skin of ["dark", "light"] as const) {
  test.describe(`${skin} skin`, () => {
    test("work reading page", async ({ page }) => {
      await page.goto(`http://localhost:${STATIC_PORT}/`);
      await page.waitForLoadState("networkidle");
      await injectSkin(page, skin);
      await page.screenshot({
        fullPage: true,
        path: `screenshots/${skin}/work-reading-local.png`,
      });
    });
  });
}
