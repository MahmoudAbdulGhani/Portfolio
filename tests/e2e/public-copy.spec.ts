import { test, expect, type Page } from '@playwright/test';
import { caseStudyProjects } from '../fixtures/case-study-projects';
import { caseImage } from '../fixtures/case-image';
import { sampleMatch, sampleDescription } from '../fixtures/supporting-pages.mjs';

const internalCopy = /owner-confirmed|undocumented|unverified|not independently verified|available records|source inspected|source reviewed|inspected (?:source|implementation|posting)|supporting team evidence|production accounting audit/i;
const profile = { name: 'Mahmoud Hussein Abdul Ghani', title: 'Full-Stack Software Engineer', location: 'Tripoli, Lebanon', languages: 'Arabic | English', socials: [], experience: [{ role: 'Full-Stack Developer Intern', company: 'The Digital Hub, UNRWA', startDate: '2026-06', endDate: '2026-09', description: 'Completing an intensive full-stack software engineering and AI program. Completion is not independently verified by the available records.' }] };
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://screens.example.test/**', async route => route.fulfill({ contentType: 'image/png', body: await caseImage(route.request().url()) }));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/job-match') return route.fulfill({ contentType: 'text/event-stream', body: `event: result\ndata: ${JSON.stringify({ result: sampleMatch })}\n\nevent: done\ndata: {}\n\n` });
    const data = path === '/api/profile' ? profile : path === '/api/projects' ? caseStudyProjects
      : path.startsWith('/api/projects/') ? caseStudyProjects.find(p => path === `/api/projects/${p.slug}`)
      : path === '/api/education' ? [{ school: 'Lebanese International University', degree: 'BSc in Computer Science', details: 'Program completion is not verified by the available records.' }]
      : path === '/api/certifications' ? [{ title: 'Angular Independent Study' }, { title: 'AWS re/Start Bootcamp', description: 'Cloud computing training. Completion and certification are not verified by the available records.' }]
      : path === '/api/site-content' ? [{ key: 'jobMatch', description: 'Compare a job description with the saved portfolio skills, projects, experience, education, and certifications.', content: { seoDescription: "Compare a job description with the portfolio owner's verified skills, projects, experience, education, and certifications." } }] : [];
    return route.fulfill({ json: data });
  });
});

const clean = async (page: Page) => {
    await expect(page.locator('main')).not.toContainText(internalCopy);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
};
for (const width of [320, 390, 430, 768, 1440]) {
 for (const start of [0, 4]) test(`professional public case-study copy and attribution ${start + 1}–${start + 4} at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  for (const project of caseStudyProjects.slice(start, start + 4)) {
    await page.goto(`/projects/${project.slug}`);
    await expect(page.locator('.case-purpose')).toBeVisible();
    for (const summary of await page.locator('.case-narrative details summary').all()) await summary.click();
    await clean(page);
    if (project.slug === 'home-services') {
      await expect(page.locator('.story-credit a')).toHaveAttribute('href', /figma.com/);
      await expect(page.locator('.story-scope')).toContainText('no operational booking or payment backend');
    }
    if (project.slug === 'lobby') {
      await expect(page.locator('.case-purpose')).toContainText('team-built');
      for (const name of project.team) await expect(page.locator('.story-contribution')).toContainText(name);
    }
  }
 });
 test(`professional public Profile and Job Match copy survive reload at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  for (const path of ['/', '/projects']) { await page.goto(path); await expect(page.locator('main')).toBeVisible(); await clean(page); }
  for (const reload of [false, true]) {
    if (reload) await page.reload(); else await page.goto('/profile');
    await expect(page.locator('.experience-record')).toContainText('Completed a full-stack'); await clean(page);
    await page.getByRole('tab', { name: 'Education & training' }).click();
    await expect(page.locator('.education-record')).toContainText('Graduated with a BSc');
    await expect(page.locator('main')).toContainText('Self-directed learning'); await clean(page);
    await page.getByRole('tab', { name: 'Capabilities' }).click(); await clean(page);
  }
  await page.goto('/job-match');
  await expect(page.getByRole('heading', { name: 'How your role matches my experience' })).toBeVisible();
  await expect(page.locator('.ai-description')).toContainText('skills, projects and experience'); await clean(page);
  await page.reload(); await expect(page.locator('.ai-description')).toContainText('skills, projects and experience');
  await page.locator('#job-description').fill(sampleDescription); await page.getByRole('button', { name: 'Check My Fit' }).click();
  await expect(page.locator('.ai-report')).toBeVisible();
  for (const name of ['Relevant strengths', 'Requirements to discuss', 'Related experience', 'Relevant projects']) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.locator('.ai-report')).toContainText('View team project'); await clean(page);
 });
}
