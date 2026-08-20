import { useMemo, useState } from "react";
import { FiCode, FiDatabase, FiLayers, FiTool } from "react-icons/fi";
import { useTechnologies, useSiteSection } from "../lib/hooks";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { cn } from "../lib/format";
import type { IconType } from "react-icons";
import type { TechCategory } from "../types";
import { PublicDataState } from "../components/PublicDataState";

const categories: { id: TechCategory; name: string; icon: IconType }[] = [
  { id: "languages", name: "Languages", icon: FiCode },
  { id: "frameworks", name: "Frameworks", icon: FiLayers },
  { id: "databases", name: "Data layers", icon: FiDatabase },
  { id: "ops", name: "Tools & platforms", icon: FiTool },
];

export function Technologies() {
  const [active, setActive] = useState<TechCategory>("languages");
  const { data: technologies, isLoading, isError, refetch } = useTechnologies();
  const { data: section } = useSiteSection("technologies");

  const counts = useMemo(() => {
    const map = new Map<TechCategory, number>();
    for (const tech of technologies ?? []) {
      map.set(tech.category, (map.get(tech.category) ?? 0) + 1);
    }
    return map;
  }, [technologies]);

  const filtered = (technologies ?? []).filter((t) => t.category === active);
  if (isLoading || isError) return <PublicDataState loading={isLoading} error={isError} onRetry={() => void refetch()} label="technologies" />;

  return (
    <section id="technologies" className="section relative">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <SectionHeading
            eyebrow={section?.eyebrow ?? ""}
            title={section?.heading ?? ""}
            description={section?.description ?? ""}
            className="mb-0"
          />

          <Reveal delay={0.1}>
            <div
              role="tablist"
              aria-label="Filter technologies by category"
              className="seg grid w-full grid-cols-2 self-start sm:inline-flex sm:w-auto"
            >
              {categories.map(({ id, name, icon: Icon }) => {
                const isActive = active === id;
                const count = counts.get(id) ?? 0;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(id)}
                    className={cn("seg-btn group w-full px-3 sm:w-auto sm:px-4", isActive && "active")}
                  >
                    <Icon
                      size={15}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-white" : "text-faint group-hover:text-accent",
                      )}
                    />
                    <span className="hidden sm:inline">{name}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "border border-line bg-surface-2 text-faint",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-wider text-faint">
            showing {filtered.length} {filtered.length === 1 ? "technology" : "technologies"}
            {" "}— {active}
          </p>
        </Reveal>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-line bg-surface-2/40 p-14 text-center font-mono text-sm text-faint">
            no entries found in this category
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tech, i) => (
              <Reveal key={`${tech.category}-${tech.name}-${i}`} delay={Math.min(i * 0.04, 0.3)}>
                <div className="group flex min-h-[96px] flex-col justify-between border-t border-line p-5 transition-colors duration-200 hover:border-accent/40 hover:bg-surface/40">
                  <span className="text-sm font-semibold text-ink transition-colors duration-200 group-hover:text-accent">
                    {tech.name}
                  </span>
                  <span className="mt-4 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-wider text-faint">
                    {tech.category}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
