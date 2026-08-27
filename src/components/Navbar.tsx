import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiMenu, FiSearch, FiX } from "react-icons/fi";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Magnetic } from "./Magnetic";
import { cn } from "../lib/format";

const navItems = [
  { to: "/#hero", label: "Home", end: true },
  { to: "/projects", label: "Projects", end: false },
  { to: "/job-match", label: "Job Match", end: false },
  { to: "/contact", label: "Contact", end: false },
];

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMac] = useState(() => typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200",
      isActive ? "text-ink" : "text-muted hover:text-ink",
    );

  const handleNavClick = (to: string) => {
    setOpen(false);
    if (to === "/#hero" && location.pathname === "/") {
      requestAnimationFrame(() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: isMac, ctrlKey: !isMac }));
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-line bg-bg/85 shadow-sm shadow-black/[0.02] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="container-x relative flex h-16 items-center justify-between"
      >
        <Magnetic strength={0.15}>
          <Logo />
        </Magnetic>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => handleNavClick(item.to)}
              className={linkClass}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="active-public-nav"
                      className="absolute inset-x-4 bottom-0 h-[2px] rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search and quick commands (Ctrl+K or Cmd+K)"
              className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/80 px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink"
            >
              <FiSearch size={14} className="text-faint" />
              <span className="hidden lg:inline font-medium">Search</span>
              <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-faint">
                {isMac ? "⌘K" : "Ctrl+K"}
              </kbd>
            </button>
            <Magnetic strength={0.2}>
              <Link to="/contact" className="btn-outline btn-sm">
                Hire Me
                <FiArrowRight size={14} />
              </Link>
            </Magnetic>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search and quick commands"
            className="btn-icon border border-line bg-surface text-ink"
          >
            <FiSearch size={17} />
          </button>
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="btn-icon border border-line bg-surface text-ink"
          >
            {open ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </nav>

      {(scrolled || open) && (
        <div
          className="dimension-line pointer-events-none absolute inset-x-0 bottom-0 h-px"
          aria-hidden
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => handleNavClick(item.to)}
                    className={({ isActive }) => cn("flex items-center justify-between rounded-lg px-4 py-3 text-[15px] font-semibold transition-colors", isActive ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink")}
                  >
                    {item.label}
                    {item.to === "/contact" ? null : <FiArrowRight size={14} className="text-faint" aria-hidden />}
                  </NavLink>
                </motion.div>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="btn-outline mt-2"
              >
                Hire Me
                <FiArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
