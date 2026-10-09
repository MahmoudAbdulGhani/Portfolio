import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiArrowUpRight } from "react-icons/fi";
import {
  useProfile,
  useEducation,
  useCertifications,
  useTechnologies,
  useProjects,
  useSkills,
} from "../../lib/hooks";
import { PageMeta } from "../PageMeta";
import { PublicDataState } from "../PublicDataState";
import { CvDownloadButton } from "../CvDownloadButton";
import { ProfilePortrait } from "./ProfilePortrait";
import { evidenceUrl } from "../../lib/assistant-response";
import { monthDate, recordKind, capabilityGroups } from "../../../shared/content-integrity";

export function ProfilePage() {
  const profile = useProfile(),
    education = useEducation(),
    certifications = useCertifications(),
    technologies = useTechnologies(),
    projects = useProjects(),
    skills = useSkills();
  const [tab, setTab] = useState("Experience");
  const person = profile.data;
  const capabilities = capabilityGroups(technologies.data, skills.data, projects.data);
  if (profile.isLoading || profile.isError || !person)
    return (
      <main className="page-surface">
        <PublicDataState
          loading={profile.isLoading}
          error={profile.isError}
          onRetry={() => void profile.refetch()}
          label="profile"
        />
      </main>
    );
  return (
    <main id="main-content" tabIndex={-1} className="page-surface profile-page">
      <PageMeta
        title={`Profile — ${person.name}`}
        description={person.professionalSummary ?? person.bio}
      />
      <div className="profile-portrait">
        <ProfilePortrait name={person.name} photo={person.photo} />
        <div className="portrait-caption">
          <span className="eyebrow">{person.name}</span>
          <span>
            {person.location}
            <br />
            {person.languages}
          </span>
        </div>
        <div className="panel-links">
          {person.socials
            .filter(
              (social) =>
                social.published !== false && social.showInHero !== false,
            )
            .map((social) => (
              <a
                key={social.id ?? social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
                <FiArrowUpRight />
              </a>
            ))}
        </div>
        <CvDownloadButton
          url={
            (person.resumeUrl && evidenceUrl(person.resumeUrl)?.href) ||
            "/api/cv.pdf"
          }
        />
      </div>
      <div className="profile-record">
        <span className="eyebrow">PROFILE / WORKING RECORD</span>
        <h1 className="view-heading">{person.title}</h1>
        <p className="profile-intro">
          {person.professionalSummary || person.bio}
        </p>
        <div className="record-tabs" role="group" aria-label="Profile records">
          {["Experience", "Education & training", "Capabilities"].map(
            (label) => (
              <button
                key={label}
                aria-pressed={tab === label}
                onClick={() => setTab(label)}
              >
                {label}
              </button>
            ),
          )}
        </div>
        {tab === "Experience" && (
          <div className="experience-record">
            {person.experience
              .filter((item) => item.published !== false)
              .map((item, index) => (
                <details key={item.id ?? index} open={index === 0 || undefined}>
                  <summary>
                    <span className="record-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{item.company || item.facility}</strong>
                      <span>{item.role || item.milestone}</span>
                    </span>
                    {item.meta && <span className="record-date">{item.meta}</span>}
                    <FiPlus />
                  </summary>
                  <div className="record-detail">
                    {(item.description || item.details) && <p>{item.description || item.details}</p>}
                    {item.learningEvidence?.completion.status === 'unverified' && <p className="learning-status">Program completion is not verified by the available records.</p>}
                    {Boolean(item.bullets?.length) && (
                      <ul>
                        {item.bullets?.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    {item.location && <span className="eyebrow">{item.location}</span>}
                  </div>
                </details>
              ))}
          </div>
        )}
        {tab === "Education & training" && (
          <div className="education-record">
            <PublicDataState
              loading={education.isLoading || certifications.isLoading}
              error={education.isError || certifications.isError}
              onRetry={() => {
                void education.refetch();
                void certifications.refetch();
              }}
              label="education and training"
            />
            {education.data
              ?.filter((item) => item.published !== false)
              .map((item) => (
                <section key={item.id}>
                  <span className="eyebrow">{item.period}</span>
                  <h2>{item.degree}</h2>
                  <p>{item.school}</p>
                  {item.details && <p>{item.details}</p>}
                </section>
              ))}
            <div className="training-record">
              {certifications.data
                ?.filter((item) => item.published !== false)
                .map((item) => (
                  <div key={item.id}>
                    <span className="eyebrow">{recordKind(item)}</span>
                    <h3>{item.title}</h3>
                    <p>
                      {[item.issuer, item.year || monthDate(item.issueDate) || (item.expectedDate ? `Expected ${monthDate(item.expectedDate)}` : '')].filter(Boolean).join(' · ')}
                    </p>
                    {item.description && <p>{item.description}</p>}
                    <p className="learning-status">Completion and certification are not verified by the available records.</p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        {recordKind(item) === 'Certification' ? 'Credential' : 'Program information'}
                        <FiArrowUpRight />
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
        {tab === "Capabilities" && (
          <div className="capability-record">
            <PublicDataState
              loading={technologies.isLoading || skills.isLoading}
              error={technologies.isError || skills.isError}
              onRetry={() => {
                void technologies.refetch();
                void skills.refetch();
              }}
              label="capabilities"
            />
            {["languages", "frameworks", "databases", "ops", "skills"]
              .filter(category => capabilities.some(item => item.category === category))
              .map(category => (
                <div key={category}>
                  <h2>{category === "ops" ? "Operations" : category === 'skills' ? 'Skills' : category}</h2>
                  <ul className={category === 'skills' ? undefined : 'capability-summary'}>
                    {capabilities.filter(item => item.category === category).map(item => (
                      <li key={item.key} data-competency={item.key}>
                        <span>
                          {item.name}
                          {item.details.length > 0 && <span className="competency-detail"> — {item.details.join(', ')}</span>}
                        </span>
                        {item.evidence.map(project => (
                          <Link key={project.slug} className="text-link" to={`/projects/${project.slug}`}>
                            Demonstrated in {project.name}<FiArrowUpRight />
                          </Link>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
        <Link className="text-link profile-contact" to="/contact">
          Let’s build something useful
          <FiArrowUpRight />
        </Link>
      </div>
    </main>
  );
}
