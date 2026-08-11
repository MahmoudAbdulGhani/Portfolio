import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  variant?: "rise" | "scale" | "clip";
  className?: string;
}

export function Reveal({ children, delay = 0, y = 22, variant = "rise", className }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const initial = variant === "scale"
    ? { opacity: 0, scale: 0.97, y: 10 }
    : variant === "clip"
      ? { opacity: 0, y: 14, clipPath: "inset(0 0 100% 0 round 12px)" }
      : { opacity: 0, y };
  const visible = variant === "clip"
    ? { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0 round 12px)" }
    : { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.div
      initial={reduceMotion ? false : initial}
      whileInView={visible}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduceMotion ? { duration: 0 } : {
        duration: variant === "clip" ? 0.56 : variant === "scale" ? 0.44 : 0.48,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
