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
  await page.route("**/api/projects", route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route("**/api/profile", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(profile) }));
  await page.route("**/api/site-content", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(sections) }));
});

test("accepted public navigation and metadata work", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Mahmoud Hussein Abdul Ghani/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Projects", exact: true }).click();
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
    architecture: ["Client | Angular application", "API | NestJS services", "Database | Persistent application data"],
    codeDiffs: ["Validation | Manual checks | Centralized request schemas"],
    benchmarks: ["Test response | 42 ms | Controlled integration test"],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  await page.route("**/api/projects/lobby", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(lobby) }));
  await page.goto("/projects/lobby");
  await expect(page.getByRole("heading", { name: "Lobby", exact: true })).toBeVisible();
  await expect(page.locator('.case-image picture source[type="image/avif"]').first()).toHaveAttribute("srcset", /guest-access-480w\.avif/);
  await page.getByRole("button", { name: /enlarge lobby screenshot/i }).click();
  const gallery = page.getByRole("dialog", { name: /lobby image gallery/i });
  await expect(gallery).toBeVisible();
  await expect.poll(() => gallery.locator('.case-inspector-thumbs img').evaluateAll(images => images.every(image => {
    const img = image as HTMLImageElement;
    return img.complete && img.naturalWidth > 0;
  }))).toBe(true);
  const checkBounds = async () => {
    expect(await gallery.evaluate(dialog => {
      const frame = dialog.getBoundingClientRect();
      const controls = [...dialog.querySelectorAll('.case-inspector-inner > header, .case-inspector-inner > footer, .case-inspector-thumbs')];
      return frame.x >= 0 && frame.y >= 0 && frame.right <= innerWidth && frame.bottom <= innerHeight && controls.every(control => {
        const box = control.getBoundingClientRect();
        return box.top >= frame.top && box.bottom <= frame.bottom && box.left >= frame.left && box.right <= frame.right;
      });
    })).toBe(true);
    expect(await gallery.locator('.case-inspector-thumbs img').evaluateAll(images => images.every(image => {
      const box = image.getBoundingClientRect();
      return box.width > 0 && box.width <= 84 && box.height > 0 && box.height <= 56;
    }))).toBe(true);
    await expect(gallery.getByRole('button', { name: 'Close gallery' })).toBeInViewport({ ratio: 1 });
    await expect(gallery.getByRole('button', { name: 'Next screenshot' })).toBeInViewport({ ratio: 1 });
  };
  await checkBounds();
  await page.keyboard.press('ArrowRight');
  await expect(gallery.getByText(/^2 \/ /)).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(gallery.getByText(/^1 \/ /)).toBeVisible();
  await gallery.getByRole("button", { name: "Next screenshot" }).click();
  await expect(gallery.getByText(/^2 \/ /)).toBeVisible();
  await gallery.getByRole('button', { name: 'Actual size' }).click();
  await gallery.locator('.case-inspector-image').evaluate(image => { image.scrollTop = 1000; image.scrollLeft = 1000; });
  await checkBounds();
  await gallery.getByRole('button', { name: 'Fit width' }).click();
  const lastThumb = gallery.locator('.case-inspector-thumbs button').last();
  await lastThumb.click();
  await expect(lastThumb).toHaveAttribute('aria-current', 'true');
  await page.setViewportSize({ width: 320, height: 568 });
  await checkBounds();
  await page.keyboard.press('Escape');
  await expect(gallery).toBeHidden();
  await expect(page.getByRole('button', { name: /enlarge lobby screenshot/i })).toBeFocused();
  await page.getByRole('button', { name: /enlarge lobby screenshot/i }).click();
  await gallery.getByRole("button", { name: "Close gallery" }).click();
  await expect(gallery).toBeHidden();
  await expect(page.getByRole("button", { name: /enlarge lobby screenshot/i })).toBeFocused();
  await page.getByRole("tab", { name: /API/i, selected: false }).click();
  await expect(page.getByText("NestJS services", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Implementation improvements" })).toBeVisible();
  await expect(page.getByText("42 ms", { exact: true })).toBeVisible();
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

test("Collection navigation returns to the accepted collection route", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Collection", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', {name:'Collection',exact:true})).toBeVisible();
});

test("Command palette opens via shortcut and supports search navigation", async ({ page }) => {
  await page.goto("/");
  // Navigation load can finish before React's shortcut effect is installed.
  // Wait for the rendered shell and resolved empty-collection fixture first.
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Collection", exact: true })).toBeVisible();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command Palette" });
  await expect(dialog).toBeVisible();
  const searchInput = dialog.getByPlaceholder(/search projects/i);
  await expect(searchInput).toBeFocused();
  await searchInput.fill("contact");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contact$/);
});

test("Developer terminal supports commands and history", async ({ page }) => {
  await page.goto("/terminal");
  const terminalInput = page.getByPlaceholder(/type command/i);
  await expect(terminalInput).toBeFocused();

  await terminalInput.fill("help");
  await terminalInput.press("Enter");
  await expect(page.getByText("Available Commands", { exact: true })).toBeVisible();

  await terminalInput.press("ArrowUp");
  await expect(terminalInput).toHaveValue("help");
  await terminalInput.fill("pro");
  await terminalInput.press("Tab");
  await expect(terminalInput).toHaveValue("projects");
});
