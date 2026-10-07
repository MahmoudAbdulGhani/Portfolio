import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCpu, FiDatabase, FiLayers, FiLayout, FiServer, FiShield } from "react-icons/fi";
import { useLandingMotion } from "../lib/landing-motion";
import "./skill-explorer.css";

// Related saved CMS categories share a panel; original category names remain visible.
const families = [
  ["Frontend", "Languages & Web", "Web Performance & SEO"],
  ["Backend & APIs", "Backend"],
  ["Databases & ORM"],
  ["AI"],
  ["Authentication & Security", "Auth & DevOps", "DevOps & Version Control"],
  ["Architecture & Testing", "Architecture", "Testing"],
];
const icons = [FiLayout, FiServer, FiDatabase, FiCpu, FiShield, FiLayers];

export function SkillExplorer({ groups, heading }: { groups: Record<string, string[]>; heading: string }) {
  const [index, setIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const { enabled } = useLandingMotion();
  const assigned = new Set(families.flat());
  const panels = [...families, ...Object.keys(groups).filter(key => !assigned.has(key)).map(key => [key])]
    .map((family, i) => ({ sources: family.filter(key => groups[key]?.length), Icon: icons[i] || FiLayers }))
    .filter(panel => panel.sources.length > 0);
  const selected = Math.min(index, panels.length - 1);
  const panel = panels[selected];
  if (!panel) return null;
  return <section id="all-skills" className="cinema-stack-explorer" aria-labelledby="stack-explorer-title">
    <h3 id="stack-explorer-title">{heading}</h3>
    <div className="cinema-explorer-grid">
      <div className="cinema-explorer-tabs" role="tablist" aria-label={heading}>{panels.map(({ sources, Icon }, i) => <button key={sources[0]} ref={el => { buttons.current[i] = el; }} type="button" role="tab" id={`stack-tab-${i}`} aria-controls="stack-explorer-panel" aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => setIndex(i)} onKeyDown={event => {
        let next: number;
        if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (i + 1) % panels.length;
        else if (["ArrowUp", "ArrowLeft"].includes(event.key)) next = (i - 1 + panels.length) % panels.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = panels.length - 1;
        else return;
        event.preventDefault(); setIndex(next); buttons.current[next]?.focus();
      }}><Icon aria-hidden /><span>{sources[0]}</span><small>{sources.reduce((count, key) => count + groups[key].length, 0)}</small></button>)}</div>
      <div id="stack-explorer-panel" className="cinema-explorer-panel" role="tabpanel" aria-labelledby={`stack-tab-${selected}`} tabIndex={0}>
        <AnimatePresence mode="wait" initial={false}><motion.div key={panel.sources[0]} initial={enabled ? { opacity: 0, x: 24 } : false} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: enabled ? -24 : 0 }} transition={{ duration: enabled ? 0.24 : 0 }}>{panel.sources.map(category => <div className="cinema-explorer-category" key={category}><p className="cinema-label">{category}</p><ul>{groups[category].map(name => <li key={name}>{name}</li>)}</ul></div>)}</motion.div></AnimatePresence>
      </div>
    </div>
  </section>;
}
