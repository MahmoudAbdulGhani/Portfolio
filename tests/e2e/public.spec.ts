import { expect, test } from "@playwright/test";

test("public navigation, theme, metadata, and mobile menu work", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Mahmoud Abdul Ghani/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/);
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
  await page.goto("/projects/lobby");
  await expect(page.getByRole("heading", { name: "Lobby", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /view lobby cover image full screen/i }).click();
  const gallery = page.getByRole("dialog", { name: /lobby image gallery/i });
  await expect(gallery).toBeVisible();
  await gallery.getByRole("button", { name: "Next image" }).first().click();
  await expect(gallery.getByText("2 / 6")).toBeVisible();
  await gallery.getByRole("button", { name: "Close gallery" }).click();
  await expect(gallery).toBeHidden();
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
