import "dotenv/config";
import assert from "node:assert/strict";
import http from "node:http";
import { app, prisma } from "../src/app.js";
import { MAX_JOB_DESCRIPTION_LENGTH } from "../src/routes/job-match.js";

process.env.GEMINI_API_KEY = "integration-test-key";
let providerMode = "success";
const providerCalls = [];
globalThis.fetch = async (_url, init) => {
  providerCalls.push(JSON.parse(init.body));
  if (providerMode === "quota") return new Response(JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }), { status: 429, headers: { "Content-Type": "application/json" } });
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

  result = await post({ jobDescription: description });
  assert.equal(result.status, 429);
  assert.equal(providerCalls.length, 1, "Duplicate request must not call Gemini");

  providerMode = "quota";
  result = await post({ jobDescription: `${description} The role also requires clear technical communication.` });
  assert.equal(result.status, 429);
  assert.match(result.body.message, /usage limit/i);
  console.log("Job matcher integration checks passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
}
