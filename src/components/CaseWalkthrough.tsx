import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { CaseScreenshot } from './CaseScreenshot';
import type { DetailScreen } from '../lib/project-detail-screens';

export function CaseWalkthrough({ screens, projectName, onOpen }: { screens: DetailScreen[]; projectName: string; onOpen: (src: string) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const steps = root.current?.querySelectorAll<HTMLElement>('[data-screen-step]');
    if (!steps?.length) return;
    const visible = new Map<number, number>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(Number((entry.target as HTMLElement).dataset.screenStep), entry.isIntersecting ? entry.intersectionRatio : 0));
      const best = [...visible].sort((a, b) => b[1] - a[1])[0];
      if (best?.[1]) setSelected(best[0]);
    }, { rootMargin: '-20% 0px -35% 0px', threshold: [0, .25, .5, 1] });
    steps.forEach(step => observer.observe(step));
    return () => observer.disconnect();
  }, [screens]);
  if (!screens.length) return null;
  const screen = screens[selected] ?? screens[0];
  return <div ref={root} className="case-walkthrough">
    <div className="case-walkthrough-visual"><AnimatePresence mode="wait" initial={false}><motion.div key={screen.src} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}><CaseScreenshot key={screen.src} screen={screen} projectName={projectName} onOpen={onOpen} /></motion.div></AnimatePresence></div>
    <ol className="case-walkthrough-steps" aria-label="Product screens">{screens.map((item, index) => <li key={item.src} data-screen-step={index} className={selected === index ? 'is-active' : ''}>
      <span className="case-step-number">{String(index + 1).padStart(2, '0')}</span><h3>{item.label}</h3>
      <button type="button" aria-current={selected === index ? 'step' : undefined} onFocus={() => setSelected(index)} onClick={() => { setSelected(index); onOpen(item.src); }}>Inspect this screen<FiArrowUpRight /></button>
      <div className="case-walkthrough-mobile"><CaseScreenshot screen={item} projectName={projectName} onOpen={onOpen} /></div>
    </li>)}</ol>
  </div>;
}
