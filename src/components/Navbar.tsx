import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import { useProfile, useSiteSection } from "../lib/hooks";
import { API_BASE } from "../lib/api";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { CvDownloadButton } from "./CvDownloadButton";

export function Navbar() {
  const { pathname, hash } = useLocation();
  const { data: profile } = useProfile();
  const { data: jobMatch } = useSiteSection("jobMatch");
  const { data: about } = useSiteSection("about");
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const links = [
    { to: "/", label: "Home", active: pathname === "/" && hash !== "#about" },
    ...(about?.visible === false ? [] : [{ to: "/#about", label: "About", active: pathname === "/" && hash === "#about" }]),
    { to: "/projects", label: "Projects", active: pathname === "/projects" || pathname.startsWith("/projects/") },
    ...(jobMatch?.visible === false ? [] : [{ to: "/job-match", label: "AI Job Match", active: pathname === "/job-match" }]),
    { to: "/contact", label: "Contact", active: pathname === "/contact" },
  ];
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    const menuTrigger = trigger.current;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key !== "Tab") return;
      const elements = [...(menu.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? [])];
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const media = window.matchMedia("(min-width: 1120px)");
    const resize = () => { if (media.matches) setOpen(false); };
    window.addEventListener("keydown", onKey); media.addEventListener("change", resize);
    requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>("button")?.focus());
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); media.removeEventListener("change", resize); menuTrigger?.focus(); };
  }, [open]);
  const search = () => {
    setOpen(false);
    requestAnimationFrame(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true })));
  };
  const cv = profile?.resumeUrl || `${API_BASE}/cv.pdf`;
  return <header className="public-header">
    <nav aria-label="Main" className="public-header-inner" inert={open}>
      <Logo />
      <div className="public-nav-links">{links.map(link => <Link key={link.to} to={link.to} aria-current={link.active ? "page" : undefined}>{link.label}</Link>)}</div>
      <div className="public-nav-utilities">
        <button type="button" className="public-search" onClick={search} aria-label="Search and quick commands (Ctrl+K or Cmd+K)"><FiSearch aria-hidden /><span>Search…</span></button>
        <div className="public-desktop-theme"><ThemeToggle /></div>
        <div className="public-desktop-cv"><CvDownloadButton url={cv} className="public-cv" /></div>
        <button ref={trigger} type="button" className="public-menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="public-mobile-nav" onClick={() => setOpen(value => !value)}>{open ? <FiX /> : <FiMenu />}</button>
      </div>
    </nav>
    {open && <div ref={menu} id="public-mobile-nav" className="public-mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button type="button" className="public-menu-close" onClick={() => setOpen(false)} aria-label="Close navigation menu"><FiX />Close menu</button>
      <nav aria-label="Mobile main">{links.map(link => <Link key={link.to} to={link.to} aria-current={link.active ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}</nav>
      <div className="public-mobile-utilities"><CvDownloadButton url={cv} className="public-cv" /><ThemeToggle /></div>
    </div>}
  </header>;
}
