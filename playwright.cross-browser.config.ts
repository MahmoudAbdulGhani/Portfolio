import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Additional engine coverage; WebKit automation is not physical Safari proof.
export default defineConfig({
  ...base,
  testMatch: 'readiness.spec.ts',
  projects: [
    {name:'firefox-readiness',use:{...devices['Desktop Firefox']}},
    {name:'webkit-readiness',use:{...devices['iPhone 13']}},
  ],
});
