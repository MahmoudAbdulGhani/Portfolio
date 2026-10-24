import {test,expect} from '@playwright/test';
import {caseStudyProjects} from '../fixtures/case-study-projects';
import {caseImage} from '../fixtures/case-image';
const profile={name:'Mahmoud Hussein Abdul Ghani',title:'Full-Stack Software Engineer',socials:[],location:'Tripoli, Lebanon',languages:'Arabic and English',experience:[
 {id:'hub',role:'Full-Stack Developer Intern',company:'The Digital Hub, UNRWA, Beirut, Hybrid',location:'Beirut, Hybrid',startDate:'2026-06',endDate:'2026-09',description:'Completing an intensive full-stack software engineering and AI program. Developing type-safe React apps; implementing secure SQL and NoSQL data layers. Beirut, Hybrid.'},
 {id:'fala',role:'Web Development Trainer',company:'FALA Association',startDate:'2025-04',endDate:'2025-06',description:'Mentored developers on procedural engineering logic, component workflows, and industry-standard deployment structures.'},
]};
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://screens.example.test/**',async route=>route.fulfill({contentType:'image/png',body:await caseImage(route.request().url())}));
 await page.route('**/api/**',route=>{
  const path=new URL(route.request().url()).pathname;
  return route.fulfill({json:path==='/api/profile'?profile:path==='/api/projects'?caseStudyProjects:path.startsWith('/api/projects/')?caseStudyProjects.find(project=>path===`/api/projects/${project.slug}`):[]});
 });
});
for(const width of [320,390,430,768,1440])test(`public copy survives reload with product scope and readable wrapping at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/profile');
 for(const refresh of [false,true]){
  if(refresh)await page.reload();
  const first=page.locator('.experience-record details').first();
  await expect(first).toContainText('Completed a full-stack');await expect(first).toContainText('Developed type-safe');await expect(first).not.toContainText('Developing');
  await expect(first.locator('.record-date')).toHaveText('Jun 2026 – Sep 2026');await expect(first.locator('.record-organization')).toContainText('Beirut, Hybrid');await expect(first.locator('.record-detail')).not.toContainText('Beirut, Hybrid');
  const fala=page.locator('.experience-record details').nth(1);await fala.locator('summary').click();await expect(fala).toContainText('programming logic and component-based workflows');await expect(fala).not.toContainText('procedural engineering logic');
  expect(await page.locator('.profile-page').evaluate(e=>e.scrollWidth<=e.clientWidth&&document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 for(const slug of ['medicare-hub','home-services']){
  await page.goto(`/projects/${slug}`);await expect(page.locator('.case-purpose')).toBeVisible();
  await page.reload();await expect(page.locator('.case-purpose')).not.toContainText(/ownership.*undocumented|attribution-review/i);
  await expect(page.locator('.story-scope')).not.toContainText(/personal (?:ownership|attribution).*undocumented/i);
  if(slug==='home-services'){
   await expect(page.locator('.story-credit a')).toHaveAttribute('href',/figma.com/);await expect(page.locator('.story-scope')).toContainText('placeholder navigation anchors');await expect(page.locator('.case-purpose')).toContainText('supplied Figma UI kit');
  }else await expect(page.locator('.story-scope')).toContainText('the diagram explains the patient appointment flow');
  expect(await page.locator('.project-reader').evaluate(e=>e.scrollWidth<=e.clientWidth&&document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
 }
});
