import "dotenv/config";
import assert from "node:assert/strict";
import http from "node:http";
import { app, prisma } from "../src/app.js";
import { rateLimitStorageKey } from "../src/lib/rate-limit.js";
import { MAX_JOB_DESCRIPTION_LENGTH } from "../src/routes/job-match.js";

process.env.GEMINI_API_KEY = "integration-test-key";
process.env.JWT_SECRET = "job-match-integration-test-secret-at-least-32-characters";
let providerMode = "success";
const providerCalls = [];
globalThis.fetch = async (_url, init) => {
  providerCalls.push(JSON.parse(init.body));
  if (providerMode === "quota") return new Response(JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }), { status: 429, headers: { "Content-Type": "application/json" } });
  if (providerMode === "timeout") throw new DOMException("The operation was aborted.", "AbortError");
  if (providerMode === "provider5xx") return new Response(JSON.stringify({ error: { status: "UNAVAILABLE" } }), { status: 503, headers: { "Content-Type": "application/json" } });
  if (providerMode === "empty") return new Response(JSON.stringify({ candidates: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  if (providerMode === "badBody") return new Response("<html>not json</html>", { status: 200, headers: { "Content-Type": "text/html" } });
  if (providerMode === "truncatedJson") return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"matchLevel":"Moderate Match","overallMatch":"cut off mid-stream' }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({
    matchLevel: "Moderate Match",
    overallMatch: "Several requirements are supported by portfolio evidence.",
    strongMatches: ["React"], relevantExperience: ["Relevant training is documented."],
    relevantProjects: [{ slug: "__FIRST_PROJECT__", evidence: "Uses matching technologies." }, { slug: "invented-project", evidence: "Must be removed." }],
    partialMatches: ["Related cloud exposure"], gaps: ["Docker is not demonstrated."],
    recruiterSummary: "Worth considering where demonstrated project experience meets the role's needs.",
  }) }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
};

const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const { port } = server.address();
function post(body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = http.request({ host: "127.0.0.1", port, path: "/api/job-match", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } }, (response) => {
      let text = ""; response.on("data", (chunk) => { text += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, body: JSON.parse(text) }));
    });
    request.on("error", reject); request.end(payload);
  });
}
function postTailoredCv(token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ token });
    const request = http.request({ host: "127.0.0.1", port, path: "/api/job-match/tailored-cv", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } }, (response) => {
      const chunks = []; response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
    });
    request.on("error", reject); request.end(payload);
  });
}

try {
  const project = await prisma.project.findFirst({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { slug: true, name: true } });
  assert.ok(project, "At least one published project is required");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const response = await originalFetch(url, init);
    if (providerMode !== "success") return response;
    const payload = await response.json();
    payload.candidates[0].content.parts[0].text = payload.candidates[0].content.parts[0].text.replace("__FIRST_PROJECT__", project.slug);
    return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  let result = await post({ jobDescription: "" });
  assert.equal(result.status, 400);
  result = await post({ jobDescription: "React developer" });
  assert.equal(result.status, 400);
  result = await post({ jobDescription: "x".repeat(MAX_JOB_DESCRIPTION_LENGTH + 1) });
  assert.equal(result.status, 400);
  assert.equal(providerCalls.length, 0);

  const description = "We need a React and Node.js developer to build accessible applications, REST APIs, and PostgreSQL-backed features with a collaborative product team.";
  result = await post({ jobDescription: description });
  assert.equal(result.status, 200);
  assert.equal(providerCalls.length, 1);
  const prompt = providerCalls[0].contents[0].parts[0].text;
  assert.match(prompt, /PUBLIC PORTFOLIO SNAPSHOT/);
  assert.match(prompt, new RegExp(project.slug));
  assert.match(prompt, /JOB DESCRIPTION/);
  assert.equal(result.body.result.relevantProjects.length, 1, "Unknown project slugs must be removed");
  assert.equal(result.body.result.relevantProjects[0].portfolioUrl, `/projects/${project.slug}`);
  assert.equal(typeof result.body.cvToken, "string");
  assert.ok(result.body.cvToken.length > 20);
  const tailoredCv = await postTailoredCv(result.body.cvToken);
  assert.equal(tailoredCv.status, 200);
  assert.match(tailoredCv.headers["content-type"], /application\/pdf/);
  assert.equal(tailoredCv.body.subarray(0, 4).toString(), "%PDF");

  result = await post({ jobDescription: description });
  assert.equal(result.status, 429);
  assert.equal(providerCalls.length, 1, "Duplicate request must not call Gemini");

  providerMode = "quota";
  result = await post({ jobDescription: `${description} The role also requires clear technical communication.` });
  assert.equal(result.status, 429);
  assert.match(result.body.message, /usage limit/i);

  await prisma.rateLimitBucket.deleteMany({ where: { key: rateLimitStorageKey("job:127.0.0.1") } });

  const postFailure = async (mode, suffix) => {
    await prisma.rateLimitBucket.deleteMany({ where: { key: rateLimitStorageKey("job:127.0.0.1") } });
    providerMode = mode;
    return post({ jobDescription: `${description} ${suffix}` });
  };

  result = await postFailure("timeout", "The role requires leading technical decisions across teams.");
  assert.equal(result.status, 504);
  assert.match(result.body.message, /took too long/i);

  result = await postFailure("provider5xx", "The role requires coordinating cross-team delivery.");
  assert.equal(result.status, 502);
  assert.match(result.body.message, /temporarily unavailable/i);

  result = await postFailure("empty", "The role requires strong analytical reasoning.");
  assert.equal(result.status, 502);
  assert.match(result.body.message, /temporarily unavailable/i);

  result = await postFailure("badBody", "The role requires careful attention to detail.");
  assert.equal(result.status, 502);
  assert.match(result.body.message, /temporarily unavailable/i);

  result = await postFailure("truncatedJson", "The role requires effective written communication.");
  assert.equal(result.status, 502);
  assert.match(result.body.message, /could not be formatted safely/i);

  console.log("Job matcher integration checks passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
}
