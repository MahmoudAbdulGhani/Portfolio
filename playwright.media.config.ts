import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: '**/mobile-case-media.spec.ts',
  projects: [
    ...base.projects!,
    { name: 'media-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'media-webkit', use: { ...devices['iPhone 13'] } },
  ],
});
