import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Exercise the actual /profile route with no review mode or Vercel review flag.
export default defineConfig({
  ...base,
  testDir:'./tests',
  testMatch:['**/profile-standing-portrait.spec.ts','**/profile-portrait.spec.ts','**/profile-record.spec.ts','**/profile-capabilities.spec.ts','**/normal-profile.spec.ts','**/profile-introduction.spec.ts'],
  use:{...base.use,baseURL:'http://127.0.0.1:5194'},
  projects:base.projects,
  webServer:{
    command:'npm run build && node scripts/assert-portrait-production-build.mjs && npm run preview -- --host 127.0.0.1 --port 5194 --strictPort',
    url:'http://127.0.0.1:5194',reuseExistingServer:!process.env.CI,timeout:120_000,
  },
});
