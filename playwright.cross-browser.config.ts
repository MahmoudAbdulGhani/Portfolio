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
    {name:engine+'-cedar-contract',use,retries:0,testMatch:'cedar-boundary.spec.ts',grep:/contract mark/},
    {name:engine+'-readiness',use,testMatch:'readiness.spec.ts'},
    {name:engine+'-city-alignment',use,retries:0,testDir:'./tests',testMatch:'**/jobpilot-registration.spec.ts',grep:/at 320$/},
  ]),
});
