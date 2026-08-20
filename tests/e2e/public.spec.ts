import { expect, test } from "@playwright/test";

const profile = { id: "profile-test", name: "Mahmoud Hussein Abdul Ghani", shortName: "Mahmoud Abdul Ghani", title: "Full-Stack Software Engineer", tagline: "Building secure applications.", bio: "Database-backed biography.", location: "Tripoli, Lebanon", email: "test@example.com", phone: "+961 70 000 000", photo: null, resumeUrl: null, portfolioUrl: null, seoTitle: "Mahmoud Hussein Abdul Ghani | Full-Stack Software Engineer", seoDescription: "Portfolio description", languages: "English", experience: [], socials: [], professionalSummary: "Professional summary", availabilityStatus: "Open to roles", availabilityText: "Open to opportunities", responseTime: "Within 24h", remoteAvailability: "Remote friendly", openToOpportunities: true, heroLabel: "Full-stack systems", profileReference: "Profile · 001", whatsappNumber: "+96170000000", whatsappMessage: "Hello", focusAreas: ["React", "Node.js"] };
const sections = [
  { key: "hero", heading: "Full-Stack Software Engineer", description: "Building secure applications.", eyebrow: null, ctaLabel: "View Projects", ctaUrl: "/projects", visible: true, order: 0, content: { introduction: "Database hero introduction" } },
  { key: "projectsPage", heading: "Projects", description: "Project collection", eyebrow: "Portfolio", ctaLabel: null, ctaUrl: null, visible: true, order: 1, content: { seoTitle: "Projects", seoDescription: "Projects description", filters: [{ id: "all", label: "All Projects" }] } },
  { key: "contact", heading: "Start a real conversation", description: "Contact description", eyebrow: "Contact", ctaLabel: null, ctaUrl: null, visible: true, order: 2, content: { availabilityOptions: ["Open to roles"], successHeading: "Message sent", successMessage: "Thanks, your email", formHeading: "Send a message", formDescription: "Reply soon", jobMatchHeading: "Try Job Match", jobMatchText: "Compare a role", jobMatchCta: "Match a job" } },
  { key: "seo", heading: null, description: null, eyebrow: null, ctaLabel: null, ctaUrl: null, visible: true, order: 3, content: { titleTemplate: "%s | Mahmoud Hussein Abdul Ghani", defaultTitle: "Full-Stack Software Engineer", defaultDescription: "Portfolio", pages: { contact: { title: "Contact", description: "Contact description" } } } },
  { key: "cvPage", heading: "Resume", description: "Professional curriculum vitae.", eyebrow: null, ctaLabel: null, ctaUrl: null, visible: true, order: 4, content: { downloadLabel: "Download PDF", backLabel: "Back to portfolio", unavailableText: "Use Download PDF if preview is unavailable." } },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/profile", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(profile) }));
  await page.route("**/api/site-content", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(sections) }));
});

test("public navigation, theme, metadata, and mobile menu work", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Mahmoud Hussein Abdul Ghani/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  const theme = page.getByRole("button", { name: /switch to (dark|light) mode/i }).first();
  await theme.click();
  await expect(page.locator("html")).toHaveAttribute("class", /dark/);
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await page.locator("#mobile-nav").getByRole("link", { name: "Projects" }).click();
  } else {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Projects", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
});

test("project gallery opens and supports navigation", async ({ page }) => {
  const lobby = {
    id: "lobby-test", slug: "lobby", name: "Lobby", type: "Communication platform",
    tagline: "Real-time communication", description: "Project description", overview: "Overview",
    problem: "Problem", solution: "Solution", features: ["Messaging"], stack: ["Angular", "NestJS"],
    team: [], program: null, github: null, demo: null, featured: true, published: true,
    visual: "#765D99", coverImage: "/projects/lobby/cover.webp",
    screenshots: ["/projects/lobby/guest-access.webp", "/projects/lobby/friends.webp", "/projects/lobby/audio-room.webp", "/projects/lobby/community-chat.webp", "/projects/lobby/share-room.webp"],
    myRole: "Developer", contributions: [], ownership: "", teamSize: 1, order: 1, views: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  await page.route("**/api/projects/lobby", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(lobby) }));
  await page.goto("/projects/lobby");
  await expect(page.getByRole("heading", { name: "Lobby", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /view lobby cover image full screen/i }).click();
  const gallery = page.getByRole("dialog", { name: /lobby image gallery/i });
  await expect(gallery).toBeVisible();
  await gallery.getByRole("button", { name: "Next image" }).first().click();
  await expect(gallery.getByText("2 / 6")).toBeVisible();
  await gallery.getByRole("button", { name: "Close gallery" }).click();
  await expect(gallery).toBeHidden();
  await expect(page.getByRole("button", { name: /view lobby cover image full screen/i })).toBeFocused();
});

test("contact form validates and handles a successful submission", async ({ page }) => {
  await page.route("**/api/messages", async (route) => route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "test", createdAt: new Date().toISOString() }) }));
  await page.goto("/contact");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await page.getByLabel("Name").fill("Browser Test");
  await page.getByLabel("Email").fill("browser@example.com");
  await page.getByLabel("Message").fill("A safe intercepted browser test message.");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByRole("heading", { name: "Message sent" })).toBeVisible();
});

test("CV download rejects text responses instead of saving cv.txt", async ({ page }) => {
  await page.route("**/api/cv.pdf", (route) => route.fulfill({ status: 500, contentType: "text/plain", body: "CV generation failed" }));
  await page.goto("/cv");
  await page.getByRole("button", { name: "Download PDF" }).click();
  await expect(page.getByRole("alert")).toContainText("CV generation failed");
});

test("Home navigation returns to the hero section", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#mobile-nav").getByRole("link", { name: "Home" }).click();
  } else {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Home" }).click();
  }
  await expect(page).toHaveURL(/\/#hero$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(20);
});
