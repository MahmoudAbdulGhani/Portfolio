import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiCheck, FiCopy, FiDownload, FiRefreshCw, FiZap, FiLoader } from "react-icons/fi";
import { API_BASE, ApiError } from "../lib/api";
import { PageMeta } from "../components/PageMeta";
import { useProjects, useSiteSection } from "../lib/hooks";
import { resolveMatchProjects } from '../lib/project-evidence';
import { galleryCovers } from '../generated/gallery-covers';
import { ResponsiveProjectImage } from '../components/ResponsiveProjectImage';
import { PublicDataState } from '../components/PublicDataState';
import './supporting-pages.css';

const MAX_LENGTH = 8_000;
const MIN_LENGTH = 80;
const FRONTEND_TIMEOUT_MS = 70_000;

type MatchResult = {
  matchLevel: "Strong Match" | "Moderate Match" | "Partial Match" | "Limited Match";
  overallMatch: string;
  strongMatches: string[];
  relevantExperience: string[];
  relevantProjects: { slug: string; name: string; portfolioUrl: string; evidence: string }[];
  partialMatches: string[];
  gaps: string[];
  recruiterSummary: string;
  candidateSummary?: { text: string; source: 'record-grounded' | 'approved-profile' };
};

// Route continuity stays in memory; never persist the signed CV token to disk.
let matchMemory: { description: string; result?: MatchResult; token: string } = { description: '', token: '' };

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <section className="ai-report-section"><h3>{title}</h3><ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>;
}

function formatMatchReport(result: MatchResult, references: ReturnType<typeof resolveMatchProjects>) {
  const section = (title: string, items: string[]) => items.length ? `\n${title}\n${items.map((item) => `- ${item}`).join("\n")}` : "";
  const projects = references.map(project => `- ${project.name}: ${project.evidence} (${project.href})`);

  return [
    "PORTFOLIO JOB MATCH REPORT",
    `Match level: ${result.matchLevel}`,
    `\nOverall match\n${result.overallMatch}`,
    section("Strong matches", result.strongMatches),
    section("Relevant experience", result.relevantExperience),
    section("Relevant projects", projects),
    section("Partial matches", result.partialMatches),
    section("Gaps / not demonstrated", result.gaps),
    `\nRecruiter summary\n${result.recruiterSummary}`,
  ].filter(Boolean).join("\n");
}

export function JobMatch() {
  const { data: section } = useSiteSection("jobMatch");
  const projects = useProjects();
  const [jobDescription, setJobDescription] = useState(matchMemory.description);
  const [result, setResult] = useState<MatchResult | undefined>(matchMemory.result);
  const [error, setError] = useState("");
  const [inputInvalid, setInputInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [cvToken, setCvToken] = useState(matchMemory.token);
  const [downloadingCv, setDownloadingCv] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Comparing portfolio evidence…");
  const submitting = useRef(false);
  const activeRequest = useRef<AbortController | null>(null);
  useEffect(() => { matchMemory = { description: jobDescription, result, token: cvToken }; }, [jobDescription, result, cvToken]);
  useEffect(() => () => activeRequest.current?.abort(), []);

  useEffect(() => {
    if (!loading) return;
    const phases: Array<[number, string]> = [
      [8_000, "Analyzing job requirements…"],
      [20_000, "Comparing with portfolio experience…"],
      [35_000, "Preparing match report…"],
    ];
    const timers = phases.map(([delay, message]) => setTimeout(() => setLoadingMessage(message), delay));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [loading]);

  const submit = async () => {
    const value = jobDescription.trim();
    const invalid = (message: string) => { setError(message); setInputInvalid(true); document.getElementById("job-description")?.focus(); };
    if (!value) return invalid("Please paste a job description.");
    if (value.length < MIN_LENGTH) return invalid(`Please provide at least ${MIN_LENGTH} characters for an accurate comparison.`);
    if (value.length > MAX_LENGTH) return invalid(`Job descriptions must be ${MAX_LENGTH.toLocaleString()} characters or fewer.`);
    if (submitting.current) return;
    submitting.current = true; setLoading(true); setError(""); setInputInvalid(false); setResult(undefined); setCvToken(""); setLoadingMessage("Comparing portfolio evidence…");
    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = setTimeout(() => controller.abort(), FRONTEND_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_BASE}/job-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ jobDescription: value, stream: true }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        throw new ApiError(response.status, body?.message || "The AI job matcher is temporarily unavailable.");
      }
      if (!response.body) throw new Error("No analysis stream was returned.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedResult: MatchResult | undefined;
      let streamError = "";
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const eventBlock of events) {
          const eventName = eventBlock.split("\n").find((line) => line.startsWith("event:"))?.slice(6).trim();
          const dataLine = eventBlock.split("\n").find((line) => line.startsWith("data:"));
          if (!dataLine) continue;
          const data = JSON.parse(dataLine.slice(5).trim()) as { message?: string; result?: MatchResult; cvToken?: string };
          if (eventName === "status" && data.message) setLoadingMessage(data.message);
          if (eventName === "result" && data.result) {
            streamedResult = data.result;
            setCvToken(data.cvToken || "");
          }
          if (eventName === "error") streamError = data.message || "The AI job matcher is temporarily unavailable.";
        }
      }
      if (streamError) throw new ApiError(502, streamError);
      if (!streamedResult) throw new Error("The match analysis returned no report. Please try again.");
      setResult(streamedResult);
    } catch (caught) {
      if (caught instanceof Error && caught.name === "AbortError") {
        setError("The AI job matcher took too long to respond. Please try again.");
      } else {
        setError(caught instanceof ApiError ? caught.message : "The AI job matcher is temporarily unavailable. Please try again.");
      }
    } finally { clearTimeout(timeout); submitting.current = false; setLoading(false); setLoadingMessage("Comparing portfolio evidence…"); }
  };

  const clear = () => { setJobDescription(""); setResult(undefined); setError(""); setInputInvalid(false); setSummaryCopied(false); setCvToken(""); };

  const copySummary = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.recruiterSummary);
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 2_000);
    } catch {
      setError("Could not copy the summary. Please select and copy it manually.");
    }
  };

  const exportReport = () => {
    if (!result) return;
    const blob = new Blob([formatMatchReport(result, resolveMatchProjects(result.relevantProjects, projects.data ?? []))], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `portfolio-job-match-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const downloadTailoredCv = async () => {
    if (!cvToken || downloadingCv) return;
    setDownloadingCv(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/job-match/tailored-cv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: cvToken }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        throw new Error(body?.message || "The tailored CV could not be generated.");
      }
      if (!response.headers.get("content-type")?.includes("application/pdf")) throw new Error("The tailored CV response was not a PDF.");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "tailored-portfolio-cv.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The tailored CV could not be generated.");
    } finally {
      setDownloadingCv(false);
    }
  };

  const descriptionError = error || (jobDescription.length > MAX_LENGTH ? `Job descriptions must be ${MAX_LENGTH.toLocaleString()} characters or fewer.` : "");
  const projectEvidence = result ? resolveMatchProjects(result.relevantProjects, projects.data ?? []) : [];

  return <>
    <PageMeta title={typeof section?.content.seoTitle === "string" ? section.content.seoTitle : section?.heading ?? ""} description={typeof section?.content.seoDescription === "string" ? section.content.seoDescription : section?.description ?? undefined} />
    <main id="main-content" tabIndex={-1} className="public-page ai-page supporting-page">
      <section className="public-container">
        <header className="ai-intro">
          <p className="public-eyebrow">{section?.eyebrow || "AI-powered portfolio evidence"}</p>
          <h1>{section?.heading?.startsWith("AI") ? section.heading : `AI ${section?.heading || "Job Match"}`}</h1>
          <p className="public-display-accent">{typeof section?.content.displaySubtitle === "string" ? section.content.displaySubtitle : "See the fit. Understand the gaps."}</p>
          <p className="ai-description">{section?.description || "Paste a job description to compare the role with my portfolio evidence."}</p>
        </header>
        <p className="sr-only match-announcement" role="status" aria-live="polite" aria-atomic="true">{loading ? loadingMessage : downloadingCv ? 'Preparing the tailored CV…' : result ? summaryCopied ? 'Executive summary copied.' : 'Report ready. Read the strengths, gaps and project evidence.' : ''}</p>
        <div className="ai-workbench">
          <form onSubmit={(event: FormEvent) => { event.preventDefault(); void submit(); }} className="ai-form">
            <div className="ai-input-heading"><h2>Job description</h2><p>Include responsibilities, required skills, and experience level.</p></div>
            <label htmlFor="job-description" className="sr-only">Job description</label>
            <textarea id="job-description" className={`textarea mt-6 resize-y ${descriptionError ? 'textarea-error' : ''}`} value={jobDescription} maxLength={MAX_LENGTH + 1} disabled={loading} onChange={event => { setJobDescription(event.target.value); setInputInvalid(false); if (error) setError(''); }} placeholder="Paste the job description here (minimum 80 characters)…" aria-describedby={descriptionError ? 'job-help job-error' : 'job-help'} aria-invalid={inputInvalid || jobDescription.length > MAX_LENGTH} />
            <div id="job-help" className="mt-2 flex justify-between gap-4"><span>Minimum {MIN_LENGTH} characters</span><span>{jobDescription.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}</span></div>
            {descriptionError && <div id="job-error" role="alert" className="inline-state-enter mt-4 flex gap-2.5 border border-danger/25 p-3 text-sm leading-relaxed text-danger"><FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" /><span>{descriptionError}</span></div>}
            {error && !inputInvalid && !result && <button type="button" className="btn-outline mt-4" onClick={() => void submit()} disabled={loading}>Try again<FiRefreshCw aria-hidden="true" /></button>}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" className="btn-ghost" onClick={clear} disabled={loading || (!jobDescription && !result)}><FiRefreshCw aria-hidden="true" />Clear</button>
              <button type="submit" className="btn-primary btn-lg" disabled={loading || jobDescription.length > MAX_LENGTH}>{loading ? <><FiLoader className="animate-spin" aria-hidden="true" />Analyzing role…</> : <><FiZap aria-hidden="true" />Check My Fit</>}</button>
            </div>
          </form>
          <section className="ai-result" aria-label="Role comparison" aria-busy={loading}>
            {loading && <div className="ai-loading ai-state-enter"><div><FiLoader className="animate-spin" aria-hidden="true" /><strong>{loadingMessage}</strong></div><p>Reviewing public skills, projects, experience, education, and certifications.</p></div>}
            {!loading && !result && <div className="ai-idle ai-state-enter"><h2>An evidence-based comparison</h2><p>Supported strengths, partial matches and requirements that are not demonstrated remain separate.</p><ul className="ai-evidence"><li><strong>Supported strengths</strong><p>Compare the role with documented skills and contribution records.</p></li><li><strong>Gaps or unverified requirements</strong><p>Keep partial evidence and missing requirements visible.</p></li><li><strong>Supporting project evidence</strong><p>Read the case studies and their contribution scope.</p></li></ul></div>}
            {result && <article className="ai-report ai-state-enter">
              <header className="ai-report-header"><h2>Evidence comparison</h2><p className="ai-report-meta">Comparison: {result.matchLevel}</p><p>{result.overallMatch}</p>
                <div className="ai-report-actions">
                  <button type="button" className="btn-outline" onClick={copySummary}>{summaryCopied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}{summaryCopied ? 'Summary Copied' : 'Copy Executive Summary'}</button>
                  <button type="button" className="btn-ghost" onClick={exportReport}><FiDownload aria-hidden="true" />Export Report</button>
                  {cvToken && <button type="button" className="btn-primary" onClick={downloadTailoredCv} disabled={downloadingCv}><FiDownload aria-hidden="true" />{downloadingCv ? 'Generating CV…' : 'Download Tailored CV'}</button>}
                </div>
              </header>
              <div>
                <ListSection title="Supported strengths" items={result.strongMatches} />
                <ListSection title="Gaps or unverified requirements" items={result.gaps} />
                <ListSection title="Related or partial evidence" items={result.partialMatches} />
                <ListSection title="Experience and training" items={result.relevantExperience} />
                {result.relevantProjects.length > 0 && <section className="ai-report-section"><h3>Supporting project evidence</h3>
                  <PublicDataState loading={projects.isLoading} error={projects.isError} onRetry={() => void projects.refetch()} label="project evidence" />
                  {!projects.isLoading && !projects.isError && !projectEvidence.length && <p>No current project reference is available for this report.</p>}
                  {projectEvidence.map(reference => {
                    const cover = galleryCovers[reference.slug];
                    return <article className="match-project-evidence" key={reference.slug} data-evidence-project={reference.slug}>
                      <Link className="match-project-link" to={reference.href}>
                        {cover ? <span className="match-project-cover"><ResponsiveProjectImage src={cover.src} sources={cover.sources} alt="" fit="frame" sizes="88px" /></span> : <span aria-hidden="true" />}
                        <span><span className="match-project-name">{reference.number && <span className="record-number">{reference.number} </span>}{reference.name}</span><span className="match-project-scope">{reference.scope}</span></span><FiArrowRight aria-hidden="true" />
                      </Link>
                      <p>{reference.evidence}</p>
                    </article>;
                  })}
                </section>}
                <section className="ai-report-section"><h3>Recruiter summary</h3><p>{result.recruiterSummary}</p></section>
              </div>
            </article>}
          </section>
        </div>
      </section>
    </main>
  </>;
}
