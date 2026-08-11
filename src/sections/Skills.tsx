import { useMemo } from "react";
import { useSkills } from "../lib/hooks";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

const layerTones: Record<string, { dot: string; badge: string }> = {
  Frontend: { dot: "bg-accent", badge: "border-accent/25 bg-accent/10 text-accent" },
  Backend: { dot: "bg-accent-2", badge: "border-accent-2/30 bg-accent-2/10 text-accent-2" },
  Data: { dot: "bg-gold", badge: "border-gold/30 bg-gold/10 text-gold" },
  Tools: { dot: "bg-ok", badge: "border-ok/25 bg-ok/10 text-ok" },
};

export function Skills() {
  const { data: skills } = useSkills();

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const skill of skills ?? []) {
      const list = map.get(skill.category) ?? [];
      list.push(skill.name);
      map.set(skill.category, list);
    }
    return [...map.entries()];
  }, [skills]);

  return (
    <section id="skills" className="section relative bg-bg-soft">
      <div className="container-x">
        <SectionHeading
          eyebrow="Capability map"
          title="Technical strengths"
          description="A practical view of the skills behind this portfolio: frontend delivery, backend APIs, data layers, and modern full-stack tooling."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {grouped.map(([category, names], i) => {
            const tone = layerTones[category] ?? {
              dot: "bg-accent",
              badge: "border-line bg-surface-2 text-muted",
            };
            return (
              <Reveal key={category} delay={i * 0.08} variant="scale">
                <div className="card card-hover h-full p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h3 className="flex items-center gap-2.5 font-display text-base font-bold text-ink">
                      <span className={`h-2 w-2 rounded-full ${tone.dot}`} aria-hidden />
                      {category}
                    </h3>
                    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${tone.badge}`}>
                      {names.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {names.map((name) => (
                      <span
                        key={name}
                        className="chip"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
