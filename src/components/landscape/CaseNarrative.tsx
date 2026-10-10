import { FiArrowUpRight } from 'react-icons/fi';
import { useSyncExternalStore } from 'react';
import type { Project } from '../../types';
import { mediaPresentation, screenGeometry, type DetailScreen } from '../../lib/project-detail-screens';
import type { CaseStudy } from '../../../shared/case-study-runtime';
import { selectedContributions, screenMatches } from '../../../shared/case-study-runtime';
import { nonempty, projectDisplayName } from '../../../shared/content-integrity';
import { ScreenshotFrame } from './ScreenshotFrame';
import { CaseDisclosure } from './CaseDisclosure';
import './case-narrative.css';

const phoneQuery = '(max-width: 720px)';
const subscribePhone = (notify: () => void) => {
  const query = matchMedia(phoneQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};

export function CaseNarrative({ project, study, screens, openGallery }: {
  project: Project;
  study: CaseStudy;
  screens: DetailScreen[];
  openGallery: (index: number, trigger: HTMLButtonElement, alternate?: DetailScreen) => void;
}) {
  const phone = useSyncExternalStore(subscribePhone, () => matchMedia(phoneQuery).matches, () => false);
  const workflow = study.workflow.flatMap(step => {
    const index = step.matches.map(match => screens.findIndex(screen => screenMatches(screen.src, [match]))).find(index => index >= 0) ?? -1;
    const screen = screens[index];
    const image = screen && screenGeometry(screen);
    const media = screen && mediaPresentation(screen.src);
    const mobile = phone ? media?.mobile : undefined;
    const details = mobile ? [mobile] : media?.details.length ? media.details : screen && image ? [{ ...image, src: screen.src, label: screen.label }] : [];
    return screen && image ? [{ ...step, index, screen, mobile, details, authored: Boolean(mobile || media?.details.length) }] : [];
  });
  const role = project.myRole?.trim(), ownership = project.ownership?.trim();
  const completeContributions = nonempty(project.contributions);
  const contributions = selectedContributions(project, study);
  const team = nonempty(project.team);
  const hasContribution = Boolean(role || ownership || completeContributions.length);
  return (
    <div className={`case-narrative case-narrative-${study.kind}`}>
      <section id="overview" className="story-context">
        <span className="eyebrow">THE CONTEXT</span>
        <h2>{study.problemHeading}</h2>
        <p>{study.problem}</p>
        {study.designCredit && <p className="story-credit">Design from a supplied <a href={study.designCredit.url} target="_blank" rel="noopener noreferrer">{study.designCredit.label}<FiArrowUpRight /></a>.</p>}
      </section>
      {workflow.length > 0 && <section id="workflow" className="story-workflow">
        <span className="eyebrow">{study.kind === 'compact' ? 'A CLOSER LOOK' : 'PRODUCT WORKFLOW'}</span>
        <h2>{study.workflowHeading}</h2>
        <div className="workflow-frames">
          {workflow.map((step, index) => <figure key={step.screen.src}>
            <figcaption className="workflow-intro">
              <span className="workflow-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{step.title}</h3><p>{step.notice}</p></div>
            </figcaption>
            <div className="workflow-details">{step.details.map(detail => <div className={`workflow-detail${detail.height > detail.width ? ' is-portrait' : ''}`} key={detail.src}>
              {step.authored && <p className="workflow-detail-label">{step.mobile ? 'Phone capture' : 'Detail view'} · {detail.label}</p>}
              <ScreenshotFrame src={detail.src} alt={`${projectDisplayName(project)}: ${detail.label}. ${step.notice}`} label={detail.label} ratio={`${detail.width} / ${detail.height}`}
                className="workflow-image" enlarge={trigger => openGallery(step.index, trigger, step.mobile ? { src: step.mobile.fullSrc, label: detail.label, viewport: 'phone' } : undefined)} sizes="(max-width:720px) calc(100vw - 32px), 740px" />
            </div>)}</div>
            <button className="text-link workflow-full-screen" onClick={event => openGallery(step.index, event.currentTarget, step.mobile ? { src: step.mobile.fullSrc, label: step.mobile.label, viewport: 'phone' } : undefined)}>View full screen<FiArrowUpRight /></button>
          </figure>)}
        </div>
      </section>}
      {study.flow && study.flowPlacement === 'workflow' && <section id="workflow" className="story-workflow">
        <span className="eyebrow">CODE-PATH WALKTHROUGH</span><h2>{study.workflowHeading}</h2>
        <figure className="decision-path"><h3>{study.flow.title}</h3><ol>{study.flow.steps.map(step => <li key={step}>{step}</li>)}</ol><figcaption>{study.flow.description}</figcaption></figure>
      </section>}
      {hasContribution && <section id="contribution" className="story-contribution">
        <span className="eyebrow">MY CONTRIBUTION</span>
        <h2>My part in the work.</h2>
        {contributions.length > 0 && <ul>{contributions.map(item => <li key={item}>{item}</li>)}</ul>}
        <CaseDisclosure className="story-disclosure" title="Role and collaborators">
          {role && <p>{role}</p>}{ownership && <p>{ownership}</p>}
          {completeContributions.length > 0 && <ul>{completeContributions.map(item => <li key={item}>{item}</li>)}</ul>}
          {team.length > 0 && <><h3>Team</h3><ul>{team.map(member => <li key={member}>{member}</li>)}</ul></>}
        </CaseDisclosure>
      </section>}
      {!hasContribution && team.length > 0 && <section id="team"><h2>Team delivery</h2><ul>{team.map(member => <li key={member}>{member}</li>)}</ul></section>}
      <section id="engineering" className="story-engineering">
        <span className="eyebrow">ENGINEERING DECISIONS</span>
        <h2>{study.engineeringHeading}</h2>
        {team.length > 1 && <p className="story-evidence-note">These decisions describe the team’s implementation. Individual contributions are listed separately above.</p>}
        {study.flow && !study.flowPlacement && <figure className="decision-path">
          <h3>{study.flow.title}</h3>
          <ol>{study.flow.steps.map(step => <li key={step}>{step}</li>)}</ol>
          <figcaption>{study.flow.description}</figcaption>
        </figure>}
        <div className="engineering-decisions">{study.decisions.map(decision => <CaseDisclosure key={decision.title} heading title={decision.title} description={decision.constraint}>
          <div><p>{decision.choice}</p><p>{decision.consequence}</p>
            {study.sources.filter(source => decision.sources.includes(source.id)).map(source => <a className="text-link" key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}{source.access === 'private' && ' (access required)'}<FiArrowUpRight /></a>)}
          </div>
        </CaseDisclosure>)}</div>
      </section>
      <section id="scope" className="story-scope">
        <div><span className="eyebrow">DELIVERED SCOPE</span><h2>What was built.</h2><ul>{study.delivered.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div><span className="eyebrow">PROJECT SCOPE</span><h2>Scope and limitations.</h2><ul>{study.limits.map(item => <li key={item}>{item}</li>)}</ul></div>
      </section>
      <CaseDisclosure className="story-disclosure story-support" title="Full stack and source references">
        <div className="stack-tags">{nonempty(project.stack).map(tech => <span key={tech}>{tech}</span>)}</div>
        <p className="story-evidence-note">Source reviewed {study.reviewedAt} · revision {study.revision.slice(0, 7)}. These references document the implementation; screenshots illustrate recorded interface states, not every live operation.</p>
        {study.mediaNotes?.map(note => <p className="story-evidence-note" key={note}>{note}</p>)}
        <ul>{study.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}{source.access === 'private' && ' (access required)'}<FiArrowUpRight /></a></li>)}</ul>
      </CaseDisclosure>
    </div>
  );
}
