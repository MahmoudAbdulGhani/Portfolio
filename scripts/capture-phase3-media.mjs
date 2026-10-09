// Authentic deployed frontends. GameZone uses explicitly synthetic API data;
// all network writes are blocked and no booking/payment/form is submitted.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const masters = 'docs/design/phase3/media-masters';
const output = 'public/projects/phase3';
await mkdir(masters, { recursive: true });
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const captures = [];
async function save(page, name, evidence) {
  await page.evaluate(() => document.fonts.ready);
  for (const image of await page.locator('img').all()) await image.evaluate(img => img.decode().catch(() => {}));
  await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
  const original = `${masters}/${name}.png`;
  const asset = `${output}/${name}.webp`;
  const bytes = await page.screenshot({ fullPage: true });
  await writeFile(original, bytes);
  await sharp(bytes).webp({ lossless: true }).toFile(asset);
  captures.push({ name, original, asset, ...evidence });
}
try {
  const page = await browser.newPage({ viewport: { width: 1363, height: 936 }, deviceScaleFactor: 2, reducedMotion: 'reduce', timezoneId: 'Asia/Beirut' });
  const blocked = [];
  await page.route('**/*', route => {
    if (['GET', 'HEAD'].includes(route.request().method())) return route.continue();
    blocked.push(new URL(route.request().url()).pathname); return route.abort();
  });
  const rooms = ['pc', 'console', 'vr', 'private'].map((type, index) => ({
    _id: `demo-room-${type}`, name: `Demo ${type === 'pc' ? 'PC' : type === 'vr' ? 'VR' : type === 'console' ? 'Console' : 'Private'} Room`, type,
    description: 'Demonstration room for the portfolio workflow.', images: [], pricePerHour: [8, 10, 12, 20][index],
    totalDevices: 3, status: 'active', createdAt: '2026-10-09', updatedAt: '2026-10-09',
  }));
  await page.route('**/api/**', route => {
    if (route.request().method() !== 'GET') return route.abort();
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/rooms') return route.fulfill({ json: rooms });
    if (/^\/api\/rooms\/[^/]+\/devices$/.test(path)) return route.fulfill({ json: [1, 2, 3].map(index => ({ _id: `demo-device-${index}`, roomId: path.split('/')[3], deviceLabel: `Demo station ${index}`, status: 'available', specs: 'Demonstration gaming station', createdAt: '2026-10-09' })) });
    if (path === '/api/bookings/check-conflicts') return route.fulfill({ json: { bookedDeviceIds: [] } });
    return route.fulfill({ status: 404, json: { error: 'Not part of the read-only UI demonstration' } });
  });
  const gameEvidence = { source: 'https://gaming-arena-reservation-system.vercel.app/booking', data: 'Synthetic demonstration rooms, devices, prices and availability; no private records', verification: 'Real deployed frontend interaction only. Every API response is intercepted; backend booking/availability/payment behavior is unverified.', sourceRevision: '2b25a97621c5956c3ea24a2b3a5206fbef6506d9', deployedRevision: 'not independently verified', viewport: { width: 1363, height: 936, dpr: 2 }, modifications: 'Lossless format conversion, then the existing responsive image pipeline; no painted-over indicator, UI fabrication, DOM styling or screenshot crop' };
  await page.goto(gameEvidence.source, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Choose a Room', exact: true }).waitFor();
  await save(page, 'gamezone-rooms', gameEvidence);
  await page.getByRole('radio').filter({ hasText: 'Demo PC Room' }).click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('heading', { name: 'Pick a Date & Time', exact: true }).waitFor();
  await page.getByRole('group', { name: 'Select date', exact: true }).locator('button:not([disabled])').last().click();
  await page.getByRole('button', { name: '12:00 PM', exact: true }).click();
  await save(page, 'gamezone-session', gameEvidence);
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('heading', { name: /Select.*Device/ }).waitFor();
  await page.getByRole('button').filter({ hasText: 'Demo station 1' }).click();
  await save(page, 'gamezone-devices', gameEvidence);
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('heading', { name: 'Confirm & Pay', exact: true }).waitFor();
  await page.getByRole('radio', { name: 'Cash', exact: true }).click();
  await save(page, 'gamezone-review', gameEvidence);
  // Never activate the final booking/payment control.
  await page.close();

  const registration = await browser.newPage({ viewport: { width: 520, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await registration.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  await registration.goto('https://fastapi-user-management.vercel.app/register', { waitUntil: 'domcontentloaded' });
  await registration.getByRole('heading', { name: 'Create Account', exact: true }).waitFor();
  await save(registration, 'user-management-registration', { source: registration.url(), data: 'Original empty form and template placeholders; no account or private records', viewport: { width: 520, height: 844, dpr: 2 }, verification: 'Public form rendering only; no registration submitted. The earlier 390px probe exposed a 491px navigation width and overlapping password icon in the source app; this portrait capture does not certify phone usability.', modifications: 'Lossless format conversion, then responsive optimization; full document retained' });
  await registration.close();

  const clinic = await browser.newPage({ viewport: { width: 1363, height: 936 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await clinic.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  await clinic.goto('https://clinic-management-system.kesug.com/', { waitUntil: 'domcontentloaded' });
  await clinic.getByRole('heading', { name: 'Welcome to Medicare Hub', exact: true }).waitFor();
  await clinic.evaluate(() => document.fonts.ready);
  for (const image of await clinic.locator('img').all()) await image.evaluate(img => img.decode().catch(() => {}));
  await clinic.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))); });
  // A viewport capture shows the public homepage without exposing form inputs.
  const bytes = await clinic.screenshot();
  await writeFile(`${masters}/medicare-homepage.png`, bytes);
  await sharp(bytes).webp({ lossless: true }).toFile(`${output}/medicare-homepage.webp`);
  await clinic.getByRole('link', { name: 'Login', exact: true }).click();
  await clinic.locator('input').first().waitFor();
  const login = { url: clinic.url(), headings: await clinic.locator('h1,h2').allTextContents(), forms: await clinic.locator('form').count() };
  captures.push({ name: 'medicare-homepage', original: `${masters}/medicare-homepage.png`, asset: `${output}/medicare-homepage.webp`, source: 'https://clinic-management-system.kesug.com/', viewport: { width: 1363, height: 936, dpr: 2 }, data: 'Public landing page only; no clinical records', verification: 'Public homepage and login reachable through GET; authenticated clinical workflow remains unavailable', login, modifications: 'Unmodified browser viewport and lossless format conversion, then responsive optimization' });
  await clinic.close();
  await writeFile('docs/design/phase3/media-captures.json', JSON.stringify({ date: new Date().toISOString(), writes: 'All non-GET/HEAD network requests blocked; no submitted booking, payment, account, clinical operation or Contact form', gamezoneBlockedRequestCount: blocked.length, captures }, null, 2) + '\n');
  console.log(JSON.stringify({ authenticFrontendCaptures: captures.length, gamezone: 'Synthetic data, no backend validation', registration: 'Empty public form', medicare: 'Public homepage; authenticated workflow unavailable' }));
} finally { await browser.close(); }
