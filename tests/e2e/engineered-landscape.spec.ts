import { expect, test } from "@playwright/test";

const slugs = [
  "jobpilot-ai",
  "lobby",
  "gamezone-arena",
  "construction-project-management-accounting-system",
  "unihub",
  "full-stack-user-management-system",
  "medicare-hub",
  "home-services",
];
const records = slugs.map((slug, index) => ({
  id: slug,
  slug,
  name: [
    "JobPilot AI",
    "Lobby",
    "GameZone Arena",
    "Construction Project Management & Accounting System",
    "UniHub",
    "User Management",
    "Medicare Hub",
    "Home Services",
  ][index],
  type: "Test project type",
  tagline: "CMS-owned tagline",
  description: "CMS-owned description",
  overview: "Complete CMS overview",
  problem: "CMS problem",
  solution: "CMS solution",
  features: ["Complete workflow evidence"],
  stack: ["React", "TypeScript"],
  team: ["Team member"],
  program: null,
  github: null,
  demo: null,
  featured: index < 3,
  published: true,
  showOnPortfolio: true,
  visual: "",
  coverImage: "/projects/lobby/cover.webp",
  screenshots: ["/projects/lobby/guest-access.webp"],
  myRole: "CMS role",
  contributions: ["CMS contribution"],
  ownership: "CMS ownership",
  teamSize: 2,
  order: index,
  views: 0,
  createdAt: "2026-01-01",
  updatedAt: "2026-10-01",
}));
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const result =
      path === "/api/profile"
        ? {
            id: "profile",
            name: "CMS Owner",
            shortName: "Owner",
            title: "CMS title",
            bio: "CMS bio",
            professionalSummary: "CMS summary",
            photo: "/myphoto.jpeg",
            resumeUrl: null,
            email: "test@example.com",
            phone: "",
            location: "Test location",
            experience: [],
            socials: [],
          }
        : path === "/api/projects"
          ? records
          : path.startsWith("/api/projects/")
            ? records.find((record) => record.slug === path.slice(14))
            : [];
    return route.fulfill({
      status: result ? 200 : 404,
      contentType: "application/json",
      body: JSON.stringify(result ?? { message: "Not found" }),
    });
  });
});
test("CMS-backed collection selects with keyboard, opens real slug and returns focus", async ({
  page,
}) => {
  await page.goto("/");
  const target = page.getByRole("button", {
    name: "Explore JobPilot AI",
    exact: true,
  });
  await target.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".selection-detail h1")).toHaveText("JobPilot AI");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Open case study" }),
  ).toBeFocused();
  await page.getByRole("link", { name: "Open case study" }).click();
  await expect(page).toHaveURL(/\/projects\/jobpilot-ai$/);
  await expect(page.getByText("Complete CMS overview")).toBeAttached();
  await page
    .getByRole("link", { name: "Collection", exact: true })
    .first()
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Explore JobPilot AI", exact: true }),
  ).toBeFocused();
});
test("all eight records survive gallery/index search and narrow deep-link reloads", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(page.locator(".work-entry")).toHaveCount(8);
  await page.getByRole("button", { name: "Index", exact: true }).click();
  await expect(page.locator(".project-index .work-entry")).toHaveCount(8);
  await page
    .getByLabel("Search projects or technologies")
    .fill("missing-project");
  await expect(page.getByText("No matching projects.")).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.locator(".work-entry")).toHaveCount(8);
  await page.setViewportSize({ width: 320, height: 844 });
  for (const record of records) {
    await page.goto(`/projects/${record.slug}`);
    await expect(
      page.getByRole("heading", { name: record.name, exact: true }),
    ).toBeVisible();
    await expect(page.getByText("CMS contribution")).toBeAttached();
    await expect
      .poll(() => page.evaluate(() => document.body.scrollWidth <= innerWidth))
      .toBe(true);
  }
});
test("Escape interrupts selection and restores the originating sculpture", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore Lobby", exact: true })
    .click();
  await expect(page.locator(".selection-detail")).toBeAttached();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Explore Lobby", exact: true }),
  ).toBeFocused();
  await expect(page).toHaveURL(/\/$/);
});
test("assistant preserves stream whitespace, native modal focus and project request context", async ({
  page,
}) => {
  let payload: Record<string, unknown> = {};
  await page.route("**/api/assistant", (route) => {
    payload = route.request().postDataJSON();
    return route.fulfill({
      contentType: "text/event-stream",
      body: 'data: {"chunk":"Hello"}\n\ndata: {"chunk":" "}\n\ndata: {"chunk":"world"}\n\ndata: {"done":true}\n\n',
    });
  });
  await page.goto("/projects/lobby");
  const launcher = page.getByRole("button", {
    name: "Ask Portfolio AI",
    exact: true,
  });
  await launcher.click();
  await page.getByLabel("Your question").fill("Tell me about this project");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.locator(".assistant-message.assistant")).toContainText(
    "Hello world",
  );
  expect(payload.projectSlug).toBe("lobby");
  await page.keyboard.press("Escape");
  await expect(launcher).toBeFocused();
  await launcher.click();
  await expect(page.locator(".assistant-message.assistant")).toContainText(
    "Hello world",
  );
});
test("assistant exposes rate-limit retry and cancellation without invented replies", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/api/assistant", (route) => {
    attempts++;
    if (attempts === 1)
      return route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Too many requests. Please wait and try again.",
        }),
      });
    if (attempts === 2)
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          answer: "A real response fixture after retry.",
        }),
      });
    // Keep the last request pending so Stop exercises AbortController.
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Ask Portfolio AI", exact: true })
    .click();
  await page.getByLabel("Your question").fill("Describe the portfolio");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.locator(".assistant-message.has-error")).toContainText(
    "Too many requests",
  );
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.locator(".assistant-message.assistant").last(),
  ).toContainText("A real response fixture after retry.");
  await page.getByLabel("Your question").fill("Describe more evidence");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page.getByRole("button", { name: "Stop generation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Stop generation" }).click();
  await expect(
    page.locator(".assistant-message.assistant").last(),
  ).toContainText("Generation stopped.");
  await expect(page.getByLabel("Your question")).toBeEnabled();
});
test("Contact sends only the established payload to an intercepted fixture and retains errors", async ({
  page,
}) => {
  let payload: Record<string, unknown> = {};
  let success = false;
  await page.route("**/api/messages", async (route) => {
    payload = route.request().postDataJSON();
    await new Promise((resolve) => setTimeout(resolve, 150));
    return route.fulfill({
      status: success ? 201 : 503,
      contentType: "application/json",
      body: JSON.stringify(
        success ? { id: "fixture" } : { message: "Fixture unavailable" },
      ),
    });
  });
  await page.goto("/contact");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
  await page.getByLabel("Name", { exact: true }).fill("QA Reviewer");
  await page.getByLabel("Email", { exact: true }).fill("reviewer@example.com");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Local intercepted verification only.");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByRole("button", { name: /sending/i })).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText("Something went wrong");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "QA Reviewer",
  );
  expect(Object.keys(payload).sort()).toEqual([
    "email",
    "message",
    "name",
    "subject",
    "website",
  ]);
  expect(payload.website).toBe("");
  success = true;
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.locator(".contact-success")).toBeFocused();
});
test("real Job Match contract retains report, evidence, export and token-gated CV on route return", async ({
  page,
}) => {
  const result = {
    matchLevel: "Moderate Match",
    overallMatch: "Fixture report, not AI inference",
    strongMatches: ["React"],
    relevantExperience: ["Fixture evidence"],
    relevantProjects: [
      {
        slug: "lobby",
        name: "Lobby",
        portfolioUrl: "/projects/lobby",
        evidence: "Fixture link",
      },
    ],
    partialMatches: [],
    gaps: ["Kubernetes"],
    recruiterSummary: "Fixture recruiter summary",
  };
  let token = "";
  await page.route("**/api/job-match", (route) =>
    route.fulfill({
      contentType: "text/event-stream",
      body: `event: result\ndata: ${JSON.stringify({ result, cvToken: "test-signed-token" })}\n\n`,
    }),
  );
  await page.route("**/api/job-match/tailored-cv", (route) => {
    token = route.request().postDataJSON().token;
    return route.fulfill({
      contentType: "application/pdf",
      body: "%PDF-1.4\nTest fixture only\n%%EOF",
    });
  });
  await page.goto("/job-match");
  await page
    .getByLabel("Job description", { exact: true })
    .fill(
      "Looking for a React and TypeScript developer to build web interfaces, APIs and secure workflows for our team.",
    );
  await page.getByRole("button", { name: "Check My Fit" }).click();
  await expect(
    page.getByText("Fixture report, not AI inference"),
  ).toBeVisible();
  const exported = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Report" }).click();
  expect((await exported).suggestedFilename()).toContain("portfolio-job-match");
  const cv = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Tailored CV" }).click();
  await cv;
  expect(token).toBe("test-signed-token");
  await page.locator(".ai-report").getByRole("link", { name: /Lobby/ }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "AI Job Match" })
    .click();
  await expect(
    page.getByText("Fixture report, not AI inference"),
  ).toBeVisible();
  await expect(
    page.getByLabel("Job description", { exact: true }),
  ).not.toHaveValue("");
});
