import { useEffect, useMemo, useRef, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  FiArrowUp,
  FiArrowUpRight,
  FiMessageSquare,
  FiRefreshCw,
  FiSquare,
  FiX,
} from "react-icons/fi";
import { useProfile, useProject, useSiteSection } from "../../lib/hooks";
import { apiResponse } from "../../lib/api";
import {
  evidenceUrl,
  readAssistantResponse,
} from "../../lib/assistant-response";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
  error?: string;
  retry?: string;
};
const general = [
  ["Recruiter overview", "Summarize this portfolio for a recruiter."],
  ["Strongest projects", "What are the strongest projects in this portfolio?"],
  ["Technical skills", "What technical skills are demonstrated?"],
  ["Backend experience", "Describe the portfolio owner's backend experience."],
  [
    "Full-stack work",
    "Which project best demonstrates full-stack development?",
  ],
  ["Download CV", "Where can I download the CV?"],
];
const contextual = [
  ["How it was built", "How was this project built?"],
  ["Technologies", "What technologies are used in this project?"],
  ["Key features", "What are this project's key technical features?"],
  [
    "Contribution",
    "What was the portfolio owner's contribution to this project?",
  ],
];

export function LandscapeAssistant() {
  const location = useLocation();
  const projectSlug =
    matchPath("/projects/:slug", location.pathname)?.params.slug ||
    (location.pathname === "/"
      ? new URLSearchParams(location.search).get("project")
      : null);
  const context = projectSlug || "portfolio";
  const { data: project } = useProject(projectSlug || "", {
    enabled: Boolean(projectSlug),
  });
  const { data: profile } = useProfile();
  const { data: section } = useSiteSection("assistant");
  const [openContext, setOpenContext] = useState<string | null>(null);
  const open = openContext === context;
  const [conversations, setConversations] = useState<Record<string, Message[]>>(
    {},
  );
  const [question, setQuestion] = useState(""),
    [running, setRunning] = useState(false);
  const messages = useMemo(
    () => conversations[context] || [],
    [conversations, context],
  );
  const dialog = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLTextAreaElement>(null),
    log = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const controller = useRef<AbortController | null>(null),
    busy = useRef(false),
    sequence = useRef(0);
  const update = (key: string, change: (messages: Message[]) => Message[]) =>
    setConversations((all) => ({ ...all, [key]: change(all[key] || []) }));
  const close = () => {
    controller.current?.abort("stopped");
    setOpenContext(null);
  };
  useEffect(() => {
    const modal = dialog.current;
    if (open) {
      if (!modal?.open) modal?.showModal();
      input.current?.focus();
    } else if (modal?.open) {
      modal.close();
      trigger.current?.focus({ preventScroll: true });
    }
  }, [open]);
  useEffect(() => {
    const activate = () => setOpenContext(context);
    window.addEventListener("open-portfolio-assistant", activate);
    return () => {
      window.removeEventListener("open-portfolio-assistant", activate);
      controller.current?.abort("navigation");
    };
  }, [context]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, running]);
  const configured = Array.isArray(section?.content.prompts)
    ? section.content.prompts
        .filter((item): item is string => typeof item === "string")
        .map((prompt) => [prompt, prompt])
    : [];
  const suggestions = projectSlug
    ? contextual
    : configured.length
      ? configured
      : general;
  async function ask(value: string) {
    const text = value.trim();
    if (!text || text.length > 600 || busy.current) return;
    const key = context,
      request = new AbortController(),
      id = sequence.current++;
    controller.current = request;
    busy.current = true;
    setRunning(true);
    setQuestion("");
    update(key, (current) => [
      ...current,
      { id: id * 2, role: "user", text },
      { id: id * 2 + 1, role: "assistant", text: "", pending: true },
    ]);
    const timeout = window.setTimeout(() => request.abort("timeout"), 55000);
    try {
      const response = await apiResponse("/assistant", {
        method: "POST",
        headers: { Accept: "text/event-stream" },
        body: JSON.stringify({
          question: text,
          stream: true,
          ...(projectSlug ? { projectSlug } : {}),
        }),
        signal: request.signal,
      });
      const answer = await readAssistantResponse(response, (partial) =>
        update(key, (current) =>
          current.map((message) =>
            message.id === id * 2 + 1
              ? { ...message, text: partial, pending: false }
              : message,
          ),
        ),
      );
      update(key, (current) =>
        current.map((message) =>
          message.id === id * 2 + 1
            ? { ...message, text: answer, pending: false }
            : message,
        ),
      );
    } catch (error) {
      const stopped =
        request.signal.aborted && request.signal.reason !== "timeout";
      const reason = stopped
        ? "Generation stopped."
        : request.signal.aborted
          ? "The assistant took too long to respond. Please try again."
          : error instanceof Error
            ? error.message
            : "The assistant is temporarily unavailable.";
      update(key, (current) =>
        current.map((message) =>
          message.id === id * 2 + 1
            ? {
                ...message,
                pending: false,
                error: reason,
                retry: stopped ? undefined : text,
              }
            : message,
        ),
      );
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === request) {
        controller.current = null;
        busy.current = false;
        setRunning(false);
      }
    }
  }
  return (
    <>
      <button
        ref={trigger}
        className="assistant-launcher"
        aria-expanded={open}
        onClick={() => setOpenContext(context)}
        aria-label="Ask Portfolio AI"
      >
        <FiMessageSquare />
        Ask Portfolio AI
        <FiArrowUpRight />
      </button>
      <dialog
        ref={dialog}
        className="assistant-modal"
        aria-labelledby="assistant-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={() => setOpenContext(null)}
      >
        <section className="assistant-drawer">
          <header className="assistant-header">
            <div>
              <span className="eyebrow">PORTFOLIO / CONVERSATION</span>
              <h2 id="assistant-title">
                {project ? "Ask about the work." : "Ask Portfolio AI."}
              </h2>
            </div>
            <button
              className="assistant-close"
              onClick={close}
              aria-label="Close assistant"
            >
              <FiX size={23} />
            </button>
          </header>
          <div className="assistant-context">
            <FiMessageSquare />
            <span>{project?.name || "Projects, skills & experience"}</span>
          </div>
          <div ref={log} className="assistant-log" aria-busy={running}>
            {!messages.length && (
              <div className="assistant-welcome">
                <p>
                  {project
                    ? `Explore the engineering and contribution behind ${project.name}.`
                    : typeof section?.content.greeting === "string"
                      ? section.content.greeting
                      : "Find the work and experience relevant to what you are looking for."}
                </p>
                <span className="eyebrow">START WITH A QUESTION</span>
                <div className="assistant-suggestions">
                  {suggestions.map(([label, prompt], index) => (
                    <button
                      key={label}
                      disabled={running}
                      onClick={() => void ask(prompt)}
                    >
                      <span className="question-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{label}</span>
                      <FiArrowUpRight />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div
              className="assistant-messages"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`assistant-message ${message.role}${message.error ? " has-error" : ""}`}
                >
                  <span className="eyebrow">
                    {message.role === "user" ? "YOUR QUESTION" : "PORTFOLIO AI"}
                  </span>
                  {message.pending ? (
                    <p role="status">Reading the portfolio evidence…</p>
                  ) : (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h3>{children}</h3>,
                        h2: ({ children }) => <h3>{children}</h3>,
                        a: ({ href = "", children }) => {
                          const url = evidenceUrl(href);
                          if (!url) return <span>{children}</span>;
                          const portfolioOrigin = profile?.portfolioUrl
                            ? evidenceUrl(profile.portfolioUrl)?.origin
                            : window.location.origin;
                          if (
                            (url.origin === window.location.origin ||
                              url.origin === portfolioOrigin) &&
                            /^\/projects\/[a-z0-9-]+$/.test(url.pathname)
                          )
                            return (
                              <Link to={url.pathname} onClick={close}>
                                {children}
                                <FiArrowUpRight />
                              </Link>
                            );
                          return (
                            <a
                              href={url.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                              <FiArrowUpRight />
                            </a>
                          );
                        },
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  )}
                  {message.error && <p role="status">{message.error}</p>}
                  {message.retry && (
                    <button
                      className="text-link assistant-retry"
                      disabled={running}
                      onClick={() => void ask(message.retry!)}
                    >
                      <FiRefreshCw />
                      Try again
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <form
            className="assistant-form"
            onSubmit={(event) => {
              event.preventDefault();
              void ask(question);
            }}
          >
            <label className="sr-only" htmlFor="assistant-question">
              Your question
            </label>
            <div className="assistant-composer">
              <textarea
                ref={input}
                id="assistant-question"
                value={question}
                maxLength={600}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={
                  project
                    ? `Ask about ${project.name}…`
                    : "Ask about this portfolio…"
                }
                rows={2}
                disabled={running}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void ask(question);
                  }
                }}
              />
              {running ? (
                <button
                  type="button"
                  onClick={() => controller.current?.abort("stopped")}
                  aria-label="Stop generation"
                >
                  <FiSquare />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!question.trim()}
                  aria-label="Send question"
                >
                  <FiArrowUp />
                </button>
              )}
            </div>
            <div className="assistant-form-note">
              <span>Answers from published portfolio data</span>
              <span>{question.length} / 600</span>
            </div>
          </form>
        </section>
      </dialog>
    </>
  );
}
