import { expect, test } from "@playwright/test";

const sender =
  "a.long.but.valid.sender.address.for.contact.layout.review@example.com";
const profile = {
  id: "contact-profile",
  name: "CMS Owner",
  title: "Software engineer",
  location: "Tripoli",
  email: "a.very.long.public.contact.address.for.wrapping@example.com",
  phone: "+96170000000",
  socials: [],
  experience: [],
  responseTime: "Within 24h",
  remoteAvailability: "Remote friendly",
};
const contact = {
  key: "contact",
  heading: "Start a real conversation",
  description: "CMS contact description",
  visible: true,
  content: {
    formHeading: "Send a message",
    formDescription: "CMS response text",
    successHeading: "Message sent",
    successMessage:
      "Thanks, your email. This is a local intercepted confirmation.",
    availabilityOptions: ["Open to full-time roles", "Contract projects"],
    jobMatchHeading: "Try Job Match",
    jobMatchText: "CMS match description",
    jobMatchCta: "Match a job",
  },
};

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/**", (route) => {
    if (route.request().method() !== "GET")
      return route.fulfill({
        status: 403,
        contentType: "application/json",
        body: '{"message":"Unintercepted writes blocked"}',
      });
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        path === "/api/profile"
          ? profile
          : path === "/api/site-content"
            ? [contact]
            : [],
      ),
    });
  });
});

for (const [width, height] of [
  [320, 568],
  [360, 800],
  [390, 844],
  [430, 932],
  [844, 390],
]) {
  test(`Contact has one gutter and reachable initial/error/pending/failure/success states at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    let releaseResponse!: () => void;
    let pendingResponse = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    let success = false;
    const payloads: Record<string, unknown>[] = [];
    await page.route("**/api/messages", async (route) => {
      payloads.push(route.request().postDataJSON());
      await pendingResponse;
      return route.fulfill({
        status: success ? 201 : 503,
        contentType: "application/json",
        body: JSON.stringify(
          success
            ? { id: "intercepted" }
            : { message: "Local failure fixture" },
        ),
      });
    });
    await page.goto("/contact");
    const dimensions = await page
      .locator(".landscape-contact")
      .evaluate((main) => {
        const container = main
          .querySelector(".public-container")!
          .getBoundingClientRect();
        const layout = main.querySelector(".contact-layout")!;
        const intro = main
          .querySelector(".contact-intro")!
          .getBoundingClientRect();
        const form = main.querySelector(".contact-form")!;
        const box = form.getBoundingClientRect();
        const details = main
          .querySelector(".contact-details")!
          .getBoundingClientRect();
        const name = main
          .querySelector("#contact-name")!
          .getBoundingClientRect();
        const email = main
          .querySelector("#contact-email")!
          .getBoundingClientRect();
        const submit = main
          .querySelector('[type="submit"]')!
          .getBoundingClientRect();
        const style = getComputedStyle(form);
        const pageBox = main.getBoundingClientRect();
        return {
          // Measure the page's gutters without counting a native scrollbar.
          left: container.left - pageBox.left,
          right: pageBox.right - container.right,
          formWidth: box.width,
          containerWidth: container.width,
          padding: parseFloat(style.paddingLeft),
          border: parseFloat(style.borderLeftWidth),
          gridAreas: getComputedStyle(layout).gridTemplateAreas,
          ordered: intro.bottom <= box.top && box.bottom <= details.top,
          stacked: name.bottom < email.top,
          inputHeight: name.height,
          inputFont: getComputedStyle(main.querySelector("#contact-name")!)
            .fontSize,
          sameWidths:
            Math.abs(name.width - email.width) < 1 &&
            Math.abs(name.width - submit.width) < 1,
          footerAfterContent:
            document.querySelector(".stage-footer")!.getBoundingClientRect()
              .top >=
            main.getBoundingClientRect().bottom - 1,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
    expect(dimensions.left).toBeCloseTo(16, 0);
    expect(dimensions.right).toBeCloseTo(16, 0);
    expect(dimensions.formWidth).toBeCloseTo(dimensions.containerWidth, 0);
    expect(dimensions.padding).toBeGreaterThanOrEqual(16);
    expect(dimensions.padding).toBeLessThanOrEqual(20);
    expect(dimensions.border).toBeGreaterThan(0);
    expect(dimensions.gridAreas).toBe("none");
    expect(dimensions.ordered).toBe(true);
    expect(dimensions.stacked).toBe(true);
    expect(dimensions.inputHeight).toBeGreaterThanOrEqual(48);
    expect(dimensions.inputFont).toBe("16px");
    expect(dimensions.sameWidths).toBe(true);
    expect(dimensions.footerAfterContent).toBe(true);
    expect(dimensions.overflow).toBe(false);
    for (const button of await page
      .getByRole("group", { name: "Enquiry type" })
      .getByRole("button")
      .all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThan(120);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const submit = page.getByRole("button", {
      name: "Send message",
      exact: true,
    });
    await submit.click();
    await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
    await expect(page.getByLabel("Name", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.getByLabel("Name", { exact: true })).toHaveAttribute(
      "aria-describedby",
      "name-error",
    );
    expect(payloads).toHaveLength(0);
    await page.getByLabel("Name", { exact: true }).fill("Local Contact QA");
    await page.getByLabel("Email", { exact: true }).fill(sender);
    await page
      .getByLabel("Message", { exact: true })
      .fill("An intercepted request; no production delivery.");
    await page
      .getByRole("button", { name: "Hiring / collaboration", exact: true })
      .click();
    await submit.click();
    await expect(page.getByRole("button", { name: /sending/i })).toBeDisabled();
    releaseResponse();
    await expect(page.getByRole("alert")).toContainText("Something went wrong");
    await expect(page.getByLabel("Email", { exact: true })).toHaveValue(sender);
    expect(payloads[0]).toEqual({
      name: "Local Contact QA",
      email: sender,
      subject: "Hiring / collaboration",
      message: "An intercepted request; no production delivery.",
      website: "",
    });
    success = true;
    pendingResponse = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    await submit.click();
    await expect(page.getByRole("button", { name: /sending/i })).toBeDisabled();
    releaseResponse();
    await expect(page.locator(".contact-success")).toBeFocused();
    await expect(page.locator(".contact-success")).toContainText(sender);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Send another message", exact: true })
      .click();
    await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
  });
}

test("Contact keeps fields and submit above a reduced visual viewport and restores the AI launcher", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    let height = innerHeight;
    let offsetTop = 0;
    const viewport = new EventTarget();
    Object.defineProperties(viewport, {
      height: { get: () => height },
      offsetTop: { get: () => offsetTop },
      width: { get: () => innerWidth },
      scale: { get: () => 1 },
    });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: viewport,
    });
    Object.defineProperty(window, "setContactReviewViewport", {
      value: (nextHeight: number, nextTop: number) => {
        height = nextHeight;
        offsetTop = nextTop;
        viewport.dispatchEvent(new Event("resize"));
      },
    });
  });
  for (const [width, height, visibleHeight, offset] of [
    [390, 844, 300, 24],
    [844, 390, 180, 0],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/contact");
    await page.evaluate(
      ({ visibleHeight, offset }) =>
        (
          window as unknown as {
            setContactReviewViewport: (height: number, top: number) => void;
          }
        ).setContactReviewViewport(visibleHeight, offset),
      { visibleHeight, offset },
    );
    for (const target of [
      "#contact-name",
      "#contact-email",
      "#contact-subject",
      "#contact-message",
      '.contact-form [type="submit"]',
    ]) {
      const field = page.locator(target);
      await field.focus();
      await expect(page.locator(".landscape-contact")).toHaveAttribute(
        "data-contact-keyboard",
        "true",
      );
      await expect
        .poll(() =>
          field.evaluate(
            (el, { visibleHeight, offset }) => {
              const box = el.getBoundingClientRect();
              return (
                box.top >= offset + 15 &&
                box.bottom <= offset + visibleHeight - 15
              );
            },
            { visibleHeight, offset },
          ),
        )
        .toBe(true);
      await expect(
        page.getByRole("button", { name: "Ask Portfolio AI", exact: true }),
      ).toBeHidden();
    }
    await page.evaluate(() => {
      (document.activeElement as HTMLElement).blur();
      (
        window as unknown as {
          setContactReviewViewport: (height: number, top: number) => void;
        }
      ).setContactReviewViewport(innerHeight, 0);
    });
    await expect(page.locator(".landscape-contact")).toHaveAttribute(
      "data-contact-keyboard",
      "false",
    );
    await expect(
      page.getByRole("button", { name: "Ask Portfolio AI", exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Projects", exact: true })
    .click();
  await expect(page.locator(".portfolio")).not.toHaveClass(/is-contact/);
});

test("Contact retains the accepted desktop grid and form dimensions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1363, height: 936 });
  await page.goto("/contact");
  const desktop = await page.locator(".contact-layout").evaluate((layout) => {
    const form = layout.querySelector(".contact-form")!;
    const name = layout.querySelector("#contact-name")!.getBoundingClientRect();
    const email = layout
      .querySelector("#contact-email")!
      .getBoundingClientRect();
    return {
      areas: getComputedStyle(layout).gridTemplateAreas,
      padding: getComputedStyle(form).padding,
      inputHeight: name.height,
      paired: Math.abs(name.top - email.top) < 1 && email.left > name.right,
      footerPosition: getComputedStyle(document.querySelector(".stage-footer")!)
        .position,
    };
  });
  expect(desktop).toEqual({
    areas: '"intro form" "details form"',
    padding: "28px",
    inputHeight: 40,
    paired: true,
    footerPosition: "relative",
  });
});
