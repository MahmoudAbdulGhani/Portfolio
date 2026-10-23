import assert from "node:assert/strict";
import { test } from "node:test";
import { generateStreamWithGemini, generateWithGemini } from "../src/lib/gemini.js";
import { getEventListeners } from 'node:events';

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

for (const streaming of [false, true]) test(`the unchanged 40s deadline includes a stalled ${streaming ? 'stream' : 'JSON'} body after headers`, { timeout: 2_000 }, async t => {
  const oldFetch=globalThis.fetch,oldKey=process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY='test-only-provider-key';
  globalThis.fetch=async(_url,options)=>new Response(new ReadableStream({start(controller){
    options.signal.addEventListener('abort',()=>controller.error(new DOMException('Aborted','AbortError')),{once:true});
  }}));
  t.after(()=>{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=oldKey;});
  t.mock.timers.enable({apis:['setTimeout']});
  const pending=streaming?generateStreamWithGemini({userPrompt:'fixture'}):generateWithGemini({userPrompt:'fixture'});
  const rejected=assert.rejects(pending,error=>error.kind==='timeout');
  let settled=false;pending.then(()=>{settled=true;},()=>{settled=true;});
  await new Promise(setImmediate);t.mock.timers.tick(39_999);await Promise.resolve();assert.equal(settled,false);
  t.mock.timers.tick(1);await rejected;
});

test('completed and cancelled streams remove their caller-abort listener',async t=>{
  installProvider(t,new Response(`data: ${JSON.stringify(payload(['Recorded text']))}\n\n`));
  const complete=new AbortController();await generateStreamWithGemini({userPrompt:'fixture',signal:complete.signal});
  assert.equal(getEventListeners(complete.signal,'abort').length,0);
  const cancel=new AbortController();
  globalThis.fetch=async(_url,options)=>new Response(new ReadableStream({start(controller){options.signal.addEventListener('abort',()=>controller.error(new DOMException('Aborted','AbortError')),{once:true});}}));
  const pending=generateStreamWithGemini({userPrompt:'fixture',signal:cancel.signal});await new Promise(setImmediate);cancel.abort();
  assert.equal(await pending,'');assert.equal(getEventListeners(cancel.signal,'abort').length,0);
});

test('JSON generation also cancels native fetch and removes its caller-abort listener', async t => {
  installProvider(t, new Response(JSON.stringify(payload(['Complete factual response']))));
  const complete = new AbortController();
  assert.equal(await generateWithGemini({ userPrompt: 'fixture', signal: complete.signal }), 'Complete factual response');
  assert.equal(getEventListeners(complete.signal, 'abort').length, 0);
  const cancel = new AbortController(); let nativeSignal;
  globalThis.fetch = async (_url, options) => {
    nativeSignal = options.signal;
    return new Response(new ReadableStream({ start(controller) {
      nativeSignal.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError')), { once: true });
    } }));
  };
  const pending = generateWithGemini({ userPrompt: 'fixture', signal: cancel.signal });
  const rejected = assert.rejects(pending, error => error.name === 'GeminiError');
  await new Promise(setImmediate); cancel.abort(); await rejected;
  assert.equal(nativeSignal.aborted, true); assert.equal(getEventListeners(cancel.signal, 'abort').length, 0);
});
