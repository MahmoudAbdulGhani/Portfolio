import { randomUUID } from "node:crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { generateStreamWithGemini, generateWithGemini, GeminiError } from "../lib/gemini.js";
import { beginJobMatchRequest, retireJobMatchRequest, discardUndeliveredJobMatch } from '../lib/job-match-requests.js';
import { generateCvPdfBuffer } from "../lib/cv.js";
import { getPortfolioContextWithRetry } from "../lib/portfolio-context.js";
import { consumeRateLimit } from "../lib/rate-limit.js";
import { jobMatchSchema, tailoredCvSchema } from "../lib/validation.js";
import { getClientIp } from "../lib/client-ip.js";
import { PUBLIC_COPY_INSTRUCTION, LEARNING_EVIDENCE_INSTRUCTION, PROJECT_EVIDENCE_INSTRUCTION, EMPLOYMENT_EVIDENCE_INSTRUCTION } from '../lib/evidence-instructions.js';
import { publicMatchCopy } from '../lib/public-professional-copy.js';
import { candidateCvForJob } from '../lib/candidate-cv.js';

const router = Router();
export const MAX_JOB_DESCRIPTION_LENGTH = 8_000;
const MATCHER_INSTRUCTION = `You are a rigorous recruiter-facing job matcher. Compare the job description only with the supplied public portfolio snapshot. Do not invent or assume skills, seniority, employment, duration, achievements, or credentials. A project is evidence of project work, never employment. Distinguish professional experience, education/training, certifications, and projects. Treat related exposure as a partial match, not a strong match. State missing requirements honestly and do not automatically praise the candidate. Never calculate or return a percentage. Return JSON only with exactly these fields: matchLevel (one of "Strong Match", "Moderate Match", "Partial Match", "Limited Match"), overallMatch (string), strongMatches (string[]), relevantExperience ({kind:"experience"|"education"|"training",index:number}[]), relevantProjects ({slug:string,evidence:string}[]), partialMatches (string[]), gaps (string[]), recruiterSummary (string). relevantExperience must reference zero-based indices in profile.experience, education or certifications respectively, not freeform employment claims. Use only project slugs present in the snapshot. Keep each item concise and evidence-based. recruiterSummary is an assessment for the report, never candidate CV copy. The server separately constructs the factual candidate summary.`;

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
  return jwt.sign({ kind: "tailored-cv", cv: {
    summaryPlan: result.candidateSummary.plan,
    projectSlugs: result.relevantProjects.map(project => project.slug),
  } }, process.env.JWT_SECRET, {
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
    if (!payload || payload.kind !== "tailored-cv" || (!payload.cv && !payload.result)) return res.status(400).json({ message: "Invalid tailored CV request." });
    const legacyProjects = Array.isArray(payload.result?.relevantProjects) ? payload.result.relevantProjects.filter(project => typeof project?.slug === 'string').map(project => project.slug) : [];
    const origin = process.env.PUBLIC_SITE_URL || `${req.protocol}://${req.get("host")}`;
    const buffer = await generateCvPdfBuffer({
      origin,
      mode: "application",
      tailor: {
        summaryPlan: payload.cv?.summaryPlan,
        // Old 15-minute tokens remain usable with the approved summary. Their
        // recruiter prose is never read as CV copy, even for legacy downloads.
        projectSlugs: payload.cv?.projectSlugs ?? legacyProjects,
      },
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", 'attachment; filename="tailored-portfolio-cv.pdf"');
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (error) { next(error); }
});
function parseResult(text, context, jobDescription) {
  const normalized = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const value = JSON.parse(normalized);
  const allowedLevels = new Set(["Strong Match", "Moderate Match", "Partial Match", "Limited Match"]);
  if (!value || !allowedLevels.has(value.matchLevel) || typeof value.overallMatch !== "string" || typeof value.recruiterSummary !== "string") {
    throw new Error("Invalid matcher response shape");
  }
  const strings = (items) => Array.isArray(items) ? items.filter((item) => typeof item === "string" && item.trim()).slice(0, 12) : [];
  const projectsBySlug = new Map(context.projects.map((project) => [project.slug, project]));
  const seenProjects = new Set();
  const relevantProjects = Array.isArray(value.relevantProjects) ? value.relevantProjects.flatMap((item) => {
    const project = item && projectsBySlug.get(item.slug);
    if (!project || seenProjects.has(project.slug)) return [];
    seenProjects.add(project.slug);
    return [{ slug: project.slug, name: project.name, portfolioUrl: project.portfolioUrl, evidence: typeof item.evidence === "string" ? item.evidence : "Relevant portfolio project." }];
  }).slice(0, 6) : [];
  const collections = { experience: context.profile.experience, education: context.education, training: context.certifications };
  const seenExperience = new Set();
  const relevantExperience = Array.isArray(value.relevantExperience) ? value.relevantExperience.flatMap(reference => {
    const record = reference && Number.isInteger(reference.index) && collections[reference.kind]?.[reference.index];
    const key = `${reference?.kind}:${reference?.index}`;
    if (!record || seenExperience.has(key)) return [];
    seenExperience.add(key);
    return [[record.role || record.milestone || record.degree || record.title,
      record.company || record.facility || record.school || record.issuer,
      record.employmentEvidence?.dateRange || record.period || record.year].filter(Boolean).join(' · ')];
  }).slice(0, 12) : [];
  const candidate = candidateCvForJob(context, jobDescription);
  const publicCopy = publicMatchCopy(context, jobDescription, candidate, { relevantExperience, partialMatches: strings(value.partialMatches), gaps: strings(value.gaps) });
  return {
    matchLevel: value.matchLevel,
    overallMatch: publicCopy.overallMatch,
    strongMatches: strings(value.strongMatches),
    relevantExperience,
    relevantProjects,
    partialMatches: publicCopy.partialMatches,
    gaps: publicCopy.gaps,
    recruiterSummary: publicCopy.recruiterSummary,
    candidateSummary: candidate,
  };
}

router.post("/", async (req, res) => {
  const requestId = randomUUID();
  const started = Date.now();
  const controller = new AbortController();
  let lease, result, retired = false, streaming = false, phase = 'request';
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('Cache-Control', 'no-store');
  const diagnose = (kind, stage = phase) => console.error('job_match_failed', { requestId, phase: stage, kind, elapsedMs: Date.now() - started });
  const disconnected = () => {
    if (res.writableFinished) return;
    controller.abort();
    diagnose('cancelled');
    if (retired && result && lease) void discardUndeliveredJobMatch(lease).catch(() => diagnose('cleanup', 'request-state'));
  };
  res.once('close', disconnected);
  res.once('finish', () => res.removeListener('close', disconnected));
  const failure = (status, code, message, retryAfter) => {
    const payload = { message, code, requestId, ...(retryAfter ? { retryAfter } : {}) };
    if (controller.signal.aborted || res.destroyed) return;
    if (streaming) { writeEvent(res, 'error', { ...payload, status }); return res.end(); }
    if (retryAfter) res.setHeader('Retry-After', String(retryAfter));
    return res.status(status).json(payload);
  };
  try {
    const parsed = jobMatchSchema.safeParse(req.body ?? {});
    if (!parsed.success) return failure(400, 'validation', 'Job descriptions must contain 80–8,000 characters.');
    const { jobDescription } = parsed.data;
    phase = 'request-state';
    const request = await beginJobMatchRequest(getClientIp(req), jobDescription);
    lease = request.lease;
    if (request.issue) {
      console.warn('job_match_request_blocked', { requestId, kind: request.issue, retryAfter: request.retryAfter, elapsedMs: Date.now() - started });
      const messages = {
        active: 'Another comparison is still running. Please wait before trying again.',
        completed: 'A report for this job description was generated recently. Please wait before requesting another.',
        rate: 'The comparison request limit has been reached. Please wait before trying again.',
        'provider-quota': 'The AI provider usage limit was reached. Please wait before trying again; availability is not guaranteed when the wait ends.',
      };
      return failure(request.issue === 'active' ? 409 : 429, request.issue, messages[request.issue], request.retryAfter);
    }
    if (controller.signal.aborted) return;
    phase = 'portfolio';
    const context = await getPortfolioContextWithRetry();
    if (controller.signal.aborted) return;
    const userPrompt = 'PUBLIC PORTFOLIO SNAPSHOT\n' + JSON.stringify(context) + '\n\nJOB DESCRIPTION\n' + jobDescription;
    const systemInstruction = [MATCHER_INSTRUCTION, LEARNING_EVIDENCE_INSTRUCTION, PROJECT_EVIDENCE_INSTRUCTION, EMPLOYMENT_EVIDENCE_INSTRUCTION, PUBLIC_COPY_INSTRUCTION].join(' ');
    streaming = parsed.data.stream === true && Boolean(req.accepts('text/event-stream'));
    if (streaming) {
      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();
      writeEvent(res, 'status', { message: 'Comparing skills and experience…', requestId });
    }
    phase = 'provider';
    let chunks = 0;
    const text = await (streaming ? generateStreamWithGemini : generateWithGemini)({
      systemInstruction, userPrompt, maxOutputTokens: 8_192, responseMimeType: 'application/json', signal: controller.signal,
      onChunk: () => {
        if (controller.signal.aborted) return;
        chunks += 1;
        if (chunks === 1) writeEvent(res, 'status', { message: 'Analyzing role requirements…' });
        if (chunks === 4) writeEvent(res, 'status', { message: 'Building recruiter report…' });
      },
    });
    if (controller.signal.aborted) return;
    phase = 'structured-output';
    result = parseResult(text, context, jobDescription);
    const payload = { result, cvToken: createCvToken(result) };
    phase = 'request-state';
    if (!await retireJobMatchRequest(lease, { completed: true })) throw new Error('Request lease expired');
    retired = true;
    if (controller.signal.aborted) { await discardUndeliveredJobMatch(lease); return; }
    if (streaming) {
      writeEvent(res, 'result', payload);
      writeEvent(res, 'done', {});
      return res.end();
    }
    return res.json(payload);
  } catch (error) {
    const code = controller.signal.aborted ? 'cancelled' : error instanceof GeminiError ? error.kind : phase === 'portfolio' ? 'context' : phase === 'structured-output' ? 'invalid-output' : 'request-state';
    if (code !== 'cancelled') diagnose(code);
    if (lease && !retired) {
      try { await retireJobMatchRequest(lease, { providerLimited: code === 'quota' }); retired = true; }
      catch { diagnose('cleanup', 'request-state'); }
    }
    if (controller.signal.aborted) return;
    if (lease && !retired) return failure(503, 'request-state', 'The comparison failed and its request slot is still being released. Please wait before trying again.', 2);
    if (error instanceof GeminiError) return failure(code === 'quota' ? 429 : code === 'timeout' ? 504 : code === 'configuration' ? 503 : 502,
      code, streamErrorMessage(error), code === 'quota' ? 60 : undefined);
    if (code === 'context') return failure(503, code, 'Portfolio information is temporarily unavailable. Please try again.');
    if (code === 'invalid-output') return failure(502, code, 'The match analysis could not be formatted safely. Please try again.');
    return failure(503, code, 'The comparison could not be started safely. Please try again.');
  } finally {
    if (lease && !retired) {
      try { await retireJobMatchRequest(lease); }
      catch { diagnose('cleanup', 'request-state'); }
    }
    if (controller.signal.aborted) res.removeListener('close', disconnected);
  }
});

export default router;
