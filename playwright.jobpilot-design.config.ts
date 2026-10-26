import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base, testDir:'./tests', testIgnore:[], testMatch:'**/jobpilot-design-review.spec.ts', retries:0,
  use:{...base.use,baseURL:'http://127.0.0.1:5201'},
  webServer:{
    command:'npm run build -- --mode jobpilot-design-review --outDir .motion-preview/jobpilot-design-ci && npm run preview -- --outDir .motion-preview/jobpilot-design-ci --host 127.0.0.1 --port 5201 --strictPort',
    url:'http://127.0.0.1:5201',reuseExistingServer:!process.env.CI,timeout:120_000,
  },
});
