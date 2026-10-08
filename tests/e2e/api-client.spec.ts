import { expect, test } from "@playwright/test";

test("API transport merges streaming Accept with JSON for every HeadersInit form", async ({
  page,
}) => {
  await page.route("**/api/**", (route) =>
    route.fulfill({ contentType: "application/json", body: "[]" }),
  );
  await page.goto("/");
  const requests: { headers: Record<string, string>; body: unknown }[] = [];
  await page.route("**/api/header-regression", (route) => {
    requests.push({
      headers: route.request().headers(),
      body: route.request().postDataJSON(),
    });
    return route.fulfill({ contentType: "application/json", body: "{}" });
  });
  const credentials = await page.evaluate(async () => {
    const modulePath = "/src/lib/api.ts";
    const { apiResponse } = await import(modulePath);
    const original = window.fetch;
    const captured: (RequestCredentials | undefined)[] = [];
    window.fetch = (input, init) => {
      captured.push(init?.credentials);
      return original(input, init);
    };
    try {
      for (const headers of [
        { Accept: "text/event-stream" },
        new Headers({ Accept: "text/event-stream" }),
        [["Accept", "text/event-stream"]],
      ]) {
        await apiResponse("/header-regression", {
          method: "POST",
          headers,
          body: JSON.stringify({
            question: "A transport regression question",
            stream: true,
          }),
        });
      }
      await apiResponse("/header-regression", {
        method: "POST",
        credentials: "omit",
        headers: { Accept: "text/event-stream" },
        body: "{}",
      });
      await apiResponse("/header-regression", {
        method: "POST",
        headers: new Headers({
          "content-type": "application/problem+json",
          Accept: "text/event-stream",
        }),
        body: "{}",
      });
      return captured;
    } finally {
      window.fetch = original;
    }
  });
  expect(requests).toHaveLength(5);
  for (const request of requests.slice(0, 4)) {
    expect(request.headers["content-type"]).toBe("application/json");
    expect(request.headers.accept).toBe("text/event-stream");
  }
  expect(requests[4].headers["content-type"]).toBe("application/problem+json");
  expect(requests[4].headers.accept).toBe("text/event-stream");
  expect(requests[0].body).toMatchObject({ stream: true });
  expect(credentials).toEqual(["include", "include", "include", "omit", "include"]);
});

test("API transport preserves multipart boundaries and admin unauthorized events", async ({
  page,
}) => {
  await page.route("**/api/**", (route) =>
    route.fulfill({ contentType: "application/json", body: "[]" }),
  );
  await page.goto("/");
  let uploadHeaders: Record<string, string> = {};
  await page.route("**/api/upload-regression", (route) => {
    uploadHeaders = route.request().headers();
    return route.fulfill({ contentType: "application/json", body: "{}" });
  });
  await page.route("**/api/admin/regression", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: '{"message":"Session expired"}',
    }),
  );
  const result = await page.evaluate(async () => {
    const modulePath = "/src/lib/api.ts";
    const { apiResponse } = await import(modulePath);
    const body = new FormData();
    body.set("caption", "Test upload");
    await apiResponse("/upload-regression", {
      method: "POST",
      headers: new Headers({ Accept: "application/json" }),
      body,
    });
    let unauthorized = 0;
    const listener = () => unauthorized++;
    window.addEventListener("admin:unauthorized", listener);
    try {
      await apiResponse("/admin/regression");
    } catch (error) {
      window.removeEventListener("admin:unauthorized", listener);
      return { unauthorized, message: (error as Error).message };
    }
    return { unauthorized, message: "" };
  });
  expect(uploadHeaders["content-type"]).toMatch(
    /^multipart\/form-data; boundary=/,
  );
  expect(uploadHeaders.accept).toBe("application/json");
  expect(result).toEqual({ unauthorized: 1, message: "Session expired" });
});
