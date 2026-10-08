import assert from "node:assert/strict";
import { test } from "node:test";
import { generateStreamWithGemini, generateWithGemini } from "../src/lib/gemini.js";

function payload(parts) {
  return { candidates: [{ content: { parts: parts.map(text => ({ text })) } }] };
}

function installProvider(t, response) {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only-provider-key";
  globalThis.fetch = async () => response;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });
}

test("stream preserves boundary spaces, whitespace-only chunks and Markdown", async t => {
  const chunks = ["Mahm", "oud ", "Abdul", " ", "Ghani\n\n", "**Skills", ":**\n", "- React", " and ", "Django"];
  installProvider(t, new Response(chunks.map(chunk => `data: ${JSON.stringify(payload([chunk]))}\n\n`).join("")));
  const received = [];
  const answer = await generateStreamWithGemini({ userPrompt: "test", onChunk: chunk => received.push(chunk) });
  assert.deepEqual(received, chunks);
  assert.equal(answer, "Mahmoud Abdul Ghani\n\n**Skills:**\n- React and Django");
});

test("stream concatenates provider parts without adding separators", async t => {
  installProvider(t, new Response(`data: ${JSON.stringify(payload(["Full", "-Stack ", "Developer"]))}\n\n`));
  assert.equal(await generateStreamWithGemini({ userPrompt: "test" }), "Full-Stack Developer");
});

test("stream retains UTF-8 and whitespace across arbitrary transport splits", async t => {
  const expected = "React — FastAPI\n\nالعربية ";
  const bytes = new TextEncoder().encode(`data: ${JSON.stringify(payload([expected]))}\n\n`);
  const body = new ReadableStream({ start(controller) {
    for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
    controller.close();
  } });
  installProvider(t, new Response(body));
  assert.equal(await generateStreamWithGemini({ userPrompt: "test" }), expected);
});

test("complete nonstream answer retains existing outer trimming", async t => {
  installProvider(t, new Response(JSON.stringify(payload(["  React ", "FastAPI  "]))));
  assert.equal(await generateWithGemini({ userPrompt: "test" }), "React \nFastAPI");
});
