import { expect, test } from '@playwright/test';

const project = { id: 'medicare', slug: 'medicare-hub', name: 'Medicare Hub', type: 'Clinic management', published: true, showOnPortfolio: true, features: [' ', 'Appointments'], stack: ['PHP'], overview: 'Clinic workflows', myRole: ' ', ownership: ' ', contributions: ['', '   '], team: [], coverImage: '', screenshots: [], order: 0 };
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const body = path === '/api/projects' ? [project] : path.startsWith('/api/projects/') ? project : [];
    return route.fulfill({ json: body });
  });
});

test('whitespace-only contributions and metadata disappear without a reserved column', async ({ page }) => {
  for (const width of [1363, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/projects/medicare-hub');
    await expect(page.getByRole('heading', { name: 'Medicare Hub', exact: true })).toBeVisible();
    await expect(page.locator('#contribution')).toHaveCount(0);
    await expect(page.locator('.case-role')).toHaveCount(0);
    await expect(page.locator('.case-notes-single')).toHaveCount(1);
    expect(await page.locator('.case-page p,.case-page ul').evaluateAll(nodes => nodes.filter(n => !n.textContent?.trim()).length)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('a contribution with no role renders its documented list and no empty paragraph', async ({ page }) => {
  await page.route('**/api/projects/medicare-hub', route => route.fulfill({ json: { ...project, overview: '   ', description: 'Documented fallback description', contributions: ['Documented personal contribution'] } }));
  await page.goto('/projects/medicare-hub');
  await expect(page.locator('#contribution')).toContainText('Documented personal contribution');
  await expect(page.locator('#contribution p')).toHaveCount(0);
  await expect(page.locator('#overview p')).toHaveText('Documented fallback description');
});

test('team-only records preserve collaborators without implying a personal contribution', async ({ page }) => {
  await page.route('**/api/projects/medicare-hub', route => route.fulfill({ json: { ...project, team: ['Fixture collaborator'] } }));
  await page.goto('/projects/medicare-hub');
  await expect(page.locator('#contribution')).toHaveCount(0);
  await expect(page.locator('#team')).toContainText('Fixture collaborator');
  await expect(page.locator('.case-role')).toHaveCount(0);
});

test('Profile shares date/status corrections and removes duplicate and unsupported skill badges', async ({ page }) => {
  await page.route('**/api/profile', route => route.fulfill({ json: {
    name: 'Test Owner', title: 'Existing role title', socials: [], experience: [
      { id: 'ishtari', company: 'Ishtari', role: 'Backend Developer', endDate: '2026-01', startDate: '2025-12' },
      { id: 'hub', company: 'The Digital Hub', role: 'Full-Stack Developer Intern', startDate: '2026-06', endDate: '2026-09', description: 'Completing an intensive full-stack software engineering and AI program.' },
      { id: 'qa', company: 'Oigetit', role: 'QA Intern', startDate: '2026-05', endDate: '2026-08' },
    ],
  } }));
  await page.route('**/api/technologies', route => route.fulfill({ json: [{ name: 'JavaScript', category: 'languages' }] }));
  await page.route('**/api/skills', route => route.fulfill({ json: ['pytest', 'Pytest', 'SOLID', 'SOLID Principles', 'JavaScript', 'JavaScript (ES6+)'].map((name, i) => ({ id: i, name, status: 'verified' })) }));
  await page.route('**/api/certifications', route => route.fulfill({ json: [{ id: 'aws', title: 'AWS re/Start Bootcamp', issuer: 'AWS', year: 'July 2025 - Oct 2025', description: 'Cloud training; completion expected in 2026.', expectedDate: '2026', url: 'https://example.com/program' }] }));
  await page.goto('/profile');
  await expect(page.locator('.experience-record strong')).toHaveText(['The Digital Hub', 'Oigetit', 'Ishtari']);
  await expect(page.locator('.record-date')).toHaveText(['Jun 2026 – Sep 2026', 'May 2026 – Aug 2026', 'Dec 2025 – Jan 2026']);
  await expect(page.locator('.record-detail').first()).toContainText('Participated in');
  await expect(page.locator('.record-detail').first()).toContainText('Program completion is not verified');
  await page.getByRole('button', { name: 'Education & training', exact: true }).click();
  await expect(page.locator('.training-record')).toContainText('Jul 2025 – Oct 2025');
  await expect(page.locator('.training-record')).not.toContainText('expected');
  await expect(page.locator('.training-record')).toContainText('Completion and certification are not verified');
  await expect(page.getByRole('link', { name: 'Program information' })).toBeVisible();
  await page.getByRole('button', { name: 'Capabilities', exact: true }).click();
  await expect(page.locator('.capability-record li')).toHaveText(['JavaScript', 'pytest', 'SOLID']);
  await expect(page.locator('.capability-record')).not.toContainText('verified');
});

test('Capabilities has one location per competency across categories and Skills, with evidence at that location', async ({ page }) => {
  await page.route('**/api/profile', route => route.fulfill({ json: { name: 'Test Owner', title: 'Developer', experience: [], socials: [] } }));
  await page.route('**/api/technologies', route => route.fulfill({ json: [
    { name: 'HTML & CSS', category: 'languages' }, { name: 'MySQL / MariaDB', category: 'databases' }, { name: 'Git & GitHub', category: 'ops' },
  ] }));
  await page.route('**/api/skills', route => route.fulfill({ json: ['HTML5', 'CSS3', 'MySQL', 'MariaDB', 'Git', 'GitHub', 'Argon2', 'Argon2 Password Hashing', 'AI API Integration', 'AI API Integration — OpenAI'].map(name => ({ name })) }));
  await page.route('**/api/projects', route => route.fulfill({ json: [{ ...project, slug: 'documented', name: 'Documented team project', myRole: 'Developer', stack: ['HTML5', 'CSS3', 'MySQL', 'MariaDB', 'Git', 'GitHub', 'Argon2', 'OpenAI API'] }] }));
  for (const width of [1363, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Capabilities', exact: true }).click();
    const rows = page.locator('.capability-record [data-competency]');
    await expect(rows).toHaveCount(8);
    for (const key of ['html', 'css', 'mysql', 'mariadb', 'git', 'github', 'argon2', 'ai api integration']) {
      const row = page.locator(`[data-competency="${key}"]`);
      await expect(row).toHaveCount(1);
      await expect(row.getByRole('link')).toHaveAttribute('href', '/projects/documented');
    }
    await expect(page.locator('[data-competency="html"]')).toContainText('HTML5');
    await expect(page.locator('[data-competency="css"]')).toContainText('CSS3');
    await expect(page.locator('[data-competency="argon2"]')).toContainText('Password hashing');
    await expect(page.locator('[data-competency="ai api integration"]')).toContainText('OpenAI');
    expect(await page.locator('.page-surface').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
