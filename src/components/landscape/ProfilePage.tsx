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
import type { ExperienceItem } from "../../types";
import { evidenceUrl } from "../../lib/assistant-response";

function period(item: ExperienceItem) {
  const date = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString("en", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      : "";
  return (
    item.meta ||
    [date(item.startDate), item.isCurrent ? "Present" : date(item.endDate)]
      .filter(Boolean)
      .join(" — ")
  );
}

export function ProfilePage() {
  const profile = useProfile(),
    education = useEducation(),
    certifications = useCertifications(),
    technologies = useTechnologies(),
    projects = useProjects(),
    skills = useSkills();
  const [tab, setTab] = useState("Experience");
  const person = profile.data;
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
                    <span className="record-date">{period(item)}</span>
                    <FiPlus />
                  </summary>
                  <div className="record-detail">
                    <p>{item.description || item.details}</p>
                    {Boolean(item.bullets?.length) && (
                      <ul>
                        {item.bullets?.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    <span className="eyebrow">{item.location}</span>
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
                  <p>{item.details}</p>
                </section>
              ))}
            <div className="training-record">
              {certifications.data
                ?.filter((item) => item.published !== false)
                .map((item) => (
                  <div key={item.id}>
                    <h3>{item.title}</h3>
                    <p>
                      {item.issuer} ·{" "}
                      {item.year || item.issueDate || item.expectedDate}
                    </p>
                    {item.description && <p>{item.description}</p>}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        Credential
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
            {["languages", "frameworks", "databases", "ops"].map((category) => (
              <div key={category}>
                <h2>{category === "ops" ? "Operations" : category}</h2>
                <p>
                  {technologies.data
                    ?.filter((item) => item.category === category)
                    .map((item) => item.name)
                    .join(" · ")}
                </p>
                {projects.data
                  ?.filter((project) =>
                    project.stack.some((tech) =>
                      technologies.data?.some(
                        (item) =>
                          item.category === category &&
                          item.name.toLowerCase() === tech.toLowerCase(),
                      ),
                    ),
                  )
                  .slice(0, 2)
                  .map((project) => (
                    <Link
                      key={project.id}
                      className="text-link"
                      to={`/projects/${project.slug}`}
                    >
                      See {project.name}
                      <FiArrowUpRight />
                    </Link>
                  ))}
              </div>
            ))}
            <div>
              <h2>Skills</h2>
              <ul>
                {skills.data?.map((skill) => (
                  <li key={skill.id}>
                    {skill.name} <span className="eyebrow">{skill.status}</span>
                  </li>
                ))}
              </ul>
            </div>
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
