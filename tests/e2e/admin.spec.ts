import { expect, test } from "@playwright/test";

const admin = { id: "admin-test", name: "Test Admin", email: "admin@example.com" };
const experience = [{ id: "exp-test", milestone: "Developer", facility: "Company", meta: "2026", details: "Work", role: "Developer", company: "Company", description: "Work", startDate: "2026-01", endDate: null, isCurrent: true, location: "Tripoli", order: 0 }];
const profile = { id: "profile-test", name: "Test", shortName: "Test", title: "Developer", tagline: "", bio: "", location: "Tripoli", email: "test@example.com", phone: "", photo: null, resumeUrl: null, languages: "English", experience, socials: [] };
const project = { id: "project-test", slug: "browser-test", name: "Browser Test Project", type: "Web application", tagline: "Test", description: "Test", overview: "Test", problem: "Test", solution: "Test", features: ["Feature"], stack: ["React"], team: [], program: null, github: null, demo: null, featured: false, published: true, visual: "#5966A0", coverImage: null, screenshots: [], myRole: "Developer", contributions: [], ownership: "", teamSize: 1, order: 1, views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

test.beforeEach(async ({ page }) => {
  await page.route("**/api/admin/me", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(admin) }));
  await page.route("**/api/admin/messages", (route) => route.fulfill({ contentType: "application/json", body: "[]" }));
});

test("admin login form is accessible", async ({ page }) => {
  await page.route("**/api/admin/auth/session", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ admin: null }) }));
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Admin console" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
});

test("experience editing sends structured dates and current status", async ({ page }) => {
  let savedBody: unknown;
  await page.route("**/api/admin/profile", async (route) => {
    if (route.request().method() === "PATCH") {
      savedBody = route.request().postDataJSON();
      return route.fulfill({ contentType: "application/json", body: JSON.stringify(profile) });
    }
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(profile) });
  });
  await page.goto("/admin/experience");
  await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
  await page.getByLabel("Role").first().fill("Backend Developer");
  await page.getByRole("button", { name: "Save experience" }).click();
  await expect.poll(() => savedBody).toBeTruthy();
  expect(savedBody).toMatchObject({ experience: [expect.objectContaining({ role: "Backend Developer", startDate: "2026-01", isCurrent: true, endDate: null })] });
});

test("project editor sends the personal role field", async ({ page }) => {
  let savedBody: unknown;
  await page.route("**/api/admin/projects/browser-test", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(project) }));
  await page.route("**/api/admin/projects/project-test", async (route) => {
    savedBody = route.request().postDataJSON();
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ ...project, ...(savedBody as object) }) });
  });
  await page.goto("/admin/projects/browser-test/edit");
  await page.getByLabel("My role").fill("Full-Stack Developer");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect.poll(() => savedBody).toBeTruthy();
  expect(savedBody).toMatchObject({ myRole: "Full-Stack Developer" });
});
