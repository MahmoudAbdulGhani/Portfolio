import { FiBookOpen } from "react-icons/fi";
import { useEducation, useSiteSection } from "../lib/hooks";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { PublicDataState } from "../components/PublicDataState";

export function Education() {
  const { data: education, isLoading, isError, refetch } = useEducation();
  const { data: section } = useSiteSection("education");
  if (isLoading || isError) return <PublicDataState loading={isLoading} error={isError} onRetry={() => void refetch()} label="education" />;

  return (
    <section id="education" className="section relative">
      <div className="container-x">
        <SectionHeading
          eyebrow={section?.eyebrow ?? ""}
          title={section?.heading ?? ""}
          description={section?.description ?? ""}
        />

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(education ?? []).map((edu, i) => (
            <Reveal key={edu.id} delay={i * 0.08}>
              <article className="card card-hover group h-full p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent transition-colors duration-200 group-hover:border-accent/40">
                      <FiBookOpen size={19} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold leading-snug text-ink">
                        {edu.degree}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted">{edu.school}</p>
                      {edu.field && <p className="mt-0.5 text-xs text-faint">{edu.field}</p>}
                      {edu.location && <p className="mt-0.5 text-xs text-faint">{edu.location}</p>}
                    </div>
                  </div>
                  {(edu.period || edu.startDate || edu.endDate) && (
                    <span className="chip shrink-0">{edu.period || [edu.startDate, edu.endDate].filter(Boolean).join(" – ")}</span>
                  )}
                </div>
                {edu.details && (
                  <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
                    {edu.details}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
