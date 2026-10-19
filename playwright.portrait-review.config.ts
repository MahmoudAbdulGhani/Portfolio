import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: './tests',
  testMatch: ['**/profile-standing-portrait.spec.ts', '**/compiled-comparison.spec.ts'],
  use: { ...base.use, baseURL: 'http://127.0.0.1:5194' },
  projects: base.projects,
  webServer: {
    command: 'npm run build:portrait-review && npm run preview -- --host 127.0.0.1 --port 5194 --strictPort',
    url: 'http://127.0.0.1:5194',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
