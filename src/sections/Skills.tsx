import { useMemo } from "react";
import { useSkills } from "../lib/hooks";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

const fallbackPillars: { title: string; status: string; items: string[] }[] = [
  {
    title: "Frontend",
    status: "Used in projects",
    items: [
      "React.js",
      "Next.js",
      "Angular",
      "TypeScript",
      "Tailwind CSS",
      "Responsive Design",
    ],
  },
  {
    title: "Backend",
    status: "Used in projects",
    items: [
      "Node.js",
      "Express.js",
      "NestJS",
      "PHP",
      "REST APIs",
      "JWT Authentication",
      "RBAC",
      "Real-Time Systems",
    ],
  },
  {
    title: "Databases",
    status: "Used in projects",
    items: [
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "Supabase",
      "Git/GitHub",
      "Stripe",
      "Zod",
      "Postman",
    ],
  },
];

export function Skills() {
  const { data: skills } = useSkills();

  const pillars = useMemo(() => {
    const grouped = new Map<string, { name: string; status: string }[]>();
    for (const skill of skills ?? []) {
      const list = grouped.get(skill.category) ?? [];
      list.push({ name: skill.name, status: skill.status ?? "verified" });
      grouped.set(skill.category, list);
    }
    if (grouped.size === 0) return fallbackPillars;
    return [...grouped].map(([title, rows]) => ({
      title,
      status: rows.every((row) => row.status === "learning")
        ? "Currently learning"
        : rows.every((row) => row.status === "familiar") ? "Familiar with" : "Used in projects",
      items: rows.map((row) => row.name),
    }));
  }, [skills]);

  return (
    <section id="skills" className="section relative bg-surface-2">
      <div className="container-x">
        <SectionHeading
          eyebrow="Stack"
          title="Technical architecture"
          description="Technologies used across professional work, completed applications, and current project development."
        />

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={Math.min(i * 0.05, 0.25)}>
                <div className="card h-full p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <span className="tech-label">{pillar.title}</span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-faint">{pillar.status}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {pillar.items.map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
