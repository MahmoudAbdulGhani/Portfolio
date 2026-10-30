import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base,testDir:'./tests',testIgnore:[],testMatch:'**/supporting-design-review.spec.ts',retries:0,
  projects:[{name:'supporting-chromium',use:{browserName:'chromium'}}],
  use:{...base.use,baseURL:'http://127.0.0.1:5253'},
  webServer:{
    command:'npm run build -- --mode supporting-design-review --outDir .motion-preview/supporting-design-ci && npm run preview -- --outDir .motion-preview/supporting-design-ci --host 127.0.0.1 --port 5253 --strictPort',
    url:'http://127.0.0.1:5253',reuseExistingServer:!process.env.CI,timeout:120_000,
  },
});
