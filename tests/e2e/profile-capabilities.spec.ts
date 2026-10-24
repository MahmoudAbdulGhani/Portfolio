import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {caseStudyProjects} from '../fixtures/case-study-projects';
import {caseImage} from '../fixtures/case-image';
const keys=['javascript','html','css','django','mysql','mariadb','supabase','git','github','ai api integration','argon2','pytest'];
test.beforeEach(async({page})=>{
 const projects=caseStudyProjects.map(p=>({...p,stack:p.slug==='jobpilot-ai'?['JavaScript']:p.slug==='construction-project-management-accounting-system'?['HTML','CSS']:p.slug==='lobby'?['Supabase']:p.slug==='unihub'?['Git']:p.slug==='gamezone-arena'?['GitHub']:p.slug==='full-stack-user-management-system'?['Argon2']:[],contributions:p.slug==='jobpilot-ai'?['Reviewed AI/manual profile integration.']:p.slug==='construction-project-management-accounting-system'?['Financial accounting workflows and AI using Groq.']:p.slug==='lobby'?['Guest invitations and Supabase services.']:['Documented contribution.']}));
 await page.route('https://screens.example.test/**',async route=>route.fulfill({contentType:'image/png',body:await caseImage(route.request().url())}));
 await page.route('**/api/**',route=>{
  const p=new URL(route.request().url()).pathname;
  return route.fulfill({json:p==='/api/profile'?{name:'Owner',title:'Developer',experience:[],socials:[]}:p==='/api/technologies'?[{name:'JavaScript',category:'languages'},{name:'HTML & CSS',category:'languages'},{name:'Django',category:'frameworks'},{name:'MySQL / MariaDB',category:'databases'},{name:'Supabase',category:'databases'},{name:'Git & GitHub',category:'ops'}]:p==='/api/skills'?['JavaScript','HTML5','CSS3','MySQL','MariaDB','Git','GitHub','AI API Integration — OpenAI','Argon2 Password Hashing','pytest','Pytest'].map(name=>({name})):p==='/api/projects'?projects:p.startsWith('/api/projects/')?projects.find(x=>p===`/api/projects/${x.slug}`):[]});
 });
});
for(const width of [1440,768,390,320])test(`inventory and consolidated evidence stay readable at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/profile');await page.getByRole('tab',{name:'Capabilities'}).click();
 await expect(page.locator('[data-capability-category]')).toHaveCount(5);
 await expect(page.locator('[data-competency]')).toHaveCount(keys.length);
 for(const key of keys)await expect(page.locator(`[data-competency="${key}"]`)).toHaveCount(1);
 await expect(page.locator('[data-competency="ai api integration"]')).toContainText('OpenAI');await expect(page.locator('[data-competency="argon2"]')).toContainText('Password hashing');
 await expect(page.locator('[data-competency] a')).toHaveCount(0);await expect(page.locator('.profile-evidence-row')).toHaveCount(3);
 const summary=page.locator('.profile-additional-evidence summary');await summary.focus();await page.keyboard.press('Enter');await expect(summary).toHaveAttribute('aria-expanded','true');
 const links=await page.locator('.capability-record a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));expect(links).toHaveLength(6);expect(new Set(links).size).toBe(6);
 const metrics=await page.locator('.capability-record').evaluate(el=>({overflow:el.scrollWidth>el.clientWidth||document.documentElement.scrollWidth>innerWidth,sizes:[...el.querySelectorAll('[data-competency],.competency-detail,.profile-evidence-row p')].map(e=>({size:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight)}))}));
 expect(metrics.overflow).toBe(false);for(const m of metrics.sizes){expect(m.size).toBeGreaterThanOrEqual(15);expect(m.line).toBeGreaterThanOrEqual(24);}
 expect((await new AxeBuilder({page}).include('.capability-record').analyze()).violations).toEqual([]);
});
test('additional references retain associations and keyboard disclosure state across tab changes and reduced motion',async({page})=>{
 await page.goto('/profile');await page.getByRole('tab',{name:'Capabilities'}).click();const summary=page.locator('.profile-additional-evidence summary');
 await summary.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(summary).toBeFocused();await expect(summary).toHaveCSS('outline-style','solid');await page.keyboard.press('Space');await expect(summary).toHaveAttribute('aria-expanded','true');
 for(const [slug,name]of [['unihub','Git'],['gamezone-arena','GitHub'],['full-stack-user-management-system','Argon2']])await expect(page.locator(`[data-evidence-project="${slug}"] .profile-evidence-associations`)).toContainText(name);
 await summary.evaluate(el=>{(el as HTMLElement).click();(el as HTMLElement).click();});await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('tab',{name:'Experience',exact:true}).click();await page.getByRole('tab',{name:'Capabilities'}).click();await expect(summary).toHaveAttribute('aria-expanded','true');
 await summary.press('Enter');await expect(summary).toHaveAttribute('aria-expanded','false');await expect(page.locator('[data-evidence-project="unihub"] a')).not.toBeVisible();
});
test('every consolidated link reaches its engineering section once with scope and numbering preserved',async({page})=>{
 for(const slug of ['jobpilot-ai','construction-project-management-accounting-system','lobby','unihub','gamezone-arena','full-stack-user-management-system']){
  await page.goto('/profile');await page.getByRole('tab',{name:'Capabilities'}).click();const row=page.locator(`[data-evidence-project="${slug}"]`);
  if(!await row.isVisible())await page.locator('.profile-additional-evidence summary').press('Enter');
  await expect(row.getByRole('link')).toHaveCount(1);await expect(row.getByRole('link')).toHaveAttribute('href',`/projects/${slug}#engineering`);
  if(['lobby','construction-project-management-accounting-system'].includes(slug))await expect(row).toContainText('View team project');
  if(slug==='jobpilot-ai')await expect(row.locator('.record-number')).toHaveText('01');
  await row.getByRole('link').focus();await page.keyboard.press('Enter');await expect(page.locator('#engineering')).toBeInViewport();
 }
});
