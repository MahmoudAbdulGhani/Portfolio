import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiExternalLink, FiMaximize2, FiMinimize2, FiTerminal, FiX } from "react-icons/fi";
import { useProfile, useProjects, useSkills, useTechnologies } from "../lib/hooks";
import { useTheme } from "../lib/theme";

interface TerminalProps {
  onClose?: () => void;
  isModal?: boolean;
}

type OutputLine = {
  id: string;
  command?: string;
  content: ReactNode;
  timestamp: string;
};

const COMMANDS = [
  "help",
  "whoami",
  "bio",
  "skills",
  "projects",
  "experience",
  "contact",
  "theme",
  "sudo hire",
  "clear",
  "exit",
];

export function Terminal({ onClose, isModal = false }: TerminalProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { data: profile } = useProfile();
  const { data: projects } = useProjects();
  const { data: skills } = useSkills();
  const { data: technologies } = useTechnologies();

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isMaximized, setIsMaximized] = useState(false);

  const [lines, setLines] = useState<OutputLine[]>(() => [
    {
      id: "welcome",
      timestamp: new Date().toLocaleTimeString(),
      content: (
        <div className="space-y-2 text-muted">
          <div className="text-accent font-semibold">
            Mahmoud Hussein Abdul Ghani — Interactive CLI Shell [v2.4.0]
          </div>
          <div>
            Type <span className="font-bold text-ink underline">help</span> to list available commands. Press <kbd className="rounded border border-line bg-surface px-1 py-0.5 text-xs text-ink">Tab</kbd> for auto-completion.
          </div>
        </div>
      ),
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  // Focus input on mount or click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    // Add to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const [cmd, ...args] = trimmed.split(/\s+/);
    const commandName = cmd.toLowerCase();
    const subArg = args.join(" ").toLowerCase();

    let outputContent: ReactNode = null;

    switch (commandName) {
      case "help":
        outputContent = (
          <div className="space-y-1.5 py-1">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Available Commands</div>
            <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[140px_1fr]">
              <span className="font-bold text-accent">whoami / bio</span>
              <span className="text-muted">Display developer overview and background</span>
              
              <span className="font-bold text-accent">skills</span>
              <span className="text-muted">List technical stack and expertise</span>
              
              <span className="font-bold text-accent">projects</span>
              <span className="text-muted">List portfolio projects with links</span>
              
              <span className="font-bold text-accent">experience</span>
              <span className="text-muted">View professional experience timeline</span>
              
              <span className="font-bold text-accent">contact</span>
              <span className="text-muted">Display email, phone, and social links</span>
              
              <span className="font-bold text-accent">theme [dark|light]</span>
              <span className="text-muted">Change appearance theme</span>
              
              <span className="font-bold text-accent">sudo hire</span>
              <span className="text-muted">Direct interview and recruitment shortcut</span>
              
              <span className="font-bold text-accent">clear</span>
              <span className="text-muted">Clear terminal screen</span>
            </div>
          </div>
        );
        break;

      case "whoami":
      case "bio":
        outputContent = profile ? (
          <div className="space-y-2 py-1">
            <div className="text-base font-bold text-ink">{profile.name}</div>
            <div className="font-medium text-accent">{profile.title}</div>
            <div className="text-sm leading-relaxed text-muted">{profile.bio}</div>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs text-faint">
              <span>📍 {profile.location}</span>
              <span>·</span>
              <span>💼 {profile.availabilityText || "Open to opportunities"}</span>
              {profile.languages && (
                <>
                  <span>·</span>
                  <span>🌐 {profile.languages}</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div>Profile data loading…</div>
        );
        break;

      case "skills":
        outputContent = (
          <div className="space-y-3 py-1">
            {technologies && technologies.length > 0 && (
              <div>
                <div className="font-bold text-ink">Core Technologies</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {technologies.map((t) => (
                    <span key={t.id} className="chip">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills && skills.length > 0 && (
              <div>
                <div className="font-bold text-ink">Skills & Competencies</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s.id} className="chip border-accent/20 text-accent">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        break;

      case "projects":
        if (subArg) {
          const matched = projects?.find(
            (p) => p.slug.toLowerCase() === subArg || p.name.toLowerCase().includes(subArg)
          );
          if (matched) {
            outputContent = (
              <div className="space-y-2 rounded-lg border border-line bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{matched.name}</span>
                  <Link to={`/projects/${matched.slug}`} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                    View Project <FiExternalLink size={12} />
                  </Link>
                </div>
                <p className="text-xs text-muted">{matched.tagline || matched.overview}</p>
                <div className="flex flex-wrap gap-1">
                  {matched.stack.map((s) => (
                    <span key={s} className="chip text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          } else {
            outputContent = <div className="text-danger">Project &lsquo;{subArg}&rsquo; not found. Type &lsquo;projects&rsquo; to see all.</div>;
          }
        } else {
          outputContent = (
            <div className="space-y-2 py-1">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">
                Portfolio Projects ({projects?.filter((p) => p.published).length ?? 0})
              </div>
              <div className="space-y-1.5">
                {(projects ?? [])
                  .filter((p) => p.published)
                  .map((p) => (
                    <div key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/40 pb-1 text-sm">
                      <Link to={`/projects/${p.slug}`} className="font-bold text-accent hover:underline">
                        {p.name}
                      </Link>
                      <span className="text-xs text-muted">{p.type}</span>
                      <span className="w-full text-xs text-faint">{p.stack.slice(0, 4).join(" · ")}</span>
                    </div>
                  ))}
              </div>
              <div className="text-[11px] text-faint">
                Tip: Type <span className="text-ink font-semibold">projects &lt;name&gt;</span> to inspect a specific project.
              </div>
            </div>
          );
        }
        break;

      case "experience":
        outputContent = profile?.experience && profile.experience.length > 0 ? (
          <div className="space-y-3 py-1">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Work History & Experience</div>
            <div className="space-y-2.5">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="rounded-lg border border-line bg-surface-2 p-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-ink">{exp.role || exp.milestone}</span>
                    <span className="font-mono text-xs text-faint">{exp.meta}</span>
                  </div>
                  <div className="text-xs font-medium text-accent">{exp.company || exp.facility}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{exp.description || exp.details}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>No experience entries found.</div>
        );
        break;

      case "contact":
        outputContent = profile ? (
          <div className="space-y-2 py-1">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Get In Touch</div>
            <div className="space-y-1 text-sm">
              <div>
                📧 Email: <a href={`mailto:${profile.email}`} className="text-accent hover:underline">{profile.email}</a>
              </div>
              <div>
                📱 Phone: <a href={`tel:${profile.phone}`} className="text-accent hover:underline">{profile.phone}</a>
              </div>
              {profile.socials?.map((s) => (
                <div key={s.id}>
                  🔗 {s.label}: <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{s.url}</a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>Contact information loading…</div>
        );
        break;

      case "theme":
        if (subArg === "dark" || subArg === "light") {
          setTheme(subArg);
          outputContent = <div className="text-ok">Theme set to {subArg} mode.</div>;
        } else {
          outputContent = (
            <div>
              Current theme: <span className="font-bold text-ink">{theme}</span>. Usage: <span className="font-mono text-accent">theme [dark|light]</span>
            </div>
          );
        }
        break;

      case "sudo":
        if (args[0]?.toLowerCase() === "hire") {
          outputContent = (
            <div className="space-y-2 rounded-xl border border-ok/30 bg-ok/10 p-3.5 text-ink">
              <div className="flex items-center gap-2 font-bold text-ok">
                <span>⚡ ACCESS GRANTED: PRIORITY RECRUITMENT PATHWAY</span>
              </div>
              <p className="text-xs leading-relaxed text-muted">
                Thank you for considering Mahmoud Abdul Ghani for your engineering team. Let&rsquo;s build remarkable software together.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="btn-primary btn-sm"
                >
                  Proceed to Direct Contact Form →
                </button>
              </div>
            </div>
          );
        } else {
          outputContent = <div className="text-danger">Permission denied: user is not in sudoers file. Try &lsquo;sudo hire&rsquo;.</div>;
        }
        break;

      case "clear":
        setLines([]);
        setInput("");
        return;

      case "exit":
        if (onClose) {
          onClose();
          return;
        }
        navigate("/");
        return;

      default:
        outputContent = (
          <div className="text-danger">
            Command not recognized: &lsquo;{cmd}&rsquo;. Type <span className="text-ink underline">help</span> for a list of valid commands.
          </div>
        );
    }

    setLines((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}-${Math.random()}`,
        command: trimmed,
        content: outputContent,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setInput("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(history[nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx] || "");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = input.trim().toLowerCase();
      if (!current) return;
      const match = COMMANDS.find((c) => c.startsWith(current));
      if (match) {
        setInput(match);
      }
    }
  };

  return (
    <div
      onClick={handleTerminalClick}
      className={`flex flex-col font-mono text-xs transition-all duration-300 sm:text-sm ${
        isModal
          ? "h-full w-full"
          : isMaximized
          ? "fixed inset-0 z-50 rounded-none bg-surface"
          : "mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line bg-surface-2/80 px-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-danger/80" />
          <span className="h-3 w-3 rounded-full bg-gold/80" />
          <span className="h-3 w-3 rounded-full bg-ok/80" />
          <span className="ml-2 flex items-center gap-1.5 font-bold text-ink">
            <FiTerminal size={14} className="text-accent" />
            <span>mahmoud@portfolio:~</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!isModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMaximized((v) => !v);
              }}
              className="rounded p-1 text-muted hover:bg-surface-3 hover:text-ink"
              aria-label={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded p-1 text-muted hover:bg-surface-3 hover:text-ink"
              aria-label="Close terminal"
            >
              <FiX size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Output Console Buffer */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6"
        style={{ minHeight: isModal ? "300px" : isMaximized ? "calc(100vh - 90px)" : "420px", maxHeight: isMaximized ? "calc(100vh - 90px)" : "580px" }}
      >
        {lines.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2 text-faint">
                <span className="text-accent font-bold">➜</span>
                <span className="text-muted font-bold">~</span>
                <span className="font-semibold text-ink">{item.command}</span>
              </div>
            )}
            <div className="pl-4">{item.content}</div>
          </div>
        ))}

        {/* Active Command Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <span className="text-accent font-bold">➜</span>
          <span className="text-muted font-bold">~</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-ink outline-none placeholder:text-faint"
            placeholder="type command (e.g. help)…"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
        </form>
      </div>

      {/* Terminal Footer Bar */}
      <div className="flex items-center justify-between border-t border-line bg-surface-2/60 px-4 py-2 font-mono text-[11px] text-faint">
        <div className="flex items-center gap-3">
          <span>Shell: zsh (simulated)</span>
          <span>·</span>
          <span>Type &lsquo;help&rsquo;</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="rounded border border-line bg-surface px-1 py-0.5">Tab</kbd>
          <span>Auto-complete</span>
        </div>
      </div>
    </div>
  );
}
