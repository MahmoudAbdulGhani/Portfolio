import test from "node:test";
import assert from "node:assert/strict";
import {
  readAssistantResponse,
  evidenceUrl,
} from "../src/lib/assistant-response.ts";

test("browser decoder retains whitespace, Markdown and UTF-8 through fragmented SSE", async () => {
  const pieces = ["Hello", " ", "**world**", "\n\n", "مرحبا"];
  const wire =
    pieces.map((chunk) => `data: ${JSON.stringify({ chunk })}\n\n`).join("") +
    'data: {"done":true}\n\n';
  const bytes = new TextEncoder().encode(wire);
  const response = new Response(
    new ReadableStream({
      start(controller) {
        for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
        controller.close();
      },
    }),
    { headers: { "content-type": "text/event-stream" } },
  );
  const updates = [];
  assert.equal(
    await readAssistantResponse(response, (text) => updates.push(text)),
    pieces.join(""),
  );
  assert.equal(updates.at(-1), pieces.join(""));
});
test("incomplete or provider-error streams cannot masquerade as completed answers", async () => {
  for (const body of [
    'data: {"chunk":"partial"}\n\n',
    'data: {"error":"Generation interrupted"}\n\n',
  ])
    await assert.rejects(
      readAssistantResponse(
        new Response(body, {
          headers: { "content-type": "text/event-stream" },
        }),
      ),
      /interrupted/,
    );
});
test("JSON service answers and rate limit errors remain real service responses", async () => {
  assert.equal(
    await readAssistantResponse(
      Response.json({ answer: "Actual service response" }),
    ),
    "Actual service response",
  );
  await assert.rejects(
    readAssistantResponse(
      Response.json({ message: "Wait a minute" }, { status: 429 }),
    ),
    /Wait a minute/,
  );
});
test("evidence URLs retain real CV/project links and reject model placeholders or unsafe schemes", () => {
  for (const href of [
    "javascript:alert(1)",
    "{resumeUrl}",
    "https://example.com/%7BresumeUrl%7D",
  ])
    assert.equal(evidenceUrl(href, "http://localhost"), null);
  assert.equal(
    evidenceUrl("/api/cv.pdf", "http://localhost").pathname,
    "/api/cv.pdf",
  );
  assert.equal(
    evidenceUrl("/projects/lobby", "http://localhost").pathname,
    "/projects/lobby",
  );
});
