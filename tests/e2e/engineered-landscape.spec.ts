import { expect, test } from "@playwright/test";
import { projectDisplayName } from '../../shared/content-integrity';

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
      page.getByRole("heading", { name: projectDisplayName(record), exact: true }),
    ).toBeVisible();
    await expect(page.getByText("CMS contribution")).toBeAttached();
    await expect
      .poll(() => page.evaluate(() => document.body.scrollWidth <= innerWidth))
      .toBe(true);
  }
});
test("construction display label stays compact while CMS and accessible names remain complete", async ({
  page,
}) => {
  await page.goto("/");
  const target = page.getByRole("button", {
    name: "Explore Cedar Construction",
    exact: true,
  });
  await expect(target).toHaveAccessibleDescription(records[3].name);
  await expect(target.locator(".project-name")).toHaveText(
    "Cedar Construction",
  );
  const dimensions = await target.locator(".project-name").evaluate((title) => {
    const style = getComputedStyle(title);
    return {
      fontSize: parseFloat(style.fontSize),
      lines:
        title.getBoundingClientRect().height / parseFloat(style.lineHeight),
    };
  });
  expect(dimensions.fontSize).toBeGreaterThanOrEqual(19);
  expect(dimensions.lines).toBeLessThanOrEqual(3);
  await page.goto(`/projects/${records[3].slug}`);
  await expect(
    page.getByRole("heading", { name: 'Cedar Construction', exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Complete CMS overview")).toBeAttached();
});

test("case metadata keeps the team phrase together and Projects search reserves icon space", async ({
  page,
}) => {
  await page.route("**/api/projects/jobpilot-ai", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...records[0],
        myRole: "Full-Stack Developer & Project Owner",
        teamSize: 1,
      }),
    }),
  );
  await page.goto("/projects/jobpilot-ai");
  const team = page.locator(".case-team-size");
  await expect(team).toHaveText("Independent project.");
  expect(
    await team.evaluate((span) => {
      const range = document.createRange();
      range.selectNodeContents(span);
      return new Set(
        [...range.getClientRects()].map((rect) => Math.round(rect.top)),
      ).size;
    }),
  ).toBe(1);
  await page.setViewportSize({ width: 320, height: 568 });
  expect(
    await team.evaluate((span) => {
      const range = document.createRange();
      range.selectNodeContents(span);
      return new Set(
        [...range.getClientRects()].map((rect) => Math.round(rect.top)),
      ).size;
    }),
  ).toBe(1);
  await page.goto(`/projects/${records[3].slug}`);
  await expect(
    page.getByRole("heading", { name: 'Cedar Construction', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true);
  await page.goto("/projects");
  const search = page.getByLabel("Search projects or technologies");
  await expect(search).toBeVisible();
  expect(
    await page.locator(".search-field").evaluate((field) => {
      const icon = field.querySelector("svg")!.getBoundingClientRect();
      const input = field.querySelector("input")!;
      const rect = input.getBoundingClientRect();
      const textStart =
        rect.left + parseFloat(getComputedStyle(input).paddingLeft);
      return textStart >= icon.right + 8 && rect.right <= innerWidth;
    }),
  ).toBe(true);
  await search.fill("JobPilot");
  await expect(page.locator(".work-entry")).toHaveCount(1);
});

for (const [width, height] of [
  [1363, 936],
  [1280, 720],
  [390, 844],
  [320, 568],
]) {
  test(`selected projects share a complete image, aligned caption and usable controls at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const selections = [
      {
        record: records[0],
        title: "JobPilot AI",
        category: "AI career workspace",
      },
      {
        record: records[1],
        title: "Lobby",
        category: "Real-time communication",
      },
      {
        record: records[3],
        title: "Cedar Construction",
        category: "Project operations & accounting",
      },
    ];
    const captionTops: number[] = [];
    for (const { record, title, category } of selections) {
      await page.goto(`/?project=${record.slug}`);
      await expect(page.locator(".is-expanded")).toHaveAttribute(
        "data-selection-state",
        "settled",
      );
      await expect(page.locator(".selection-detail h1")).toHaveText(title);
      await expect(page.locator(".selection-detail p")).toHaveText(category);
      if (record.name !== title)
        await expect(
          page.getByRole("region", { name: "Selected project" }),
        ).toHaveAccessibleDescription(record.name);
      const image = page.locator(".product-surface img");
      await expect(image).toHaveAttribute(
        "alt",
        new RegExp(record.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
      await image.evaluate((node) => (node as HTMLImageElement).decode());
      const geometry = await page
        .locator(".selection-frame")
        .evaluate((frame) => {
          const image = frame.querySelector<HTMLImageElement>("img")!;
          const imageFrame = frame
            .querySelector(".selection-image-frame")!
            .getBoundingClientRect();
          const title = frame.querySelector("h1")!;
          const caption = frame
            .querySelector(".selection-caption")!
            .getBoundingClientRect();
          const controls = frame
            .querySelector(".selection-actions")!
            .getBoundingClientRect();
          const cta = frame.querySelector<HTMLAnchorElement>(".open-case")!;
          const text = document.createRange();
          text.selectNode(cta.firstChild!);
          const ctaBox = cta.getBoundingClientRect();
          return {
            leftGap: Math.abs(
              title.getBoundingClientRect().left - imageFrame.left,
            ),
            captionGap: caption.top - imageFrame.bottom,
            captionTop: caption.top + scrollY,
            fontSize: parseFloat(getComputedStyle(title).fontSize),
            objectFit: getComputedStyle(image).objectFit,
            imageLoaded: image.complete && image.naturalWidth > 0,
            controlsBelow: controls.top >= caption.bottom,
            cta: {
              width: ctaBox.width,
              height: ctaBox.height,
              frameWidth: frame.getBoundingClientRect().width,
              textLines: new Set(
                [...text.getClientRects()].map((r) => Math.round(r.top)),
              ).size,
            },
            horizontalOverflow:
              document.documentElement.scrollWidth > innerWidth,
            normalScroll:
              document.documentElement.scrollHeight >=
              controls.bottom + scrollY,
          };
        });
      expect(geometry.leftGap).toBeLessThan(1);
      expect(geometry.captionGap).toBeCloseTo(24, 0);
      expect(geometry.fontSize).toBe(width < 720 ? 32 : 52);
      expect(geometry.objectFit).toBe("contain");
      expect(geometry.imageLoaded).toBe(true);
      expect(geometry.controlsBelow).toBe(true);
      expect(geometry.cta.width).toBeGreaterThanOrEqual(180);
      expect(geometry.cta.height).toBeGreaterThanOrEqual(44);
      expect(geometry.cta.textLines).toBe(1);
      if (width < 720)
        expect(geometry.cta.width).toBeCloseTo(geometry.cta.frameWidth, 0);
      expect(geometry.horizontalOverflow).toBe(false);
      expect(geometry.normalScroll).toBe(true);
      captionTops.push(geometry.captionTop);
      const choices = page
        .getByRole("group", { name: "Preview workflow" })
        .getByRole("button");
      await expect(choices).toHaveCount(2);
      await choices.nth(1).focus();
      await page.keyboard.press("Enter");
      await expect(choices.nth(1)).toHaveAttribute("aria-pressed", "true");
      await expect(image).toHaveAttribute(
        "alt",
        new RegExp(
          (await choices.nth(1).innerText()).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          ),
        ),
      );
      expect(
        await page
          .locator(".selection-caption")
          .evaluate((el) => el.getBoundingClientRect().top + scrollY),
      ).toBeCloseTo(geometry.captionTop, 0);
      const cta = page.getByRole("link", {
        name: "Open case study",
        exact: true,
      });
      await cta.evaluate((el) => el.scrollIntoView({ block: "center" }));
      await expect(cta).toBeInViewport({ ratio: 1 });
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: `Explore ${title}`, exact: true }),
      ).toBeFocused();
      await expect(page.locator("canvas")).toHaveCount(0);
    }
    expect(Math.max(...captionTops) - Math.min(...captionTops)).toBeLessThan(1);
  });
}

test("photographic fallback reserves the caption and reveals it after the image settles", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      return type === "webgl2" ? null : original.call(this, type, ...args);
    } as typeof original;
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole("button", { name: "Explore Cedar Construction", exact: true })
    .click();
  await expect(page.locator(".motion-rig")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  const observations = await page.evaluate(
    () =>
      new Promise<{ captionTops: number[]; prematureCaption: boolean }>(
        (resolve) => {
          const captionTops: number[] = [];
          let prematureCaption = false;
          const inspect = () => {
            const surface =
              document.querySelector<HTMLElement>(".product-surface")!;
            const caption =
              document.querySelector<HTMLElement>(".selection-caption")!;
            const detail =
              document.querySelector<HTMLElement>(".selection-detail")!;
            captionTops.push(caption.getBoundingClientRect().top + scrollY);
            if (
              parseFloat(getComputedStyle(detail).opacity) > 0.01 &&
              parseFloat(getComputedStyle(surface).opacity) < 0.999
            )
              prematureCaption = true;
            if (
              document
                .querySelector(".is-expanded")
                ?.getAttribute("data-selection-state") === "settled"
            )
              resolve({ captionTops, prematureCaption });
            else requestAnimationFrame(inspect);
          };
          inspect();
        },
      ),
  );
  expect(observations.prematureCaption).toBe(false);
  expect(
    Math.max(...observations.captionTops) -
      Math.min(...observations.captionTops),
  ).toBeLessThan(1);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Open case study", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", {
      name: "Explore Cedar Construction",
      exact: true,
    }),
  ).toBeFocused();
});

test("a slow or failed screenshot cannot reveal a partial image or strand selection controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let releaseImage!: () => void;
  const pending = new Promise<void>((resolve) => {
    releaseImage = resolve;
  });
  await page.route("**/api/projects", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        records.map((record) =>
          record.slug === "jobpilot-ai"
            ? { ...record, screenshots: ["/slow-selected-preview.png"] }
            : record,
        ),
      ),
    }),
  );
  await page.route("**/slow-selected-preview.png", async (route) => {
    await pending;
    await route.fulfill({ status: 404, body: "Fixture missing image" });
  });
  await page.goto("/?project=jobpilot-ai", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("status")).toContainText(
    "Loading project preview",
  );
  await expect(page.locator(".motion-rig")).toHaveCount(0);
  expect(
    await page
      .locator(".selection-detail")
      .evaluate((el) => (el as HTMLElement).inert),
  ).toBe(true);
  expect(
    await page
      .locator(".product-surface img")
      .evaluate((el) => getComputedStyle(el).visibility),
  ).toBe("hidden");
  const captionTop = await page
    .locator(".selection-caption")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  releaseImage();
  // Image failure first permits the lazy rig to boot. Resource/GPU startup is
  // separate from the bounded opening animation; combining both in one 5s
  // assertion made this test depend on a warm renderer and machine load.
  await expect(page.locator(".is-expanded")).toHaveAttribute(
    "data-selection-state",
    /opening|settled/,
    { timeout: 15_000 },
  );
  await expect(page.locator(".is-expanded")).toHaveAttribute(
    "data-selection-state",
    "settled",
  );
  await expect(page.getByRole("status")).toContainText("Preview unavailable");
  expect(
    await page
      .locator(".selection-caption")
      .evaluate((el) => el.getBoundingClientRect().top + scrollY),
  ).toBeCloseTo(captionTop, 0);
  await expect(
    page.getByRole("link", { name: "Open case study", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Explore JobPilot AI", exact: true }),
  ).toBeFocused();
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
    const headers = route.request().headers();
    if (
      !headers["content-type"]?.startsWith("application/json") ||
      headers.accept !== "text/event-stream"
    ) {
      return route.fulfill({
        status: 415,
        contentType: "application/json",
        body: JSON.stringify({
          message: "JSON Content-Type and streaming Accept are required.",
        }),
      });
    }
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
  let releaseErrorResponse!: () => void;
  const pendingError = new Promise<void>((resolve) => {
    releaseErrorResponse = resolve;
  });
  await page.route("**/api/messages", async (route) => {
    payload = route.request().postDataJSON();
    if (!success) await pendingError;
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
  releaseErrorResponse();
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
