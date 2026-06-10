import { defineConfig, devices } from "@playwright/test";

const ARCHIVE_URL = process.env.ARCHIVE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
  fullyParallel: false,
  timeout: 60_000,
  retries: 1,
  reporter: [["html"], ["list"]],
  use: {
    baseURL: ARCHIVE_URL,
    screenshot: "on",
    // Don't capture video by default (slow), but screenshots are always on
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "tablet",
      use: {
        ...devices["iPad Pro"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
