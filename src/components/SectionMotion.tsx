import { useId, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { useLandingMotion } from "../lib/landing-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function MaskedReveal({ children }: { children: ReactNode }) {
  const { enabled } = useLandingMotion();
  const mask = useRef<HTMLSpanElement>(null);
  const visible = useInView(mask, { once: true, amount: 0.35 });
  return <span ref={mask} className="cinema-text-mask"><motion.span initial={enabled ? { x: "-103%" } : false} animate={{ x: !enabled || visible ? 0 : "-103%" }} transition={{ duration: enabled ? 1.05 : 0, ease }}>{children}</motion.span></span>;
}

export function CourseDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { enabled } = useLandingMotion();
  return <div className="cinema-course">
    <button type="button" id={`${id}-trigger`} className="cinema-course-trigger" aria-expanded={open} aria-controls={`${id}-content`} onClick={() => setOpen(value => !value)}><span>{title}</span><motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: enabled ? 0.35 : 0 }}><FiArrowUpRight aria-hidden /></motion.span></button>
    <motion.div id={`${id}-content`} role="region" aria-labelledby={`${id}-trigger`} aria-hidden={!open} inert={!open} className="cinema-disclosure-content" initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: enabled ? 0.4 : 0, ease }}>{children}</motion.div>
  </div>;
}
