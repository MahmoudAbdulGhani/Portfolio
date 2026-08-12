import "dotenv/config";
import assert from "node:assert/strict";
import http from "node:http";
import { app, prisma } from "../src/app.js";

process.env.GEMINI_API_KEY = "integration-test-key";

let providerMode = "success";
let providerCalls = [];
globalThis.fetch = async (_url, init) => {
  providerCalls.push(JSON.parse(init.body));
  if (providerMode === "quota") {
    return new Response(JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60" },
    });
  }
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Test response" }] } }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const { port } = server.address();

function post(body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = http.request({
      host: "127.0.0.1",
      port,
      path: "/api/assistant",
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
    }, (response) => {
      let text = "";
      response.on("data", (chunk) => { text += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, body: JSON.parse(text) }));
    });
    request.on("error", reject);
    request.end(payload);
  });
}

try {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    take: 2,
    select: { slug: true, name: true },
  });
  assert.ok(projects.length > 0, "At least one published project is required");

  let result = await post({ question: "Summarize Mahmoud." });
  assert.equal(result.status, 200);
  let snapshot = JSON.parse(providerCalls.at(-1).contents[0].parts[0].text.match(/PORTFOLIO SNAPSHOT\n(.+)\n\nVISITOR QUESTION/s)[1]);
  assert.equal(snapshot.currentProject, undefined);

  for (const project of projects) {
    result = await post({ question: "What technologies are used?", projectSlug: project.slug });
    assert.equal(result.status, 200);
    snapshot = JSON.parse(providerCalls.at(-1).contents[0].parts[0].text.match(/PORTFOLIO SNAPSHOT\n(.+)\n\nVISITOR QUESTION/s)[1]);
    assert.equal(snapshot.currentProject.slug, project.slug);
    assert.equal(snapshot.currentProject.name, project.name);
    assert.equal(snapshot.currentProject.portfolioUrl, `/projects/${project.slug}`);
  }

  const callsBeforeValidation = providerCalls.length;
  result = await post({ question: "Hello", projectSlug: "Not Valid!" });
  assert.equal(result.status, 400);
  result = await post({ question: "Hello", projectSlug: "missing-project-integration-test" });
  assert.equal(result.status, 404);
  assert.equal(providerCalls.length, callsBeforeValidation);

  providerMode = "quota";
  result = await post({ question: "Hello", projectSlug: projects[0].slug });
  assert.equal(result.status, 429);
  assert.match(result.body.message, /usage limit/i);

  console.log(`Assistant integration checks passed (${projects.length} project context${projects.length === 1 ? "" : "s"}).`);
} finally {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
}
