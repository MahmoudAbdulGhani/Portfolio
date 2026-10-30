import { defineConfig } from '@playwright/test';
import base from './playwright.featured-design.config';

// Test addresses only: application defaults are exercised without review flags.
process.env.FEATURED_TEST_PRODUCTION = '1';
export default defineConfig({
  ...base,
  use: {...base.use, baseURL:'http://127.0.0.1:5244'},
  webServer: {
    command:'npm run build -- --outDir .motion-preview/featured-production-ci && node scripts/assert-featured-design-production-build.mjs .motion-preview/featured-production-ci && npm run preview -- --outDir .motion-preview/featured-production-ci --host 127.0.0.1 --port 5244 --strictPort',
    url:'http://127.0.0.1:5244', reuseExistingServer:!process.env.CI, timeout:120_000,
  },
});
