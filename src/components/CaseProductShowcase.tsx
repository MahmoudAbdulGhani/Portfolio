import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ResponsiveProjectImage } from './ResponsiveProjectImage';
import { CaseScreenshot } from './CaseScreenshot';
import type { DetailScreen } from '../lib/project-detail-screens';

export function CaseProductShowcase({ screens, projectName, onOpen }: { screens: DetailScreen[]; projectName: string; onOpen: (src: string) => void }) {
  const [selected, setSelected] = useState(() => window.matchMedia('(max-width: 760px)').matches
    ? Math.max(0, screens.findIndex(screen => screen.viewport === 'phone')) : 0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const reduced = useReducedMotion();
  useEffect(() => {
    const button = buttons.current[selected];
    const list = button?.parentElement;
    if (button && list) list.scrollLeft += button.getBoundingClientRect().left - list.getBoundingClientRect().left;
  }, [selected]);
  const screen = screens[Math.min(selected, screens.length - 1)];
  if (!screen) return <p className="case-shot-error">Product screenshots are not available yet.</p>;
  const select = (index: number, focus = false) => { setSelected(index); if (focus) buttons.current[index]?.focus(); };
  return <div className="case-showcase">
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={screens.length > 1 ? `${id}-${selected}` : undefined} aria-label={screens.length === 1 ? screen.label : undefined}>
      <AnimatePresence mode="wait" initial={false}><motion.div key={screen.src} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}>
        <CaseScreenshot screen={screen} projectName={projectName} priority preview onOpen={onOpen} />
      </motion.div></AnimatePresence>
    </div>
    {screens.length > 1 && <div className="case-screen-tabs" role="tablist" aria-label={`${projectName} screenshots`}>{screens.map((item, index) => <button type="button" role="tab" key={item.src} id={`${id}-${index}`} aria-selected={index === selected} aria-controls={`${id}-panel`} tabIndex={index === selected ? 0 : -1} ref={element => { buttons.current[index] = element; }} onClick={() => select(index)} onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      select(event.key === 'Home' ? 0 : event.key === 'End' ? screens.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + screens.length) % screens.length, true);
    }}><ResponsiveProjectImage src={item.src} alt="" sizes="120px" /><span><small>{String(index + 1).padStart(2, '0')}</small>{item.label}</span></button>)}</div>}
  </div>;
}
