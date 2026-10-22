import {expect,test,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {caseStudyProjects} from '../fixtures/case-study-projects';
import {caseImage} from '../fixtures/case-image';
const profile={name:'Mahmoud Hussein Abdul Ghani',title:'Full-Stack Software Engineer',professionalSummary:'Full underlying professional record.',photo:'/myphoto.jpeg',location:'Tripoli, Lebanon',languages:'Arabic and English',socials:[{label:'GitHub',url:'https://github.com/MahmoudAbdulGhani',published:true},{label:'LinkedIn',url:'https://linkedin.com/in/MahmoudAbdulGhani',published:true}],experience:[
 {id:'hub',company:'The Digital Hub, UNRWA, Beirut, Hybrid',role:'Full-Stack Developer Intern',startDate:'2026-06',endDate:'2026-09',description:'Completed a full-stack software engineering and AI program. Developing type-safe applications, authentication, data persistence and reviewed integrations.',bullets:['Documented collaborative contribution.']},
 {id:'trainer',company:'KfW & EU Graduate Support Program · FALA Association',role:'Web Development Trainer',startDate:'2025-04',endDate:'2025-06',description:'Mentored developers in programming logic, component workflows and deployment practices.'},
]};
async function fixtures(page:Page){
 const projects=caseStudyProjects.map(p=>({...p,contributions:p.slug==='jobpilot-ai'?['Worked on reviewed AI/manual profile integration.']:p.slug==='lobby'?['Contributed to guest access, invitation links and Supabase-backed services.']:p.slug==='construction-project-management-accounting-system'?['Refined accounting and financial workflows. Integrated AI using Groq.']:p.contributions}));
 await page.route('https://screens.example.test/**',async route=>route.fulfill({contentType:'image/png',body:await caseImage(route.request().url())}));
 await page.route('**/api/**',route=>{
  const p=new URL(route.request().url()).pathname;
  if(p==='/api/cv.pdf')return route.fulfill({contentType:'application/pdf',body:'%PDF-1.4\nSynthetic regression fixture; actual published PDF is checked in visual QA.'});
  return route.fulfill({json:p==='/api/profile'?profile:p==='/api/education'?[{id:'degree',degree:'Bachelor of Science in Computer Science',school:'Lebanese International University',startDate:'2022-10',endDate:'2025-06'}]:p==='/api/certifications'?[{id:'aws',title:'AWS re/Start Bootcamp — Cloud Computing & DevOps Fundamentals',issuer:'AWS',year:'July 2025 - Oct 2025',description:'Cloud training; completion expected in 2026.',expectedDate:'2026'},{id:'angular',title:'Angular Independent Study',issuer:'Self-directed learning',year:'09/2025'},{id:'other',title:'Full-Stack Web Development',issuer:'youbee.ai',year:'4-month program',description:'Practical full-stack web development training.'}]:p==='/api/technologies'?[{name:'Django',category:'frameworks'},{name:'Supabase',category:'databases'}]:p==='/api/skills'?[{name:'AI API Integration — OpenAI'},{name:'pytest'},{name:'Pytest'}]:p==='/api/projects'?projects:p.startsWith('/api/projects/')?projects.find(x=>p===`/api/projects/${x.slug}`):[]});
 });
}
test.beforeEach(async({page})=>{await fixtures(page);});
test('semantic tabs support arrows, Home/End and keep disclosure state while hidden panels leave the focus order',async({page})=>{
 await page.goto('/profile');const experience=page.getByRole('tab',{name:'Experience',exact:true});await experience.focus();
 await expect(experience).toHaveAttribute('aria-selected','true');const first=page.locator('.experience-record summary').first();await first.click();await expect(first).toHaveAttribute('aria-expanded','false');
 await experience.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('tab',{name:'Education & training'})).toBeFocused();await expect(page.getByRole('tabpanel',{name:'Education & training'})).toBeVisible();
 await expect(page.getByRole('tabpanel',{name:'Experience'})).toHaveCount(0);
 await page.keyboard.press('End');await expect(page.getByRole('tab',{name:'Capabilities'})).toBeFocused();await expect(page.getByRole('tabpanel',{name:'Capabilities'})).toBeVisible();
 await page.keyboard.press('Home');await expect(experience).toBeFocused();await expect(first).toHaveAttribute('aria-expanded','false');
 await page.keyboard.press('ArrowLeft');await expect(page.getByRole('tab',{name:'Capabilities'})).toBeFocused();await page.keyboard.press('ArrowRight');await expect(experience).toBeFocused();
 expect((await new AxeBuilder({page}).include('.profile-page').analyze()).violations).toEqual([]);
});
test('confirmed background and dates remain factual; other training does not imply completion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/profile');const first=page.locator('.experience-record details').first();await first.locator('summary').click();
 await expect(first.locator('.record-date')).toHaveText('Jun 2026 – Sep 2026');await expect(page.locator('.learning-status')).toHaveCount(0);
 await expect(first.locator('strong')).toHaveText('Full-Stack Developer Intern');await expect(first.locator('.record-organization')).toContainText('Digital Hub');
 await first.locator('summary').press('Enter');await expect(first.locator('.record-detail')).toContainText('Completed a full-stack');await expect(first.locator('.record-detail')).toContainText('Documented collaborative contribution.');
 await page.getByRole('tab',{name:'Education & training'}).click();await expect(page.locator('.education-record')).toContainText('Graduated with a BSc in Computer Science.');await expect(page.locator('.training-record')).toContainText('Jul 2025 – Oct 2025');await expect(page.locator('.training-record')).toContainText('Cloud training.');await expect(page.locator('.training-record')).not.toContainText(/expected|completed|certified|not verified/i);
 await expect(page.locator('.training-record')).toContainText('Self-directed study of Angular.');await expect(page.locator('.training-record')).toContainText('Practical full-stack web development training.');
 await page.reload();await expect(page.locator('.record-detail').first()).toContainText('Completed a full-stack');await page.getByRole('tab',{name:'Education & training'}).click();await expect(page.locator('.education-record')).toContainText('Graduated with a BSc in Computer Science.');await expect(page.locator('.profile-page')).not.toContainText(/not (?:independently )?verified|available records/);
});
test('three contribution-supported references reach the actual engineering sections with explicit team scope',async({page})=>{
 for(const [key,slug,title,team]of [['ai api integration','jobpilot-ai','Reviewed AI changes',false],['django','construction-project-management-accounting-system','Financial calculation and interpretation',true],['supabase','lobby','Guest membership and call access',true]] as const){
  await page.goto('/profile');await page.getByRole('tab',{name:'Capabilities'}).click();const row=page.locator(`[data-evidence-project="${slug}"]`),link=row.getByRole('link');
  await expect(page.locator(`[data-competency="${key}"]`)).toHaveCount(1);
  await expect(link).toHaveAttribute('href',`/projects/${slug}#engineering`);await expect(link).toContainText(title);await expect(row.locator('.profile-evidence-scope')).toHaveText(team?'Team-project evidence':'Project evidence');await link.focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/projects/${slug}#engineering$`));await expect(page.locator('#engineering')).toBeInViewport();
  await expect(page.getByRole('region',{name:slug==='jobpilot-ai'?'The profile save boundary':slug==='lobby'?'Lobby connection and access':'Cedar calculation and interpretation'})).toBeVisible();
 }
});
test('rapid disclosure/tab changes and reduced motion preserve readable content; links and CV still work',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/profile');const first=page.locator('.experience-record summary').first();
 await first.evaluate(el=>{(el as HTMLElement).click();(el as HTMLElement).click();});
 await page.getByRole('tab',{name:'Capabilities'}).click();await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('tab',{name:'Experience',exact:true}).click();await expect(first).toHaveAttribute('aria-expanded','true');await expect(page.locator('.experience-record .disclosure-content').first()).toHaveCSS('opacity','1');
 await expect(page.getByRole('link',{name:'GitHub',exact:true})).toHaveAttribute('target','_blank');await expect(page.getByRole('link',{name:'LinkedIn',exact:true})).toHaveAttribute('rel','noopener noreferrer');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CV',exact:true}).click();expect((await download).suggestedFilename()).toBe('portfolio-cv.pdf');
});
for(const [width,height]of [[1440,900],[1440,650],[768,1024],[390,844],[320,844]])test(`all records keep readable dates and aligned disclosures at ${width}×${height}`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width,height});await page.goto('/profile');
 for(const name of ['Experience','Education & training','Capabilities']){
  await page.getByRole('tab',{name,exact:true}).click();
  const metric=await page.locator('.profile-page').evaluate(el=>({overflow:el.scrollWidth>el.clientWidth||document.documentElement.scrollWidth>innerWidth,dates:[...el.querySelectorAll('.record-date')].filter(e=>e.getClientRects().length).map(e=>parseFloat(getComputedStyle(e).fontSize)),body:[...el.querySelectorAll('.record-detail p,.education-record p:not(.record-date,.learning-status)')].filter(e=>e.getClientRects().length).map(e=>({size:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight)})),tabs:[...el.querySelectorAll('[role="tab"]')].map(e=>e.getBoundingClientRect().height)}));
  expect(metric.overflow).toBe(false);expect(Math.min(...metric.tabs)).toBeGreaterThanOrEqual(44);for(const size of metric.dates)expect(size).toBeGreaterThanOrEqual(14);for(const b of metric.body){expect(b.size).toBeGreaterThanOrEqual(15);expect(b.line).toBeGreaterThanOrEqual(24);expect(b.line).toBeLessThanOrEqual(26);}
 }
 await page.getByRole('tab',{name:'Experience',exact:true}).click();for(const summary of await page.locator('.experience-record summary').all()){
  await summary.focus();if(await summary.getAttribute('aria-expanded')==='false')await summary.press('Enter');
  const bounds=await summary.evaluate(el=>({copy:el.querySelector('.record-copy')!.getBoundingClientRect(),detail:el.parentElement!.querySelector('.record-detail p')!.getBoundingClientRect(),indicator:el.querySelector('.disclosure-indicator')!.getBoundingClientRect()}));expect(bounds.detail.x).toBeCloseTo(bounds.copy.x,0);expect(bounds.indicator.x).toBeGreaterThan(bounds.copy.x+bounds.copy.width-1);
 }
});
