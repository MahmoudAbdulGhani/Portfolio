import { FiAward, FiExternalLink } from "react-icons/fi";
import { useCertifications } from "../lib/hooks";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

export function Certifications() {
  const { data: certifications } = useCertifications();

  return (
    <section id="certifications" className="section relative bg-bg-soft">
      <div className="container-x">
        <SectionHeading
          eyebrow="Credentials"
          title="Training & Courses"
          description="Completed learning programs shown separately from professional experience."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(certifications ?? []).map((cert, i) => (
            <Reveal key={cert.id} delay={Math.min(i * 0.06, 0.3)}>
              <article className="card card-hover group flex h-full flex-col p-6">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold transition-colors duration-200 group-hover:border-gold/45">
                    <FiAward size={19} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold leading-snug text-ink">
                      {cert.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted">{cert.issuer}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                  {cert.year && <span className="chip">{cert.year}</span>}
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                    >
                      View credential
                      <FiExternalLink size={13} />
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
