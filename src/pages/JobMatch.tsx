import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiCheck, FiCheckCircle, FiCopy, FiDownload, FiRefreshCw, FiSearch, FiZap } from "react-icons/fi";
import { API_BASE, ApiError } from "../lib/api";
import { PageMeta } from "../components/PageMeta";
import { useSiteSection } from "../lib/hooks";

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
};

function matchBadge(level: MatchResult["matchLevel"]) {
  const tones: Record<MatchResult["matchLevel"], string> = {
    "Strong Match": "border-ok/30 bg-ok/10 text-ok",
    "Moderate Match": "border-gold/30 bg-gold/10 text-gold",
    "Partial Match": "border-accent/30 bg-accent/10 text-accent",
    "Limited Match": "border-danger/25 bg-danger/8 text-danger",
  };
  return tones[level];
}

function ListSection({ title, items, tone = "default" }: { title: string; items: string[]; tone?: "default" | "good" | "gap" }) {
  if (!items.length) return null;
  const dot = tone === "good" ? "bg-ok" : tone === "gap" ? "bg-gold" : "bg-accent";
  return <section className="border-t border-line pt-6"><h2 className="tech-label">{title}</h2><ul className="mt-3 space-y-2.5">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-relaxed text-muted"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />{item}</li>)}</ul></section>;
}

function formatMatchReport(result: MatchResult) {
  const section = (title: string, items: string[]) => items.length ? `\n${title}\n${items.map((item) => `- ${item}`).join("\n")}` : "";
  const projects = result.relevantProjects.map((project) => `- ${project.name}: ${project.evidence} (${project.portfolioUrl})`);

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
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<MatchResult>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [cvToken, setCvToken] = useState("");
  const [downloadingCv, setDownloadingCv] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Comparing portfolio evidence…");
  const submitting = useRef(false);

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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = jobDescription.trim();
    if (!value) return setError("Please paste a job description.");
    if (value.length < MIN_LENGTH) return setError(`Please provide at least ${MIN_LENGTH} characters for an accurate comparison.`);
    if (value.length > MAX_LENGTH) return setError(`Job descriptions must be ${MAX_LENGTH.toLocaleString()} characters or fewer.`);
    if (submitting.current) return;
    submitting.current = true; setLoading(true); setError(""); setResult(undefined); setCvToken(""); setLoadingMessage("Comparing portfolio evidence…");
    const controller = new AbortController();
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
      if (streamError) throw new Error(streamError);
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

  const clear = () => { setJobDescription(""); setResult(undefined); setError(""); setSummaryCopied(false); setCvToken(""); };

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
    const blob = new Blob([formatMatchReport(result)], { type: "text/plain;charset=utf-8" });
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

  return <>
    <PageMeta title={typeof section?.content.seoTitle === "string" ? section.content.seoTitle : section?.heading ?? ""} description={typeof section?.content.seoDescription === "string" ? section.content.seoDescription : section?.description ?? undefined} />
    <main className="min-h-screen pt-16">
      <section className="section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-accent/8 to-transparent" />
        <div className="container-x relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">AI-Powered</span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Job <span className="text-gradient">Match</span></h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">Paste a job description. I'll analyze it against my portfolio and tell you exactly how I fit.</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:items-start">
            <form onSubmit={submit} className="card p-5 sm:p-7">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><FiSearch /></span><div><h2 className="font-display text-lg font-bold text-ink">Job description</h2><p className="mt-1 text-sm text-muted">Include responsibilities, required skills, and experience level.</p></div></div>
              <label htmlFor="job-description" className="sr-only">Job description</label>
              <textarea id="job-description" className={`textarea bg-surface-2 border-line-strong mt-6 min-h-72 resize-y ${error ? "textarea-error" : ""}`} value={jobDescription} maxLength={MAX_LENGTH + 1} disabled={loading} onChange={(event) => { setJobDescription(event.target.value); if (error) setError(""); }} placeholder="Paste the job description here (minimum 80 characters)…" aria-describedby="job-help job-error" aria-invalid={Boolean(error)} />
              <div id="job-help" className="mt-2 flex justify-between gap-4 text-xs text-faint"><span>Minimum {MIN_LENGTH} characters</span><span className={jobDescription.length > MAX_LENGTH ? "text-danger" : ""}>{jobDescription.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}</span></div>
              {error && <div id="job-error" role="alert" className="mt-4 flex gap-2.5 rounded-lg border border-danger/25 bg-danger/8 p-3 text-sm leading-relaxed text-danger"><FiAlertCircle className="mt-0.5 shrink-0" />{error}</div>}
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" className="btn-ghost" onClick={clear} disabled={loading || (!jobDescription && !result)}><FiRefreshCw />Clear</button><button type="submit" className="btn-primary btn-lg" disabled={loading || jobDescription.length > MAX_LENGTH}>{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />Analyzing role…</> : <><FiZap />Check My Fit</>}</button></div>
            </form>

            <div aria-live="polite" aria-busy={loading}>
              {loading && <div className="card p-7"><div className="flex items-center gap-3 text-ink"><span className="font-semibold">{loadingMessage}</span></div><div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-3"><div className="job-scan h-full rounded-full bg-accent" role="progressbar" aria-label="Analysis progress" /></div><p className="mt-3 text-sm leading-relaxed text-muted">Reviewing public skills, projects, experience, education, and certifications.</p></div>}
              {!loading && !result && <div className="card border-dashed p-7"><span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-accent"><FiCheckCircle /></span><h2 className="mt-5 font-display text-lg font-bold text-ink">A recruiter-friendly result</h2><p className="mt-2 text-sm leading-relaxed text-muted">You’ll see supported strengths, relevant portfolio evidence, partial matches, and requirements that aren’t demonstrated.</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted"><span className="h-2 w-2 rounded-full bg-ok" />Grounded in live portfolio data</div></div>}
              {result && <article className="card overflow-hidden"><header className="border-b border-line bg-surface-2/60 p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><span className="tech-label">Match Report</span><span className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${matchBadge(result.matchLevel)}`}>{result.matchLevel}</span></div><p className="mt-4 text-sm leading-relaxed text-ink">{result.overallMatch}</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" className="btn-outline btn-sm" onClick={copySummary}>{summaryCopied ? <FiCheck /> : <FiCopy />}{summaryCopied ? "Summary Copied" : "Copy Executive Summary"}</button><button type="button" className="btn-ghost btn-sm" onClick={exportReport}><FiDownload />Export Report</button>{cvToken && <button type="button" className="btn-primary btn-sm" onClick={downloadTailoredCv} disabled={downloadingCv}><FiDownload />{downloadingCv ? "Generating CV…" : "Download Tailored CV"}</button>}</div></header><div className="space-y-6 p-5 sm:p-7"><ListSection title="Strong Matches" items={result.strongMatches} tone="good" /><ListSection title="Relevant Experience" items={result.relevantExperience} />{result.relevantProjects.length > 0 && <section className="border-t border-line pt-6"><h2 className="tech-label">Relevant Projects</h2><div className="mt-3 space-y-3">{result.relevantProjects.map((project) => <Link key={project.slug} to={project.portfolioUrl} className="group block rounded-xl border border-line bg-surface-2/60 p-4 transition-colors hover:border-accent/40"><span className="flex items-center justify-between gap-3 font-semibold text-ink group-hover:text-accent">{project.name}<FiArrowRight className="shrink-0" /></span><span className="mt-1.5 block text-sm leading-relaxed text-muted">{project.evidence}</span></Link>)}</div></section>}<ListSection title="Partial Matches" items={result.partialMatches} /><ListSection title="Gaps / Not Demonstrated" items={result.gaps} tone="gap" /><section className="border-t border-line pt-6"><h2 className="tech-label">Recruiter Summary</h2><p className="mt-3 rounded-xl border border-line bg-surface-2 p-4 text-sm leading-relaxed text-muted">{result.recruiterSummary}</p></section></div></article>}
            </div>
          </div>
        </div>
      </section>
    </main>
  </>;
}
