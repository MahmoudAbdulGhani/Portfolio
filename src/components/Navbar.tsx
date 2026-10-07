import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiSearch, FiX, FiArrowRight } from "react-icons/fi";
import { useProfile, useSiteSection } from "../lib/hooks";
import { API_BASE } from "../lib/api";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { presentationContent, contentText } from "../lib/presentation-content";
import { CvDownloadButton } from "./CvDownloadButton";

function MenuPanel({ children, menuRef }: { children: ReactNode; menuRef: RefObject<HTMLDivElement | null> }) {
  const present = useIsPresent(), reduced = useReducedMotion();
  return <motion.div ref={menuRef} id="public-mobile-nav" className="public-mobile-nav" role="dialog" aria-modal={present} aria-hidden={!present} inert={!present} aria-label="Navigation menu" initial={reduced ? false : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: reduced ? 0 : present ? 0.28 : 0.18, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function Navbar() {
  const { pathname, hash } = useLocation();
  const { data: profile } = useProfile();
  const { data: jobMatch } = useSiteSection("jobMatch");
  const { data: about } = useSiteSection("about");
  const { data: contact } = useSiteSection("contact");
  const clientContent = presentationContent("contact", contact?.content);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const links = [
    { to: "/projects", label: "Work", active: pathname === "/projects" || pathname.startsWith("/projects/") || (pathname === "/" && hash === "#projects") },
    ...(about?.visible === false ? [] : [{ to: "/#about", label: "About", active: pathname === "/" && hash === "#about" }]),
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
  useEffect(() => {
    const close = (event: MouseEvent | KeyboardEvent) => {
      const disclosure = document.querySelector<HTMLDetailsElement>('.public-hiring-menu');
      if (!disclosure?.open) return;
      if (event instanceof KeyboardEvent && event.key === 'Escape') { disclosure.open = false; disclosure.querySelector('summary')?.focus(); }
      if (event instanceof MouseEvent && !disclosure.contains(event.target as Node)) disclosure.open = false;
    };
    document.addEventListener('click', close); document.addEventListener('keydown', close);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', close); };
  }, []);
  const cv = profile?.resumeUrl || `${API_BASE}/cv.pdf`;
  return <header className="public-header">
    <nav aria-label="Main" className="public-header-inner" inert={open}>
      <Logo />
      <div className="public-nav-links">{links.map(link => <Link key={link.to} to={link.to} aria-current={link.active ? "page" : undefined}>{link.label}</Link>)}</div>
      <div className="public-nav-utilities">
        <button type="button" className="public-search" onClick={search} aria-label="Search and quick commands (Ctrl+K or Cmd+K)"><FiSearch aria-hidden /><span>Search…</span></button>
        <div className="public-desktop-theme"><ThemeToggle /></div>
        <Link to="/contact?intent=project" className="public-project-cta">{contentText(clientContent, "projectCtaLabel")}<FiArrowRight aria-hidden /></Link><details className="public-hiring-menu"><summary>For hiring<FiArrowRight aria-hidden /></summary><div><CvDownloadButton url={cv} className="public-cv" />{jobMatch?.visible !== false && <Link to="/job-match" aria-current={pathname === "/job-match" ? "page" : undefined}>AI Job Match</Link>}</div></details>
        <button ref={trigger} type="button" className="public-menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="public-mobile-nav" onClick={() => setOpen(value => !value)}>{open ? <FiX /> : <FiMenu />}</button>
      </div>
    </nav>
    <AnimatePresence>{open && <MenuPanel key="mobile-menu" menuRef={menu}>
      <button type="button" className="public-menu-close" onClick={() => setOpen(false)} aria-label="Close navigation menu"><FiX />Close menu</button>
      <nav aria-label="Mobile main">{links.map((link, index) => <motion.div key={link.to} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.25, delay: reduced ? 0 : 0.06 + index * 0.04 }}><Link to={link.to} aria-current={link.active ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link></motion.div>)}</nav>
      <Link className="public-mobile-project" to="/contact?intent=project" onClick={() => setOpen(false)}>{contentText(clientContent, "projectCtaLabel")}<FiArrowRight aria-hidden /></Link><div className="public-mobile-utilities">{jobMatch?.visible !== false && <Link to="/job-match" onClick={() => setOpen(false)}>AI Job Match</Link>}<CvDownloadButton url={cv} className="public-cv" /><ThemeToggle /></div>
    </MenuPanel>}</AnimatePresence>
  </header>;
}
