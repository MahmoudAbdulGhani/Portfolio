import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUp, FiCpu, FiExternalLink, FiMessageSquare, FiRefreshCw, FiX } from "react-icons/fi";
import { Link, matchPath, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { useProject } from "../lib/hooks";
import type { AssistantResponse } from "../types";

type Message = { id: number; role: "user" | "assistant"; text: string; failedQuestion?: string };

const generalSuggestions = [
  ["Recruiter overview", "Summarize Mahmoud for a recruiter."],
  ["Best projects", "What are Mahmoud's strongest projects?"],
  ["Technical skills", "What technologies and technical skills does Mahmoud know?"],
  ["Backend experience", "Tell me about Mahmoud's backend experience."],
  ["Full-stack experience", "Which project best demonstrates full-stack development?"],
  ["Download CV", "Where can I download Mahmoud's CV?"],
] as const;

function AssistantText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\((?:\/[^)]+|https?:\/\/[^)]+)\))/g);
  return (
    <div className="space-y-2 whitespace-pre-wrap">
      {parts.map((part, index) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!match) return <span key={index}>{part}</span>;
        const [, label, href] = match;
        const internal = /^\/projects\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(href);
        const safeExternal = /^https?:\/\//i.test(href) || href === "/api/cv.pdf";
        if (!internal && !safeExternal) return <span key={index}>{label}</span>;
        return internal ? (
          <Link key={index} to={href} className="font-semibold text-accent hover:text-accent-strong" onClick={(event) => event.stopPropagation()}>
            {label} <FiExternalLink className="inline" size={12} />
          </Link>
        ) : (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:text-accent-strong">
            {label} <FiExternalLink className="inline" size={12} />
          </a>
        );
      })}
    </div>
  );
}

export function PortfolioAssistant() {
  const { pathname } = useLocation();
  const projectSlug = matchPath("/projects/:slug", pathname)?.params.slug;
  const { data: project } = useProject(projectSlug ?? "", { enabled: Boolean(projectSlug) });
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);
  const submitting = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const suggestions = projectSlug
    ? [
        ["How was this built?", "How was this project built?"],
        ["Technologies used", "What technologies are used in this project?"],
        ["Key features", "What are this project's key technical features?"],
        ["Mahmoud's contribution", "What was Mahmoud's contribution to this project?"],
      ] as const
    : generalSuggestions;

  useEffect(() => () => requestController.current?.abort(), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ask(value: string) {
    const trimmed = value.trim();
    if (!trimmed || submitting.current) return;
    submitting.current = true;
    const controller = new AbortController();
    requestController.current = controller;
    setQuestion("");
    setLoading(true);
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text: trimmed }]);
    try {
      const result = await api<AssistantResponse>("/assistant", {
        method: "POST",
        body: JSON.stringify({ question: trimmed, ...(projectSlug ? { projectSlug } : {}) }),
        signal: controller.signal,
      });
      setMessages((current) => [...current, { id: nextId.current++, role: "assistant", text: result.answer }]);
    } catch (error) {
      if (controller.signal.aborted) return;
      const text = error instanceof Error ? error.message : "The assistant is temporarily unavailable.";
      setMessages((current) => [...current, { id: nextId.current++, role: "assistant", text, failedQuestion: trimmed }]);
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        submitting.current = false;
        setLoading(false);
      }
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void ask(question);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-modal="false"
            aria-label="Ask Mahmoud AI"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-2 bottom-[4.75rem] z-[70] flex max-h-[calc(100dvh-5.25rem)] min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl sm:inset-x-auto sm:bottom-20 sm:right-6 sm:max-h-[min(680px,calc(100dvh-6rem))] sm:w-[410px] sm:rounded-2xl"
          >
            <header className="flex items-center justify-between border-b border-line bg-surface-2/70 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white shadow-sm shadow-accent/30"><FiCpu size={17} /></span>
                <div className="min-w-0"><h2 className="truncate text-sm font-bold text-ink">{project ? `Ask about ${project.name}` : "Ask Mahmoud AI"}</h2><p className="truncate text-[11px] text-muted">{projectSlug ? "Project-aware portfolio assistant" : "Professional portfolio assistant"}</p></div>
              </div>
              <button type="button" className="btn-icon-sm text-muted hover:bg-surface-3 hover:text-ink" onClick={() => setOpen(false)} aria-label="Close assistant"><FiX /></button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.length === 0 && (
                <div>
                  <div className="rounded-xl border border-accent/15 bg-accent/5 p-3.5 text-sm leading-relaxed text-muted">
                    {project ? `Ask about ${project.name}, or about Mahmoud's wider skills and experience.` : "I can help you quickly evaluate Mahmoud's projects, skills, experience, and fit for a role."}
                  </div>
                  <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-faint">Suggested questions</p>
                  <div className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2">
                    {suggestions.map(([label, prompt], index) => (
                      <motion.button key={label} type="button" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index }} onClick={() => void ask(prompt)} className="rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-left text-xs font-semibold text-muted transition-colors hover:border-accent/40 hover:text-accent">
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {messages.map((message) => (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={message.role === "user" ? "ml-10 rounded-xl rounded-br-sm bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-white" : "mr-5 rounded-xl rounded-bl-sm border border-line bg-surface-2 px-3.5 py-2.5 text-sm leading-relaxed text-ink"}>
                    <AssistantText text={message.text} />
                    {message.failedQuestion && <button type="button" onClick={() => void ask(message.failedQuestion!)} disabled={loading} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent"><FiRefreshCw /> Retry</button>}
                  </motion.div>
                ))}
                {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-20 flex items-center gap-1.5 rounded-xl rounded-bl-sm border border-line bg-surface-2 px-3.5 py-3" aria-label="Assistant is thinking"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" /></motion.div>}
                <div ref={endRef} />
              </div>
            </div>

            <form onSubmit={submit} className="border-t border-line bg-surface p-3">
              <div className="flex items-end gap-2 rounded-xl border border-line bg-surface-2 p-2 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/10">
                <textarea ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value.slice(0, 600))} onKeyDown={onKeyDown} rows={1} placeholder={project ? `Ask about ${project.name}…` : "Ask about Mahmoud's experience…"} aria-label="Your question" className="min-h-9 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-faint sm:max-h-28" disabled={loading} />
                <button type="submit" disabled={loading || !question.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-white transition-all hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send question"><FiArrowUp /></button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-faint">Portfolio answers grounded in Mahmoud's published data</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close Ask Mahmoud AI" : "Open Ask Mahmoud AI"} className="fixed bottom-3 right-3 z-[70] inline-flex h-12 items-center gap-2 rounded-full bg-accent px-3.5 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-strong sm:bottom-4 sm:right-6 sm:px-4">
        {open ? <FiX size={17} /> : <FiMessageSquare size={17} />}
        <span className="max-[359px]:hidden">{open ? "Close" : "Ask Mahmoud AI"}</span>
      </motion.button>
    </>
  );
}
