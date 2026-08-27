import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
      aria-hidden
    >
      <motion.div
        className="h-full w-full origin-left bg-gradient-to-r from-accent via-accent-strong to-accent-2"
        style={{ scaleX }}
      />
    </div>
  );
}

