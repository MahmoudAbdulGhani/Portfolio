import { test, expect } from '@playwright/test';
import { sampleDescription, sampleMatch } from '../fixtures/supporting-pages.mjs';

const complete = (summary = 'Current report.') => `event: result\ndata: ${JSON.stringify({ result: { ...sampleMatch, overallMatch: summary }, cvToken: 'fixture-token' })}\n\nevent: done\ndata: {}\n\n`;
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ json: new URL(route.request().url()).pathname === '/api/profile' ? { name: 'Fixture', title: 'Developer', experience: [], socials: [] } : [] }));
});

for (const width of [320, 390, 430, 768, 1440]) test(`failure, timed retry and success retain input and readable controls at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  let calls = 0;
  await page.route('**/api/job-match', route => {
    calls++;
    if (calls === 1) return route.fulfill({ contentType: 'text/event-stream', body: 'event: error\ndata: {"message":"The AI job matcher is temporarily unavailable. Please try again.","code":"provider","requestId":"11111111-1111-4111-8111-111111111111"}\n\n' });
    if (calls === 2) return route.fulfill({ status: 429, headers: { 'Retry-After': '2' }, json: { message: 'The comparison request limit has been reached. Please wait before trying again.', code: 'rate' } });
    return route.fulfill({ contentType: 'text/event-stream', body: complete() });
  });
  await page.goto('/job-match'); await page.clock.install(); await page.locator('#job-description').fill(sampleDescription);
  await page.getByRole('button', { name: 'Check My Fit' }).click();
  await expect(page.locator('#job-error')).toContainText('temporarily unavailable'); await expect(page.locator('#job-error')).toContainText('Reference:');
  await expect(page.locator('#job-description')).toHaveValue(sampleDescription); await expect(page.locator('.ai-report')).toHaveCount(0);
  await page.getByRole('button', { name: 'Try again', exact: true }).press('Enter');
  await expect(page.locator('#job-retry')).toContainText('Retry available in 2s');
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeDisabled(); await expect(page.getByRole('button', { name: 'Check My Fit' })).toBeDisabled();
  await page.locator('.ai-form').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))); expect(calls).toBe(2);
  await page.clock.fastForward(2_001); await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeEnabled(); expect(calls).toBe(2);
  await page.getByRole('button', { name: 'Try again', exact: true }).press('Enter'); await expect(page.locator('.ai-report')).toBeVisible(); expect(calls).toBe(3);
  const download = page.getByRole('button', { name: 'Download Tailored CV' });
  await download.focus(); await download.press('Tab'); await page.keyboard.press('Shift+Tab'); await expect(download).toBeFocused();
  const target = await download.evaluate(button => {
    const box = button.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, height: box.height, headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom, footerTop: document.querySelector('.stage-footer')!.getBoundingClientRect().top };
  });
  expect(target.height).toBeGreaterThanOrEqual(44); expect(target.top).toBeGreaterThanOrEqual(target.headerBottom); expect(target.bottom).toBeLessThanOrEqual(target.footerTop);
  await expect(page.locator('main h1')).toHaveCount(1); await expect(page.locator('#job-description')).toHaveValue(sampleDescription);
  expect(await page.locator('main').evaluate(el => el.scrollWidth > el.clientWidth || document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('a result without done never exposes a report or signed download', async ({ page }) => {
  await page.route('**/api/job-match', route => route.fulfill({ contentType: 'text/event-stream', body: complete().split('event: done')[0] }));
  await page.goto('/job-match'); await page.locator('#job-description').fill(sampleDescription); await page.getByRole('button', { name: 'Check My Fit' }).click();
  await expect(page.locator('#job-error')).toContainText('before the report was complete'); await expect(page.locator('.ai-report')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download Tailored CV' })).toHaveCount(0); await expect(page.locator('#job-description')).toBeEnabled();
  await page.route('**/api/job-match', route => route.fulfill({ contentType: 'text/event-stream', body: complete() }));
  await page.getByRole('button', { name: 'Try again', exact: true }).click(); await expect(page.locator('.ai-report')).toBeVisible();
});

test('error events release controls without waiting for an unclosed stream', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.fetch; const state = window as unknown as { streamCancelled: boolean };
    window.fetch = (input, init) => String(input).endsWith('/job-match') ? Promise.resolve(new Response(new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode('event: error\ndata: {"message":"Provider unavailable.","code":"provider"}\n\n')); },
      cancel() { state.streamCancelled = true; },
    }), { headers: { 'Content-Type': 'text/event-stream' } })) : original(input, init);
  });
  await page.goto('/job-match'); await page.locator('#job-description').fill(sampleDescription); await page.getByRole('button', { name: 'Check My Fit' }).click();
  await expect(page.locator('#job-error')).toContainText('Provider unavailable'); await expect(page.locator('#job-description')).toBeEnabled();
  expect(await page.evaluate(() => (window as unknown as { streamCancelled: boolean }).streamCancelled)).toBe(true);
});

test('cancel and double-submit guards prevent stale status, result and finally from overwriting a newer request', async ({ page }) => {
  await page.addInitScript(({ first, second }) => {
    const original = window.fetch;
    const state = window as unknown as { calls: number; releaseOld: () => void };
    state.calls = 0;
    window.fetch = (input, init) => {
      if (!String(input).endsWith('/job-match')) return original(input, init);
      state.calls++;
      if (state.calls === 1) return new Promise(resolve => { state.releaseOld = () => resolve(new Response(first, { headers: { 'Content-Type': 'text/event-stream' } })); });
      return Promise.resolve(new Response(second, { headers: { 'Content-Type': 'text/event-stream' } }));
    };
  }, { first: 'event: status\ndata: {"message":"Stale status."}\n\n' + complete('Stale report.'), second: complete('New accepted report.') });
  await page.goto('/job-match'); await page.locator('#job-description').fill(sampleDescription); await page.getByRole('button', { name: 'Check My Fit' }).click();
  await page.locator('.ai-form').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(await page.evaluate(() => (window as unknown as { calls: number }).calls)).toBe(1);
  await page.getByRole('button', { name: 'Cancel comparison' }).click(); await expect(page.locator('#job-description')).toBeEnabled(); await expect(page.locator('#job-description')).toHaveValue(sampleDescription);
  await page.getByRole('button', { name: 'Try again', exact: true }).click(); await expect(page.locator('.ai-report')).toContainText('New accepted report.');
  await page.evaluate(() => (window as unknown as { releaseOld: () => void }).releaseOld());
  await expect(page.locator('.ai-report')).not.toContainText('Stale'); await expect(page.locator('.ai-result')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByRole('button', { name: 'Check My Fit' })).toBeEnabled();
});

test('the existing frontend deadline restores controls and never retries automatically', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.fetch; const state = window as unknown as { calls: number }; state.calls = 0;
    window.fetch = (input, init) => {
      if (!String(input).endsWith('/job-match')) return original(input, init);
      state.calls++; return new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
    };
  });
  await page.goto('/job-match'); await page.clock.install(); await page.locator('#job-description').fill(sampleDescription); await page.getByRole('button', { name: 'Check My Fit' }).click();
  await page.clock.fastForward(70_001); await expect(page.locator('#job-error')).toContainText('took too long'); await expect(page.locator('#job-description')).toBeEnabled();
  expect(await page.evaluate(() => (window as unknown as { calls: number }).calls)).toBe(1); await expect(page.locator('.ai-report')).toHaveCount(0);
});

test('UTF-8 and CRLF split at arbitrary byte boundaries still produce one complete report', async ({ page }) => {
  await page.addInitScript(body => {
    const original = window.fetch;
    window.fetch = (input, init) => String(input).endsWith('/job-match') ? Promise.resolve(new Response(new ReadableStream({
      start(controller) { for (const byte of new TextEncoder().encode(body)) controller.enqueue(new Uint8Array([byte])); controller.close(); },
    }), { headers: { 'Content-Type': 'text/event-stream' } })) : original(input, init);
  }, complete('React — العربية').replace(/\n/g, '\r\n'));
  await page.goto('/job-match'); await page.locator('#job-description').fill(sampleDescription); await page.getByRole('button', { name: 'Check My Fit' }).click();
  await expect(page.locator('.ai-report')).toContainText('React — العربية'); await expect(page.locator('.ai-report')).toHaveCount(1);
});

test('malformed result shape restores controls instead of rendering a broken report', async ({ page }) => {
  await page.route('**/api/job-match', route => route.fulfill({ contentType: 'text/event-stream', body: 'event: result\ndata: {"result":{"matchLevel":"Strong Match"},"cvToken":"partial"}\n\nevent: done\ndata: {}\n\n' }));
  await page.goto('/job-match'); await page.locator('#job-description').fill(sampleDescription); await page.getByRole('button', { name: 'Check My Fit' }).click();
  await expect(page.locator('#job-error')).toContainText('could not be read safely'); await expect(page.locator('.ai-report')).toHaveCount(0); await expect(page.locator('#job-description')).toBeEnabled();
});

test('leaving the route aborts work and an eventual stale response cannot become remembered success', async ({ page }) => {
  await page.addInitScript(body => {
    const original = window.fetch; const state = window as unknown as { releaseOld: () => void; wasAborted: boolean };
    window.fetch = (input, init) => {
      if (!String(input).endsWith('/job-match')) return original(input, init);
      init?.signal?.addEventListener('abort', () => { state.wasAborted = true; }, { once: true });
      return new Promise(resolve => { state.releaseOld = () => resolve(new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })); });
    };
  }, complete('Old route response.'));
  await page.goto('/job-match'); await page.locator('#job-description').fill(sampleDescription); await page.getByRole('button', { name: 'Check My Fit' }).click();
  await page.locator('header').getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.locator('.ai-form')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as unknown as { wasAborted: boolean }).wasAborted)).toBe(true);
  await page.evaluate(() => (window as unknown as { releaseOld: () => void }).releaseOld());
  await page.locator('header').getByRole('link', { name: 'AI Job Match', exact: true }).click();
  await expect(page.locator('#job-description')).toHaveValue(sampleDescription); await expect(page.locator('.ai-report')).toHaveCount(0); await expect(page.getByRole('button', { name: 'Check My Fit' })).toBeEnabled();
});
