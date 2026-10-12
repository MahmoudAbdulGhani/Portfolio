import {chromium,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const content=JSON.parse(await readFile('.motion-preview/public-content.json','utf8'));
const base=process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:5190';
const browser=await chromium.launch({channel:'chrome'}),findings=[];
try {
 for(const width of [1440,390,320]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.route('**/api/**',route=>{const p=new URL(route.request().url()).pathname;return route.fulfill({json:content[p]??content['/api/projects'].find(x=>p===`/api/projects/${x.slug}`)??[]});});
  await page.route('https://**',route=>route.abort());
  for(const key of ['ai api integration','django','supabase']) {
   await page.goto(`${base}/profile`);
   await expect(page.locator('.experience-record details')).toHaveCount(4);
   const entries=await page.locator('.experience-record details').evaluateAll(es=>es.map(e=>{const bounds=e.getBoundingClientRect(),indicator=e.querySelector('.disclosure-indicator').getBoundingClientRect();return{width:e.clientWidth,scrollWidth:e.scrollWidth,bounds:bounds.width,indicatorBeyondEntry:indicator.right-bounds.right,textBeyondEntry:Math.max(...[...e.querySelectorAll('.record-copy,.record-detail p')].map(x=>x.getBoundingClientRect().right-bounds.right))};}));
   await page.getByRole('tab',{name:'Capabilities'}).click();
   const link=page.locator(`[data-competency="${key}"] .profile-evidence-link`);
   const label=await link.innerText(),href=await link.getAttribute('href');
   await link.focus();await page.keyboard.press('Enter');
   await expect(page.locator('#engineering')).toBeInViewport();
   await expect(page.getByRole('region',{name:key==='ai api integration'?'The profile save boundary':key==='django'?'Cedar calculation and interpretation':'Lobby connection and access'})).toBeVisible();
   await page.screenshot({path:`docs/design/profile-record/after/${width}-evidence-${key.replaceAll(' ','-')}.jpg`,quality:86});
   findings.push({width,key,label,href,heading:await page.locator('#engineering').innerText(),entries});
  }
  await page.close();
 }
}finally{await browser.close();}
await writeFile('docs/design/profile-record/evidence-destinations.json',JSON.stringify({environment:'Actual current public records, keyboard navigation, Windows Chrome; phone sizes/reduced motion emulated.',findings},null,2)+'\n');
