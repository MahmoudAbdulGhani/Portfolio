import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, prisma } from "../src/app.js";
import { contactSchema, cvMutationSchema, profileMutationSchema, projectMutationSchema } from "../src/lib/validation.js";
import { consumeRateLimit, rateLimitStorageKey } from "../src/lib/rate-limit.js";
import { AUTH_COOKIE, getAuthenticatedAdminId, setAuthCookie, signToken } from "../src/middleware/auth.js";
import jwt from "jsonwebtoken";

const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const request = (url, options = {}) => fetch(`${base}${url}`, options);

try {
  const health = await request("/api/health");
  assert.equal(health.status, 200);
  assert.equal(health.headers.get("x-content-type-options"), "nosniff");
  assert.ok(health.headers.get("content-security-policy"));
  assert.ok(health.headers.get("permissions-policy"));
  assert.equal(app.get("trust proxy"), false);
  assert.equal((await request("/api/health", { headers: { origin: "https://attacker.example" } })).headers.get("access-control-allow-origin"), null);
  assert.equal((await request("/api/health", { headers: { origin: "http://localhost:5173" } })).headers.get("access-control-allow-origin"), "http://localhost:5173");

  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  let cookieCapture;
  setAuthCookie({ cookie: (...args) => { cookieCapture = args; } }, "opaque-token");
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousNodeEnv;
  assert.equal(cookieCapture[2].httpOnly, true);
  assert.equal(cookieCapture[2].secure, true);
  assert.equal(cookieCapture[2].sameSite, "strict");
  assert.equal(cookieCapture[2].path, "/");
  const wrongAlgorithm = jwt.sign({ sub: "admin" }, process.env.JWT_SECRET, { algorithm: "HS384", issuer: "portfolio-admin", expiresIn: "1h" });
  assert.equal(getAuthenticatedAdminId({ headers: { cookie: `${AUTH_COOKIE}=${wrongAlgorithm}` } }), null);

  assert.equal((await request("/api/assistant", { method: "POST", body: "{}" })).status, 415);
  assert.equal((await request("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: "{" })).status, 400);
  assert.equal((await request("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: "hello", isAdmin: true }) })).status, 400);
  assert.equal((await request("/api/job-match", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jobDescription: "x".repeat(8001) }) })).status, 400);
  assert.equal((await request("/api/messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Test", email: "test@example.com", message: "A valid test message", role: "admin" }) })).status, 400);
  assert.equal((await request("/api/messages", { method: "POST", headers: { "content-type": "application/json" }, body: '{"name":"Test","email":"test@example.com","message":"A valid test message","__proto__":{"admin":true}}' })).status, 400);
  assert.equal((await request("/api/messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "x", email: "bad", message: "<script>alert(1)</script>" }) })).status, 400);
  assert.equal((await request("/api/messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Test", email: "test@example.com", message: "x".repeat(140_000) }) })).status, 413);

  const unauthenticated = await request("/api/admin/projects");
  assert.equal(unauthenticated.status, 401);
  assert.match(unauthenticated.headers.get("cache-control") ?? "", /no-store/);
  assert.equal((await request("/api/admin/projects/not-an-id!", { method: "DELETE", headers: { "content-type": "application/json", origin: "https://attacker.example" }, body: "{}" })).status, 403);
  assert.equal((await request("/api/admin/projects", { headers: { cookie: `${AUTH_COOKIE}=malformed.token.value` } })).status, 401);
  const admin = await prisma.admin.findFirst({ select: { id: true } });
  assert.ok(admin);
  const authHeaders = { "content-type": "application/json", origin: base, cookie: `${AUTH_COOKIE}=${encodeURIComponent(signToken(admin.id))}` };
  assert.equal((await request("/api/admin/projects", { headers: { cookie: authHeaders.cookie } })).status, 200);
  assert.equal((await request("/api/admin/projects/not-an-id!", { method: "DELETE", headers: authHeaders, body: "{}" })).status, 400);
  const existingProject = await prisma.project.findFirst({ select: { id: true } });
  assert.ok(existingProject);
  assert.equal((await request(`/api/admin/projects/${existingProject.id}`, { method: "PATCH", headers: authHeaders, body: JSON.stringify({ isAdmin: true }) })).status, 400);
  assert.equal((await request("/api/admin/profile", { method: "PATCH", headers: authHeaders, body: JSON.stringify({ socials: [{ label: "Unsafe", url: "javascript:alert(1)" }] }) })).status, 400);
  assert.equal((await request("/api/admin/cv", { method: "PUT", headers: authHeaders, body: JSON.stringify({ header: {}, application: {}, master: {}, isAdmin: true }) })).status, 400);
  assert.equal((await request("/api/admin/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "nobody@example.com", password: "test", isAdmin: true }) })).status, 400);
  const auditEmail = `security-audit-${Date.now()}@example.com`;
  const loginStatuses = [];
  for (let attempt = 0; attempt < 9; attempt += 1) loginStatuses.push((await request("/api/admin/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: auditEmail, password: "incorrect-password" }) })).status);
  assert.deepEqual(loginStatuses, [401, 401, 401, 401, 401, 401, 401, 401, 429]);
  await prisma.rateLimitBucket.deleteMany({ where: { key: { in: [rateLimitStorageKey("login-ip:127.0.0.1"), rateLimitStorageKey(`login-account:${auditEmail}`), rateLimitStorageKey(`login-combined:127.0.0.1:${auditEmail}`)] } } });
  assert.equal((await request("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status, 404);

  for (const unsafe of ["javascript:alert(1)", "data:text/html,test", "file:///etc/passwd"]) {
    assert.equal(projectMutationSchema.safeParse({ demo: unsafe }).success, false);
    assert.equal(projectMutationSchema.safeParse({ coverImage: unsafe }).success, false);
  }
  assert.equal(projectMutationSchema.safeParse({ coverImage: "/../../.env" }).success, false);
  assert.equal(projectMutationSchema.safeParse({ name: "Safe", isAdmin: true }).success, false);
  assert.equal(projectMutationSchema.safeParse({ name: { $gt: "" } }).success, false);
  assert.equal(contactSchema.safeParse({ name: "Robert'); DROP TABLE Message;--", email: "safe@example.com", message: "<script>alert('stored as text')</script>" }).success, true);

  const profile = await prisma.profile.findFirst({ include: { experience: true, socials: true } });
  assert.ok(profile);
  assert.equal(profileMutationSchema.safeParse({ experience: profile.experience }).success, true);
  assert.equal(profileMutationSchema.safeParse({ socials: profile.socials }).success, true);
  const cv = await prisma.cvConfiguration.findUnique({ where: { id: "default" } });
  assert.ok(cv);
  assert.equal(cvMutationSchema.safeParse({ professionalSummary: cv.professionalSummary, header: cv.header, application: cv.application, master: cv.master }).success, true);

  const limitKey = `security-test:${Date.now()}`;
  assert.equal((await consumeRateLimit(limitKey, { limit: 1, windowMs: 60_000 })).limited, false);
  assert.equal((await consumeRateLimit(limitKey, { limit: 1, windowMs: 60_000 })).limited, true);
  await prisma.rateLimitBucket.delete({ where: { key: rateLimitStorageKey(limitKey) } });

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
  async function files(dir) { return (await Promise.all((await readdir(dir, { withFileTypes: true })).map((entry) => entry.isDirectory() ? files(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat(); }
  const source = (await Promise.all((await files(root)).filter((file) => file.endsWith(".js")).map((file) => readFile(file, "utf8")))).join("\n");
  for (const pattern of ["$queryRawUnsafe", "$executeRawUnsafe", "dangerouslySetInnerHTML", "eval(", "new Function(", "execSync("]) assert.equal(source.includes(pattern), false, `unsafe sink found: ${pattern}`);

  console.log("Security defensive checks passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
}
