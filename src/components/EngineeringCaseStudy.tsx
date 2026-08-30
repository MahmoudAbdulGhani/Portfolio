import { useRef, useState, type KeyboardEvent } from "react";
import { FiActivity, FiBarChart2, FiCode, FiCpu } from "react-icons/fi";

type Props = {
  architecture?: string[];
  codeDiffs?: string[];
  benchmarks?: string[];
  views: number;
};

function fields(value: string, count: number) {
  const parts = value.split("|").map((part) => part.trim());
  return parts.length >= count && parts.slice(0, count).every(Boolean) ? parts : undefined;
}

export function EngineeringCaseStudy({ architecture = [], codeDiffs = [], benchmarks = [], views }: Props) {
  const nodes = architecture.flatMap((item) => {
    const parsed = fields(item, 2);
    return parsed ? [{ label: parsed[0], description: parsed.slice(1).join(" | ") }] : [];
  });
  const diffs = codeDiffs.flatMap((item) => {
    const parsed = fields(item, 3);
    return parsed ? [{ title: parsed[0], before: parsed[1], after: parsed.slice(2).join(" | ") }] : [];
  });
  const metrics = benchmarks.flatMap((item) => {
    const parsed = fields(item, 3);
    return parsed ? [{ label: parsed[0], value: parsed[1], context: parsed.slice(2).join(" | ") }] : [];
  });
  const [activeNode, setActiveNode] = useState(0);
  const nodeButtons = useRef<Array<HTMLButtonElement | null>>([]);

  const selectNode = (index: number) => {
    const next = (index + nodes.length) % nodes.length;
    setActiveNode(next);
    nodeButtons.current[next]?.focus();
  };

  const onArchitectureKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectNode(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectNode(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectNode(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectNode(nodes.length - 1);
    }
  };

  return (
    <section className="mt-14 space-y-10 sm:mt-16" aria-labelledby="engineering-evidence-title">
      <div>
        <span className="tech-label">Engineering case study</span>
        <h2 id="engineering-evidence-title" className="mt-2 font-display text-2xl font-bold text-ink">Architecture, decisions, and evidence</h2>
      </div>

      {nodes.length > 0 && (
        <div className="card p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2 text-ink"><span className="flex items-center gap-2"><FiCpu className="text-accent" /><h3 className="font-display font-bold">System architecture</h3></span><span className="font-mono text-[10px] uppercase tracking-wider text-faint">Select a layer to inspect it</span></div>
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="Architecture layers">
            {nodes.map((node, index) => (
              <button key={`${node.label}-${index}`} ref={(element) => { nodeButtons.current[index] = element; }} type="button" role="tab" id={`architecture-tab-${index}`} aria-controls="architecture-detail" aria-selected={activeNode === index} tabIndex={activeNode === index ? 0 : -1} onClick={() => setActiveNode(index)} onKeyDown={(event) => onArchitectureKeyDown(event, index)} className={`group min-h-20 min-w-0 rounded-xl border px-4 py-3 text-left transition-all ${activeNode === index ? "border-accent bg-accent/10 text-accent shadow-sm" : "border-line bg-surface-2 text-ink hover:border-accent/40 hover:bg-surface"}`}>
                <span className={`block font-mono text-[10px] transition-colors ${activeNode === index ? "text-accent" : "text-faint group-hover:text-accent"}`}>{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-1 block break-words text-sm font-semibold leading-snug">{node.label}</span>
              </button>
            ))}
          </div>
          <div id="architecture-detail" role="tabpanel" aria-labelledby={`architecture-tab-${activeNode}`} tabIndex={0} className="mt-4 rounded-lg border border-line bg-surface-2 p-4"><p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">{nodes[activeNode]?.label}</p><p className="mt-2 text-sm leading-relaxed text-muted">{nodes[activeNode]?.description}</p></div>
        </div>
      )}

      {diffs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-ink"><FiCode className="text-accent" /><h3 className="font-display font-bold">Implementation improvements</h3></div>
          <div className="mt-4 space-y-4">
            {diffs.map((diff, index) => (
              <article key={`${diff.title}-${index}`} className="overflow-hidden rounded-xl border border-line bg-surface font-mono text-xs">
                <h4 className="border-b border-line bg-surface-2 px-4 py-2.5 font-sans text-sm font-bold text-ink">{diff.title}</h4>
                <div className="grid sm:grid-cols-2">
                  <del className="block border-b border-danger/20 bg-danger/5 px-4 py-4 leading-relaxed text-muted no-underline sm:border-b-0 sm:border-r"><span className="mr-2 font-bold text-danger" aria-hidden>−</span>{diff.before}</del>
                  <ins className="block bg-ok/5 px-4 py-4 leading-relaxed text-ink no-underline"><span className="mr-2 font-bold text-ok" aria-hidden>+</span>{diff.after}</ins>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 text-ink"><FiBarChart2 className="text-accent" /><h3 className="font-display font-bold">Benchmarks & telemetry</h3></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => <article key={`${metric.label}-${index}`} className="card p-5"><p className="font-mono text-[10px] uppercase tracking-wider text-faint">{metric.label}</p><p className="mt-2 font-display text-2xl font-bold text-ink">{metric.value}</p><p className="mt-2 text-xs leading-relaxed text-muted">{metric.context}</p></article>)}
          <article className="card p-5"><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-faint"><FiActivity />Case-study views</p><p className="mt-2 font-display text-2xl font-bold text-ink">{views.toLocaleString()}</p><p className="mt-2 text-xs leading-relaxed text-muted">Aggregate page views only; no visitor identity is displayed.</p></article>
        </div>
      </div>
    </section>
  );
}
