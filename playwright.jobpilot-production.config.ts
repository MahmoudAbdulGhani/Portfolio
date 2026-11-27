import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Run the shared journey assertions against the ordinary compiled routes.
// This process-local switch changes test addresses, never application behavior.
process.env.JOBPILOT_TEST_PRODUCTION = '1';
export default defineConfig({
  ...base, testDir:'./tests', testIgnore:[], testMatch:['**/jobpilot-design-review.spec.ts','**/jobpilot-registration.spec.ts'], retries:0,
  projects:[
    ...(base.projects ?? []).map(project=>({...project,testMatch:'**/jobpilot-design-review.spec.ts'})),
    // This suite sets its own six viewports; run it once against the normal build.
    {name:'jobpilot-public-register',testMatch:'**/jobpilot-registration.spec.ts',use:{browserName:'chromium'}},
  ],
  use:{...base.use,baseURL:'http://127.0.0.1:5203'},
  webServer:{
    command:'npm run build -- --outDir .motion-preview/jobpilot-production-ci && node scripts/assert-jobpilot-design-production-build.mjs .motion-preview/jobpilot-production-ci && npm run preview -- --outDir .motion-preview/jobpilot-production-ci --host 127.0.0.1 --port 5203 --strictPort',
    url:'http://127.0.0.1:5203',reuseExistingServer:!process.env.CI,timeout:120_000,
  },
});
