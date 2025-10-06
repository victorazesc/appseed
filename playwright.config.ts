import { defineConfig } from "@playwright/test";

type TestOptions = {
  baseURL: string;
};

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig<TestOptions>({
  testDir: "tests/e2e",
  timeout: 60 * 1000,
  fullyParallel: false,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
