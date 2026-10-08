import { defineConfig, devices } from "@playwright/test";

// BASE_URL points the suite at a deployed site (smoke test); otherwise a local server is started.
const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "tests",
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  use: { baseURL, navigationTimeout: 15_000, actionTimeout: 10_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npm run serve", url: baseURL, reuseExistingServer: !process.env.CI, timeout: 30_000 },
});
