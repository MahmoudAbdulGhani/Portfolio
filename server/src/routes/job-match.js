import { createHash } from "node:crypto";
import { Router } from "express";
import { generateWithGemini, sendGeminiError } from "../lib/gemini.js";
import { getPortfolioContextWithRetry } from "../lib/portfolio-context.js";

const router = Router();
export const MAX_JOB_DESCRIPTION_LENGTH = 8_000;
const MIN_JOB_DESCRIPTION_LENGTH = 80;
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 4;
const DUPLICATE_WINDOW_MS = 30_000;
const requestLog = new Map();
const duplicateLog = new Map();

function checkRequest(ip, description) {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return "rate";
  const digest = createHash("sha256").update(description.toLowerCase().replace(/\s+/g, " ")).digest("hex");
  const duplicateKey = `${ip}:${digest}`;
  if (now - (duplicateLog.get(duplicateKey) ?? 0) < DUPLICATE_WINDOW_MS) return "duplicate";
  recent.push(now); requestLog.set(ip, recent); duplicateLog.set(duplicateKey, now);
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
    const jobDescription = typeof req.body?.jobDescription === "string" ? req.body.jobDescription.trim() : "";
    if (!jobDescription) return res.status(400).json({ message: "Please paste a job description." });
    if (jobDescription.length < MIN_JOB_DESCRIPTION_LENGTH) return res.status(400).json({ message: `Please provide at least ${MIN_JOB_DESCRIPTION_LENGTH} characters so the role can be assessed accurately.` });
    if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) return res.status(400).json({ message: `Job descriptions must be ${MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} characters or fewer.` });
    const requestIssue = checkRequest(req.ip || "unknown", jobDescription);
    if (requestIssue) {
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
      const text = await generateWithGemini({
        systemInstruction: `You are a rigorous recruiter-facing job matcher. Compare the job description only with the supplied public portfolio snapshot. Do not invent or assume skills, seniority, employment, duration, achievements, or credentials. A project is evidence of project work, never employment. Distinguish professional experience, education/training, certifications, and projects. Treat related exposure as a partial match, not a strong match. State missing requirements honestly and do not automatically praise the candidate. Never calculate or return a percentage. Return JSON only with exactly these fields: matchLevel (one of "Strong Match", "Moderate Match", "Partial Match", "Limited Match"), overallMatch (string), strongMatches (string[]), relevantExperience (string[]), relevantProjects ({slug:string,evidence:string}[]), partialMatches (string[]), gaps (string[]), recruiterSummary (string). Use only project slugs present in the snapshot. Keep each item concise and evidence-based.`,
        userPrompt: `PUBLIC PORTFOLIO SNAPSHOT\n${JSON.stringify(context)}\n\nJOB DESCRIPTION\n${jobDescription}`,
        maxOutputTokens: 2_000,
        responseMimeType: "application/json",
      });
      let result;
      try { result = parseResult(text, context); }
      catch (error) {
        console.error("Job matcher returned invalid structured output", { name: error instanceof Error ? error.name : "unknown error" });
        return res.status(502).json({ message: "The match analysis could not be formatted safely. Please try again." });
      }
      res.setHeader("Cache-Control", "no-store");
      return res.json({ result });
    } catch (error) {
      if (sendGeminiError(res, error, "job matcher")) return;
      throw error;
    }
  } catch (error) { next(error); }
});

export default router;
