// Genuine deployed GameZone UI with synthetic read-only demonstration records.
// No authentication, reservation, payment or backend write is performed.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const output = 'public/projects/case-media';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const captures = [];
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce', timezoneId: 'Asia/Beirut' });
  // A declared demonstration clock makes the pictured date/slot reproducible.
  await page.clock.setFixedTime(new Date('2026-10-10T08:00:00+03:00'));
  await page.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  const rooms = [{ _id: 'demo-room-pc', name: 'Demo PC Room', type: 'pc', description: 'Demonstration room for the portfolio workflow.', images: [], pricePerHour: 8, totalDevices: 3, status: 'active', createdAt: '2026-10-10', updatedAt: '2026-10-10' }];
  await page.route('**/api/**', route => {
    if (route.request().method() !== 'GET') return route.abort();
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/rooms') return route.fulfill({ json: rooms });
    if (/^\/api\/rooms\/[^/]+\/devices$/.test(path)) return route.fulfill({ json: [1, 2, 3].map(index => ({ _id: `demo-device-${index}`, roomId: 'demo-room-pc', deviceLabel: `Demo station ${index}`, status: 'available', specs: 'Demonstration gaming station', createdAt: '2026-10-10' })) });
    if (path === '/api/bookings/check-conflicts') return route.fulfill({ json: { bookedDeviceIds: [] } });
    return route.fulfill({ status: 404, json: { error: 'Outside read-only demonstration' } });
  });
  await page.goto('https://gaming-arena-reservation-system.vercel.app/booking');
  await page.getByRole('radio').filter({ hasText: 'Demo PC Room' }).click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('heading', { name: 'Pick a Date & Time', exact: true }).waitFor();
  await page.getByRole('group', { name: 'Select date', exact: true }).locator('button:not([disabled])').last().click();
  await page.getByRole('button', { name: '12:00 PM', exact: true }).click();
  async function save(name) {
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => scrollTo(0, 0));
    for (const img of await page.locator('img').all()) await img.evaluate(node => node.decode().catch(() => {}));
    const bytes = await page.screenshot({ fullPage: true });
    await sharp(bytes).webp({ lossless: true }).toFile(`${output}/${name}-phone.webp`);
    const footer = await page.locator('footer').boundingBox();
    if (!footer) throw new Error('Missing page boundary');
    const task = { left: 0, top: 80, width: 390, height: Math.floor(footer.y) - 80 };
    await sharp(bytes).extract(task).webp({ lossless: true }).toFile(`${output}/${name}-phone-task.webp`);
    captures.push({ name, source: page.url(), viewport: { width: 390, height: 844, dpr: 1 }, demonstrationClock: '2026-10-10T08:00:00+03:00', asset: `${output}/${name}-phone.webp`, taskAsset: `${output}/${name}-phone-task.webp`, taskRectangle: task, data: 'Synthetic demonstration rooms, devices, prices and availability.', limitations: 'Frontend rendering only; deployed revision not independently verified. No booking, payment or backend availability established.', modifications: 'Full document and complete booking section, lossless WebP conversion followed by the existing responsive optimizer. No DOM styling or fabricated UI.' });
  }
  await save('gamezone-session');
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('heading', { name: /Select.*Device/ }).waitFor();
  await page.getByRole('button').filter({ hasText: 'Demo station 1' }).click();
  await save('gamezone-devices');
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('heading', { name: 'Confirm & Pay', exact: true }).waitFor();
  await page.getByRole('radio', { name: 'Cash', exact: true }).click();
  await save('gamezone-review');
  await mkdir('docs/design/mobile-case-media', { recursive: true });
  await writeFile('docs/design/mobile-case-media/phone-captures.json', JSON.stringify({ date: new Date().toISOString(), writes: 'All non-GET/HEAD requests blocked; final submission never activated.', captures }, null, 2));
  console.log('Captured three genuine phone workflows; synthetic data; no submission.');
} finally { await browser.close(); }
