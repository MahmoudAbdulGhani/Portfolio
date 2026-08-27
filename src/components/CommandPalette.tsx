import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiCopy,
  FiCornerDownLeft,
  FiCpu,
  FiFileText,
  FiFolder,
  FiGithub,
  FiHome,
  FiLinkedin,
  FiMail,
  FiMessageCircle,
  FiMoon,
  FiPhone,
  FiSearch,
  FiSun,
  FiTerminal,
  FiX,
} from "react-icons/fi";
import { useProfile, useProjects } from "../lib/hooks";
import { useTheme } from "../lib/theme";
import { API_BASE } from "../lib/api";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  category: "Navigation" | "Projects" | "Actions" | "Socials";
  icon: React.ComponentType<{ className?: string; size?: number }>;
  shortcut?: string;
  perform: () => void;
  keywords?: string[];
};

export function CommandPalette({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { data: profile } = useProfile();
  const { data: projects } = useProjects();

  const openPalette = useCallback(() => {
    setSearch("");
    setSelectedIndex(0);
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
  }, []);

  const togglePalette = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        setSearch("");
        setSelectedIndex(0);
        return true;
      }
      return false;
    });
  }, []);

  // Global shortcut listener: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInput =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        togglePalette();
      } else if (event.key === "/" && !isInput && !open) {
        event.preventDefault();
        openPalette();
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        closePalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, openPalette, closePalette, togglePalette]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  // Lock scroll when open
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId(null);
      setOpen(false);
    }, 900);
  };

  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // Navigation
      {
        id: "nav-home",
        label: "Home",
        description: "Return to the main overview",
        category: "Navigation",
        icon: FiHome,
        perform: () => {
          navigate("/");
          setOpen(false);
        },
        keywords: ["home", "main", "start", "landing"],
      },
      {
        id: "nav-projects",
        label: "All Projects",
        description: "Explore case studies and live demos",
        category: "Navigation",
        icon: FiFolder,
        perform: () => {
          navigate("/projects");
          setOpen(false);
        },
        keywords: ["work", "apps", "portfolio", "code", "showcase"],
      },
      {
        id: "nav-terminal",
        label: "Developer Terminal",
        description: "Interactive CLI shell emulator",
        category: "Navigation",
        icon: FiTerminal,
        perform: () => {
          navigate("/terminal");
          setOpen(false);
        },
        keywords: ["terminal", "cli", "shell", "console", "command", "zsh", "bash"],
      },
      {
        id: "nav-job-match",
        label: "AI Job Match",
        description: "Scan a job description against portfolio evidence",
        category: "Navigation",
        icon: FiCpu,
        perform: () => {
          navigate("/job-match");
          setOpen(false);
        },
        keywords: ["match", "ai", "recruiter", "skills", "fit", "compare"],
      },
      {
        id: "nav-contact",
        label: "Contact",
        description: "Get in touch directly or send a message",
        category: "Navigation",
        icon: FiMail,
        perform: () => {
          navigate("/contact");
          setOpen(false);
        },
        keywords: ["message", "hire", "email", "reach"],
      },
      {
        id: "nav-cv",
        label: "View CV",
        description: "Interactive online curriculum vitae",
        category: "Navigation",
        icon: FiFileText,
        perform: () => {
          navigate("/cv");
          setOpen(false);
        },
        keywords: ["resume", "cv", "experience", "education"],
      },
    ];

    // Projects
    if (projects) {
      for (const project of projects.filter((p) => p.published)) {
        items.push({
          id: `project-${project.slug}`,
          label: project.name,
          description: project.tagline || project.type,
          category: "Projects",
          icon: FiBriefcase,
          perform: () => {
            navigate(`/projects/${project.slug}`);
            setOpen(false);
          },
          keywords: [
            project.name.toLowerCase(),
            project.type.toLowerCase(),
            ...(project.stack || []).map((s) => s.toLowerCase()),
          ],
        });
      }
    }

    // Actions
    items.push({
      id: "act-theme",
      label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      description: "Toggle portfolio appearance theme",
      category: "Actions",
      icon: theme === "dark" ? FiSun : FiMoon,
      shortcut: "T",
      perform: () => {
        toggleTheme();
        setOpen(false);
      },
      keywords: ["theme", "dark", "light", "mode", "color"],
    });

    items.push({
      id: "act-assistant",
      label: "Ask Portfolio AI",
      description: "Chat with the grounded AI assistant",
      category: "Actions",
      icon: FiCpu,
      perform: () => {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("open-portfolio-assistant"));
      },
      keywords: ["ai", "assistant", "chat", "ask", "question", "bot"],
    });

    if (profile?.email) {
      items.push({
        id: "act-copy-email",
        label: copiedId === "act-copy-email" ? "Email Copied!" : "Copy Email",
        description: profile.email,
        category: "Actions",
        icon: copiedId === "act-copy-email" ? FiCheck : FiCopy,
        perform: () => copyToClipboard("act-copy-email", profile.email),
        keywords: ["email", "copy", "mail", "contact"],
      });
    }

    if (profile?.phone) {
      items.push({
        id: "act-copy-phone",
        label: copiedId === "act-copy-phone" ? "Phone Copied!" : "Copy Phone",
        description: profile.phone,
        category: "Actions",
        icon: copiedId === "act-copy-phone" ? FiCheck : FiPhone,
        perform: () => copyToClipboard("act-copy-phone", profile.phone),
        keywords: ["phone", "call", "whatsapp", "number"],
      });
    }

    const cvUrl = profile?.resumeUrl || `${API_BASE}/cv.pdf`;
    items.push({
      id: "act-download-cv",
      label: "Download CV (PDF)",
      description: "ATS-friendly standard PDF resume",
      category: "Actions",
      icon: FiFileText,
      perform: () => {
        window.open(cvUrl, "_blank", "noopener,noreferrer");
        setOpen(false);
      },
      keywords: ["download", "pdf", "cv", "resume"],
    });

    // Socials
    if (profile?.socials) {
      for (const social of profile.socials.filter((s) => s.published !== false)) {
        const platform = (social.platform || "link").toLowerCase();
        const iconMap: Record<string, typeof FiGithub> = {
          github: FiGithub,
          linkedin: FiLinkedin,
          whatsapp: FiMessageCircle,
        };
        const IconComponent = iconMap[platform] || FiArrowRight;

        items.push({
          id: `social-${social.id}`,
          label: social.label,
          description: social.username || social.url,
          category: "Socials",
          icon: IconComponent,
          perform: () => {
            window.open(social.url, "_blank", "noopener,noreferrer");
            setOpen(false);
          },
          keywords: [social.label.toLowerCase(), platform, "social", "profile"],
        });
      }
    }

    return items;
  }, [navigate, theme, toggleTheme, profile, projects, copiedId]);

  // Filter commands by search
  const filteredCommands = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return commands;

    return commands.filter((cmd) => {
      if (cmd.label.toLowerCase().includes(query)) return true;
      if (cmd.description?.toLowerCase().includes(query)) return true;
      if (cmd.keywords?.some((k) => k.includes(query))) return true;
      return false;
    });
  }, [commands, search]);

  // Keyboard navigation inside list
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.perform();
      }
    }
  };

  // Keep selected item in view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Group commands by category for display
  const groupedCategories = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const cmd of filteredCommands) {
      const group = map.get(cmd.category) || [];
      group.push(cmd);
      map.set(cmd.category, group);
    }
    return Array.from(map.entries());
  }, [filteredCommands]);

  let globalIndexCounter = -1;

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh] sm:p-6 sm:pt-[15vh]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden
            />

            {/* Modal Dialog */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command Palette"
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
            >
              {/* Header Search Input */}
              <div className="relative flex items-center border-b border-line px-4 py-3 sm:px-5">
                <FiSearch className="mr-3 shrink-0 text-muted" size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search projects…"
                  className="w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close command palette"
                  className="ml-2 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Command List */}
              <div
                ref={listRef}
                className="max-h-[50vh] overflow-y-auto p-2 sm:max-h-[60vh]"
                role="listbox"
              >
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted">
                    No results found for &ldquo;<span className="text-ink">{search}</span>&rdquo;
                  </div>
                ) : (
                  groupedCategories.map(([category, items]) => (
                    <div key={category} className="mb-2 last:mb-0">
                      <div className="px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-faint">
                        {category}
                      </div>
                      <div className="space-y-0.5">
                        {items.map((cmd) => {
                          globalIndexCounter++;
                          const isSelected = globalIndexCounter === selectedIndex;
                          const itemIndex = globalIndexCounter;
                          const IconComponent = cmd.icon;

                          return (
                            <button
                              key={cmd.id}
                              data-index={itemIndex}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              onClick={cmd.perform}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                                isSelected
                                  ? "bg-accent text-white"
                                  : "text-ink hover:bg-surface-2"
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : "border border-line bg-surface-2 text-muted"
                                  }`}
                                >
                                  <IconComponent size={15} />
                                </span>
                                <div className="min-w-0">
                                  <div className="truncate font-semibold">{cmd.label}</div>
                                  {cmd.description && (
                                    <div
                                      className={`truncate text-xs ${
                                        isSelected ? "text-white/80" : "text-muted"
                                      }`}
                                    >
                                      {cmd.description}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="ml-3 flex shrink-0 items-center gap-2 font-mono text-[11px]">
                                {cmd.shortcut && (
                                  <kbd
                                    className={`rounded px-1.5 py-0.5 uppercase ${
                                      isSelected
                                        ? "bg-white/20 text-white"
                                        : "border border-line bg-surface-2 text-faint"
                                    }`}
                                  >
                                    {cmd.shortcut}
                                  </kbd>
                                )}
                                {isSelected && (
                                  <span className="flex items-center gap-1 opacity-80">
                                    <span>Select</span>
                                    <FiCornerDownLeft size={12} />
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer navigation hints */}
              <div className="flex items-center justify-between border-t border-line bg-surface-2/60 px-4 py-2.5 font-mono text-[11px] text-faint">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-sans">↑</kbd>
                    <kbd className="rounded border border-line bg-surface px-1 py-0.5 font-sans">↓</kbd>
                    <span>to navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-line bg-surface px-1.5 py-0.5">↵</kbd>
                    <span>to select</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-line bg-surface px-1.5 py-0.5">ESC</kbd>
                  <span>to close</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
