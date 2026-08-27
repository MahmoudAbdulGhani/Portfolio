import { createHash } from "node:crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { generateStreamWithGemini, generateWithGemini, GeminiError, sendGeminiError } from "../lib/gemini.js";
import { generateCvPdfBuffer } from "../lib/cv.js";
import { getPortfolioContextWithRetry } from "../lib/portfolio-context.js";
import { consumeRateLimit } from "../lib/rate-limit.js";
import { jobMatchSchema, tailoredCvSchema } from "../lib/validation.js";
import { getClientIp } from "../lib/client-ip.js";

const router = Router();
export const MAX_JOB_DESCRIPTION_LENGTH = 8_000;
const MIN_JOB_DESCRIPTION_LENGTH = 80;
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 4;
const DUPLICATE_WINDOW_MS = 30_000;
const MATCHER_INSTRUCTION = `You are a rigorous recruiter-facing job matcher. Compare the job description only with the supplied public portfolio snapshot. Do not invent or assume skills, seniority, employment, duration, achievements, or credentials. A project is evidence of project work, never employment. Distinguish professional experience, education/training, certifications, and projects. Treat related exposure as a partial match, not a strong match. State missing requirements honestly and do not automatically praise the candidate. Never calculate or return a percentage. Return JSON only with exactly these fields: matchLevel (one of "Strong Match", "Moderate Match", "Partial Match", "Limited Match"), overallMatch (string), strongMatches (string[]), relevantExperience (string[]), relevantProjects ({slug:string,evidence:string}[]), partialMatches (string[]), gaps (string[]), recruiterSummary (string). Use only project slugs present in the snapshot. Keep each item concise and evidence-based.`;

function writeEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function streamErrorMessage(error) {
  if (!(error instanceof GeminiError)) return "The match analysis could not be formatted safely. Please try again.";
  if (error.kind === "quota") return "The AI job matcher has reached its current usage limit. Please try again later.";
  if (error.kind === "configuration") return "The AI job matcher is temporarily unavailable due to a configuration issue.";
  if (error.kind === "timeout") return "The AI job matcher took too long to respond. Please try again.";
  return "The AI job matcher is temporarily unavailable. Please try again.";
}

function createCvToken(result) {
  if (!process.env.JWT_SECRET) return undefined;
  return jwt.sign({ kind: "tailored-cv", result }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    issuer: "portfolio-job-match",
    expiresIn: "15m",
  });
}

router.post("/tailored-cv", async (req, res, next) => {
  try {
    const parsed = tailoredCvSchema.safeParse(req.body ?? {});
    if (!parsed.success || !process.env.JWT_SECRET) return res.status(400).json({ message: "Invalid or expired tailored CV request." });
    const limit = await consumeRateLimit(`tailored-cv:${getClientIp(req)}`, { limit: 8, windowMs: 10 * 60_000 });
    if (limit.limited) {
      res.setHeader("Retry-After", String(limit.retryAfter));
      return res.status(429).json({ message: "Too many tailored CV requests. Please try again later." });
    }
    let payload;
    try {
      payload = jwt.verify(parsed.data.token, process.env.JWT_SECRET, { issuer: "portfolio-job-match", algorithms: ["HS256"] });
    } catch {
      return res.status(400).json({ message: "Invalid or expired tailored CV request." });
    }
    if (!payload || payload.kind !== "tailored-cv" || !payload.result) return res.status(400).json({ message: "Invalid tailored CV request." });
    const result = payload.result;
    const origin = process.env.PUBLIC_SITE_URL || `${req.protocol}://${req.get("host")}`;
    const buffer = await generateCvPdfBuffer({
      origin,
      mode: "application",
      tailor: {
        summary: result.recruiterSummary,
        strongMatches: result.strongMatches,
        projectSlugs: result.relevantProjects?.map((project) => project.slug),
      },
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", 'attachment; filename="tailored-portfolio-cv.pdf"');
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (error) { next(error); }
});
async function checkRequest(ip, description) {
  const digest = createHash("sha256").update(description.toLowerCase().replace(/\s+/g, " ")).digest("hex");
  const duplicate = await consumeRateLimit(`job-duplicate:${ip}:${digest}`, { limit: 1, windowMs: DUPLICATE_WINDOW_MS });
  if (duplicate.limited) return "duplicate";
  const rate = await consumeRateLimit(`job:${ip}`, { limit: MAX_REQUESTS, windowMs: WINDOW_MS });
  if (rate.limited) return "rate";
  return undefined;
}

function parseResult(text, context) {
  const normalized = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const value = JSON.parse(normalized);
  const allowedLevels = new Set(["Strong Match", "Moderate Match", "Partial Match", "Limited Match"]);
  if (!value || !allowedLevels.has(value.matchLevel) || typeof value.overallMatch !== "string" || typeof value.recruiterSummary !== "string") {
    throw new Error("Invalid matcher response shape");
  }
  const strings = (items) => Array.isArray(items) ? items.filter((item) => typeof item === "string" && item.trim()).slice(0, 12) : [];
  const projectsBySlug = new Map(context.projects.map((project) => [project.slug, project]));
  const relevantProjects = Array.isArray(value.relevantProjects) ? value.relevantProjects.flatMap((item) => {
    const project = item && projectsBySlug.get(item.slug);
    if (!project) return [];
    return [{ slug: project.slug, name: project.name, portfolioUrl: project.portfolioUrl, evidence: typeof item.evidence === "string" ? item.evidence : "Relevant portfolio project." }];
  }).slice(0, 6) : [];
  return {
    matchLevel: value.matchLevel,
    overallMatch: value.overallMatch.trim(),
    strongMatches: strings(value.strongMatches),
    relevantExperience: strings(value.relevantExperience),
    relevantProjects,
    partialMatches: strings(value.partialMatches),
    gaps: strings(value.gaps),
    recruiterSummary: value.recruiterSummary.trim(),
  };
}

router.post("/", async (req, res, next) => {
  try {
    const parsed = jobMatchSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: `Job descriptions must contain ${MIN_JOB_DESCRIPTION_LENGTH}–${MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} characters.` });
    const { jobDescription } = parsed.data;
    const clientIp = getClientIp(req);
    const requestIssue = await checkRequest(clientIp, jobDescription);
    if (requestIssue) {
      console.warn("[security] job_match_rate_limited", { ip: clientIp, reason: requestIssue });
      res.setHeader("Retry-After", requestIssue === "duplicate" ? "30" : "60");
      return res.status(429).json({ message: requestIssue === "duplicate" ? "This job description was just analyzed. Please wait before submitting it again." : "Too many match requests. Please wait a minute and try again." });
    }

    let context;
    try { context = await getPortfolioContextWithRetry(); }
    catch (error) {
      console.error("Job matcher portfolio context failed", { name: error instanceof Error ? error.name : "unknown error", code: error?.code });
      return res.status(503).json({ message: "Portfolio information is temporarily unavailable. Please try again." });
    }

    try {
      const userPrompt = `PUBLIC PORTFOLIO SNAPSHOT\n${JSON.stringify(context)}\n\nJOB DESCRIPTION\n${jobDescription}`;
      const wantsStream = parsed.data.stream === true && req.accepts("text/event-stream");
      if (wantsStream) {
        res.status(200);
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders();
        writeEvent(res, "status", { message: "Comparing portfolio evidence…" });
        const controller = new AbortController();
        req.on("close", () => controller.abort());
        let chunks = 0;
        try {
          const text = await generateStreamWithGemini({
            systemInstruction: MATCHER_INSTRUCTION,
            userPrompt,
            maxOutputTokens: 8_192,
            responseMimeType: "application/json",
            signal: controller.signal,
            onChunk: () => {
              chunks += 1;
              if (chunks === 1) writeEvent(res, "status", { message: "Analyzing role requirements…" });
              if (chunks === 4) writeEvent(res, "status", { message: "Building recruiter report…" });
            },
          });
          if (controller.signal.aborted) return;
          const result = parseResult(text, context);
          writeEvent(res, "result", { result, cvToken: createCvToken(result) });
          writeEvent(res, "done", {});
        } catch (error) {
          if (!controller.signal.aborted) writeEvent(res, "error", { message: streamErrorMessage(error) });
        }
        return res.end();
      }

      const text = await generateWithGemini({
        systemInstruction: MATCHER_INSTRUCTION,
        userPrompt,
        maxOutputTokens: 8_192,
        responseMimeType: "application/json",
      });
      let result;
      try { result = parseResult(text, context); }
      catch (error) {
        console.error("Job matcher returned invalid structured output", { name: error instanceof Error ? error.name : "unknown error" });
        return res.status(502).json({ message: "The match analysis could not be formatted safely. Please try again." });
      }
      res.setHeader("Cache-Control", "no-store");
      return res.json({ result, cvToken: createCvToken(result) });
    } catch (error) {
      if (sendGeminiError(res, error, "job matcher")) return;
      throw error;
    }
  } catch (error) { next(error); }
});

export default router;
