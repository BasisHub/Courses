// Playwright configuration for the sample harness. Chromium only, one worker, tests in file order:
// the machine has 3 BBJ licenses and sessions outlive the browser, so runs must be serial (D-02).
// trace, screenshot and video stay off: the WebCUI console header shows the license serial number
// and Playwright's own artifacts must never capture it.
import { defineConfig, devices } from '@playwright/test';
import { bbjUrl } from './lib/paths.js';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  forbidOnly: true,
  timeout: 120000,
  expect: { timeout: 15000 },
  outputDir: './test-results',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: bbjUrl(),
    viewport: { width: 1280, height: 800 },
    colorScheme: 'light',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'selftest', testMatch: 'selftest.spec.js' },
    { name: 'samples', testMatch: ['smoke.spec.js', 'behaviour/**/*.spec.js'] },
  ],
});
