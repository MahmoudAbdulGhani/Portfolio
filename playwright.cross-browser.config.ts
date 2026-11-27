import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Compare the ordinary routes on both engines. This flag selects test URLs only.
process.env.JOBPILOT_TEST_PRODUCTION = '1';
const engines = [
  ['firefox', devices['Desktop Firefox']],
  ['webkit', devices['iPhone 13']],
] as const;

// WebKit automation is not a physical Safari check.
export default defineConfig({
  ...base,
  projects: engines.flatMap(([engine,use]) => [
    {name:engine+'-readiness',use,testMatch:'readiness.spec.ts'},
    {name:engine+'-city-alignment',use,retries:0,testDir:'./tests',testMatch:'**/jobpilot-registration.spec.ts',grep:/at 320$/},
  ]),
});
