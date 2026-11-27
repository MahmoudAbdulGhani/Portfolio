import { defineConfig } from '@playwright/test';
import design from './playwright.jobpilot-design.config';

export default defineConfig({
  ...design, testMatch: '**/jobpilot-registration.spec.ts', retries: 0, workers: 1,
  projects: [{ name: 'chromium-register', use: { browserName: 'chromium',
    ...(process.env.REVIEW_CHROMIUM ? { launchOptions: { executablePath: process.env.REVIEW_CHROMIUM } } : {}),
  } }],
});
