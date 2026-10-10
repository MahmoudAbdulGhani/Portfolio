// Authored rectangles retain complete task controls from genuine originals.
// This file records composition, not a dimension-driven crop heuristic.
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const inventory = JSON.parse(await readFile('docs/design/mobile-case-media/before/findings.json', 'utf8')).inventory;
const originals = JSON.parse(await readFile('docs/design/phase3/published-image-dimensions.json', 'utf8')).records;
const remote = Object.fromEntries(originals.map(item => [item.identity, item]));
const rect = (name, label, left, top, width, height) => ({ name, label, left, top, width, height });
const decisions = {
  '79bf6e53-1fb5-4453-a438-fb5ead4a4961.png': [rect('jobpilot-source', 'Source and city filters', 390, 600, 480, 277), rect('jobpilot-location', 'Country and sort filters', 870, 650, 475, 227)],
  'aba248de-e871-483a-b413-e0db8d4df718.png': [rect('jobpilot-workspace', 'Saved role and workspace identity', 330, 120, 1000, 310), rect('jobpilot-posting', 'Original posting reference', 1640, 350, 258, 80), rect('jobpilot-tabs', 'Overview, application pack and tracking tabs', 330, 435, 670, 100)],
  '8a7fd732-16a0-4b77-a1ad-8ad92e6151f1.png': [rect('jobpilot-voice', 'Complete voice consent and draft-status panel', 490, 238, 1220, 495), rect('jobpilot-voice-action', 'Start voice practice or choose text instead', 515, 562, 360, 169)],
  '/projects/lobby/guest-access.webp': [rect('lobby-join', 'Invitation code and Join room action', 915, 440, 415, 270)],
  '/projects/lobby/share-room.webp': [rect('lobby-invite', 'Complete invitation dialog, QR and sharing actions', 637, 53, 646, 770)],
  '/projects/lobby/audio-room.webp': [rect('lobby-call', 'Audio and chat context', 28, 210, 900, 375), rect('lobby-call-actions', 'Start audio or hide chat', 45, 505, 430, 80), rect('lobby-chat', 'Complete chat panel and message composer', 1430, 70, 489, 793)],
  'b5279347-d2cd-41a6-ac25-84b2cbf7fe71.png': [rect('cedar-summary', 'Project identity, actions and section tabs', 365, 170, 1520, 230), rect('cedar-budget', 'Contract value and approved budget', 365, 400, 745, 255), rect('cedar-cost', 'Actual cost and forecast profit', 1130, 400, 755, 255), rect('cedar-progress', 'Complete phase progress and detailed-plan action', 365, 670, 910, 510)],
  'c6dd1c73-c5dc-4e0c-b30b-3b521d7b5ac5.png': [rect('cedar-posted', 'Posted revenue and expense totals', 365, 278, 600, 190), rect('cedar-receivables', 'Outstanding receivables from unpaid invoices', 1290, 278, 300, 190), rect('cedar-profit', 'Complete Profit & Loss report tile', 365, 465, 493, 300), rect('cedar-inventory', 'Inventory valuation remains Coming soon', 888, 780, 500, 300)],
  '/projects/unihub/transcipt.webp': [rect('unihub-document', 'Complete demonstration transcript document', 655, 195, 962, 701)],
};
const phoneTasks = Object.fromEntries(['session','devices','review'].map(name => [`/projects/phase3/gamezone-${name}.webp`, `/projects/case-media/gamezone-${name}-phone-task.webp`]));
await mkdir('public/projects/case-media', { recursive: true });
const entries = [], compositions = [];
for (const entry of inventory) {
  const identity = entry.src.startsWith('/') ? entry.src : entry.src.split('/').at(-1);
  const file = identity.startsWith('/') ? `public${identity}` : remote[identity].file;
  const bytes = await readFile(file), dimensions = await sharp(bytes).metadata();
  const role = /identity|artwork/i.test(entry.title) ? 'artwork' : /phone|mobile/i.test(entry.title) ? 'phone' : /tablet/i.test(entry.title) ? 'tablet' : /transcript/i.test(entry.title) ? 'document' : /registration|advisor/i.test(entry.title) ? 'task' : 'overview';
  const details = [];
  for (const crop of decisions[identity] ?? []) {
    const src = `/projects/case-media/${crop.name}.webp`;
    await sharp(bytes).extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height }).webp({ lossless: true }).toFile(`public${src}`);
    details.push({ src, label: crop.label, width: crop.width, height: crop.height });
    compositions.push({ original: entry.src, originalSha256: createHash('sha256').update(bytes).digest('hex'), detail: src, label: crop.label, rectangle: { left: crop.left, top: crop.top, width: crop.width, height: crop.height }, modifications: 'Rectangular extraction and lossless WebP. No pixel replacement, UI fabrication or CSS enlargement.' });
  }
  const mobile = phoneTasks[identity];
  let mobileDimensions;
  if (mobile) { const size = await sharp(`public${mobile}`).metadata(); mobileDimensions = { src: mobile, fullSrc: mobile.replace('-phone-task.webp', '-phone.webp'), width: size.width, height: size.height, label: entry.title }; }
  entries.push({ slug: entry.slug, identity, label: entry.title, role, width: dimensions.width, height: dimensions.height, details, ...(mobileDimensions ? { mobile: mobileDimensions } : {}), decision: details.length ? 'Authored complete task details; full original remains available.' : mobile ? 'Genuine same-task phone capture for workflow; complete desktop original retained in gallery.' : role === 'artwork' ? 'Contained identity/artwork; no workflow claim.' : role === 'phone' || role === 'tablet' ? 'Complete authentic capture; no forced desktop proportions or workflow substitution.' : 'Uncropped original at measured proportions; use viewer for fine detail.' });
}
await writeFile('src/generated/case-media.ts', `// Reviewed media identities and measured originals. Generated by scripts/prepare-case-media.mjs.\nexport type MediaDetail = { src: string; label: string; width: number; height: number };\nexport type CaseMedia = { slug: string; identity: string; label: string; role: 'overview' | 'task' | 'document' | 'phone' | 'tablet' | 'artwork'; width: number; height: number; details: MediaDetail[]; mobile?: MediaDetail & { fullSrc: string }; decision: string };\nexport const caseMedia: CaseMedia[] = ${JSON.stringify(entries, null, 2)};\n`);
await writeFile('docs/design/mobile-case-media/compositions.json', JSON.stringify({ entries: entries.length, compositions }, null, 2));
console.log(`${entries.length} reviewed entries / ${compositions.length} authored details.`);
