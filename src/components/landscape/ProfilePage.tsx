import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
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
import { StandingPortraitPrototype } from './StandingPortraitPrototype';
import { CaseDisclosure } from './CaseDisclosure';
import { ProfileEntry } from './ProfileEntry';
import { evidenceUrl } from "../../lib/assistant-response";
import { monthDate, recordKind, capabilityGroups } from "../../../shared/content-integrity";
import { ProfileCapabilities } from './ProfileCapabilities';
import './profile-record.css';

const tabs = ['Experience', 'Education & training', 'Capabilities'];
// Match the review stylesheet on the first client render and on resize. Moving
// these single elements in the DOM keeps reading/focus order equal to the layout.
const mobileReviewQuery = '(max-width: 719px)';
const subscribeReviewViewport = (notify: () => void) => {
  const media = window.matchMedia(mobileReviewQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};

export function ProfilePage({ portraitPrototype = false }: { portraitPrototype?: boolean }) {
  const mobileReview = useSyncExternalStore(subscribeReviewViewport,
    () => portraitPrototype && window.matchMedia(mobileReviewQuery).matches, () => false);
  const profile = useProfile(),
    education = useEducation(),
    certifications = useCertifications(),
    technologies = useTechnologies(),
    projects = useProjects(),
    skills = useSkills();
  const [tab, setTab] = useState("Experience");
  const id = useId(), tabButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const tabKey = (label: string) => `${id}-${tabs.indexOf(label)}`;
  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); setTab(tabs[next]); tabButtons.current[next]?.focus();
  };
  const person = profile.data;
  const capabilities = capabilityGroups(technologies.data, skills.data, projects.data);
  const Entry = portraitPrototype ? 'div' : ProfileEntry;
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
  const cvDownload = <CvDownloadButton url={(person.resumeUrl && evidenceUrl(person.resumeUrl)?.href) || "/api/cv.pdf"} />;
  const heading = <>
    <span className="eyebrow">PROFILE / WORKING RECORD</span>
    <h1 className="view-heading">{person.title}</h1>
  </>;
  const introduction = <p className="profile-intro">
    I build web applications that connect clear interfaces with dependable backend workflows. My work includes individual and team projects involving authentication, data persistence and reviewed AI-assisted features.
  </p>;
  const socialLinks = <div className="panel-links">
    {person.socials
      .filter(social => social.published !== false && social.showInHero !== false)
      .map(social => <a key={social.id ?? social.url} href={social.url} target="_blank" rel="noopener noreferrer">
        {social.label}<FiArrowUpRight />
      </a>)}
  </div>;
  return (
    <main id="main-content" tabIndex={-1} className={`page-surface profile-page${portraitPrototype ? ' profile-standing-prototype' : ''}`}>
      <PageMeta
        noIndex={portraitPrototype}
        title={`Profile — ${person.name}`}
        description={person.professionalSummary ?? person.bio}
      />
      {mobileReview && <div className="profile-review-heading">{heading}</div>}
      <Entry className="profile-portrait">
        {mobileReview && <div className="portrait-caption"><span className="eyebrow">{person.name}</span></div>}
        {portraitPrototype ? <StandingPortraitPrototype key="standing" name={person.name} photo={person.photo} /> : <ProfilePortrait name={person.name} photo={person.photo} />}
        {!mobileReview && <div className="portrait-caption">
          <span className="eyebrow">{person.name}</span>
          <span>
            {portraitPrototype ? <>
              <span className="portrait-location">{person.location}</span>
              <br className="portrait-details-break" />
              <span className="portrait-languages">{person.languages}</span>
            </> : <>{person.location}<br />{person.languages}</>}
          </span>
        </div>}
        {mobileReview ? <div className="portrait-actions">
          <span className="portrait-location">{person.location}</span>
          {cvDownload}
        </div> : portraitPrototype && cvDownload}
        {!mobileReview && socialLinks}
        {!portraitPrototype && cvDownload}
      </Entry>
      {mobileReview && <>
        {introduction}
        <div className="profile-review-details">
          <span className="portrait-languages">{person.languages}</span>
          {socialLinks}
        </div>
      </>}
      <Entry className="profile-record">
        {!mobileReview && <>{heading}{introduction}</>}
        <div className="record-tabs" role="tablist" aria-label="Profile records">
          {tabs.map(
            (label, index) => (
              <button
                key={label}
                type="button" role="tab" id={`${tabKey(label)}-tab`} aria-controls={`${tabKey(label)}-panel`}
                aria-selected={tab === label} tabIndex={tab === label ? 0 : -1}
                ref={element => { tabButtons.current[index] = element; }}
                onKeyDown={event => moveTab(event, index)}
                onClick={() => setTab(label)}
              >
                {label}
              </button>
            ),
          )}
        </div>
          <div className="experience-record" role="tabpanel" id={`${tabKey('Experience')}-panel`} aria-labelledby={`${tabKey('Experience')}-tab`} hidden={tab !== 'Experience'} tabIndex={0}>
            {person.experience
              .filter((item) => item.published !== false)
              .map((item, index) => (
                <CaseDisclosure key={item.id ?? index} title={item.role || item.milestone || 'Experience'} defaultOpen={index === 0} summary={<>
                    <span className="record-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="record-copy">
                      <strong>{item.role || item.milestone}</strong>
                      <span className="record-organization">{item.company || item.facility}</span>
                      {item.meta && <span className="record-date">{item.meta}</span>}
                      {item.learningEvidence?.completion.status === 'unverified' && <span className="learning-status">Program completion is not verified by the available records.</span>}
                    </span>
                    <FiPlus className="disclosure-indicator" aria-hidden="true" />
                  </>}>
                  <div className="record-detail">
                    {(item.description || item.details) && <p>{item.description || item.details}</p>}
                    {Boolean(item.bullets?.length) && (
                      <ul>
                        {item.bullets?.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    {item.location && <span className="record-location">{item.location}</span>}
                  </div>
                </CaseDisclosure>
              ))}
          </div>
          <div className="education-record" role="tabpanel" id={`${tabKey('Education & training')}-panel`} aria-labelledby={`${tabKey('Education & training')}-tab`} hidden={tab !== 'Education & training'} tabIndex={0}>
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
              .map((item, index) => (
                <section key={item.id}>
                  <span className="record-number">{String(index + 1).padStart(2,'0')} / Education</span>
                  <h2>{item.degree}</h2>
                  <p className="record-organization">{item.school}</p>
                  {item.period && <p className="record-date">{item.period}</p>}
                  {item.details && <p>{item.details}</p>}
                  {item.learningEvidence?.completion.status === 'unverified' && <p className="learning-status">Completion is not independently verified by the available records.</p>}
                </section>
              ))}
            <div className="training-record">
              {certifications.data
                ?.filter((item) => item.published !== false)
                .map((item, index) => {
                  const period = item.year || monthDate(item.issueDate) || (item.expectedDate ? `Expected ${monthDate(item.expectedDate)}` : '');
                  return (
                  <div key={item.id}>
                    <span className="record-number">{String(index + 1).padStart(2,'0')} / {recordKind(item)}</span>
                    <h3>{item.title}</h3>
                    {item.issuer && <p className="record-organization">{item.issuer}</p>}
                    {period && <p className="record-date">{period}</p>}
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
                ); })}
            </div>
          </div>
          <div className="capability-record" role="tabpanel" id={`${tabKey('Capabilities')}-panel`} aria-labelledby={`${tabKey('Capabilities')}-tab`} hidden={tab !== 'Capabilities'} tabIndex={0}>
            <PublicDataState
              loading={technologies.isLoading || skills.isLoading}
              error={technologies.isError || skills.isError}
              onRetry={() => {
                void technologies.refetch();
                void skills.refetch();
              }}
              label="capabilities"
            />
            <ProfileCapabilities capabilities={capabilities} projects={projects.data ?? []} />
          </div>
        <Link className="text-link profile-contact" to="/contact">
          Let’s build something useful
          <FiArrowUpRight />
        </Link>
      </Entry>
    </main>
  );
}
