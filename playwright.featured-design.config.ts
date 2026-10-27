import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base,testDir:'./tests',testIgnore:[],testMatch:'**/featured-design-review.spec.ts',retries:0,
  // One desktop browser; each case explicitly covers all requested viewports.
  projects:[{name:'featured-chromium',use:{browserName:'chromium'}}],
  use:{...base.use,baseURL:'http://127.0.0.1:5243'},
  webServer:{
    command:'npm run build -- --mode featured-design-review --outDir .motion-preview/featured-design-ci && npm run preview -- --outDir .motion-preview/featured-design-ci --host 127.0.0.1 --port 5243 --strictPort',
    url:'http://127.0.0.1:5243',reuseExistingServer:!process.env.CI,timeout:120_000,
  },
});
