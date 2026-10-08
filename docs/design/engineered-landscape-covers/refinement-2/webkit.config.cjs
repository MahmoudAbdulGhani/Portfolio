const path = require('node:path');
const repo = path.resolve(__dirname, '../../../..');
const { defineConfig, devices } = require(path.join(repo, 'node_modules/@playwright/test'));
module.exports = defineConfig({
  testDir: path.join(repo, 'tests/e2e'),
  testMatch: ['project-preview.spec.ts', 'contact-responsive.spec.ts', 'api-client.spec.ts', 'public.spec.ts'],
  outputDir: path.join(repo, 'test-results/webkit'),
  fullyParallel: false, retries: 0, workers: 1, reporter: 'list',
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5175', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'webkit-desktop', use: { browserName: 'webkit', viewport: { width: 1363, height: 936 } } },
    { name: 'webkit-phone', use: { ...devices['iPhone 13'], browserName: 'webkit' } }
  ]
});
