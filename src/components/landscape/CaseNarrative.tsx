import { FiArrowUpRight } from 'react-icons/fi';
import type { CSSProperties } from 'react';
import { projectImages } from '../../generated/project-images';
import type { Project } from '../../types';
import type { DetailScreen } from '../../lib/project-detail-screens';
import type { CaseStudy } from '../../../shared/case-study-runtime';
import { selectedContributions, screenMatches } from '../../../shared/case-study-runtime';
import { nonempty, projectDisplayName } from '../../../shared/content-integrity';
import { ResponsiveProjectImage } from '../ResponsiveProjectImage';
import './case-narrative.css';

export function CaseNarrative({ project, study, screens, openGallery }: {
  project: Project;
  study: CaseStudy;
  screens: DetailScreen[];
  openGallery: (index: number, trigger: HTMLButtonElement) => void;
}) {
  const workflow = study.workflow.flatMap(step => {
    const index = screens.findIndex(screen => screenMatches(screen.src, step.matches));
    const screen = screens[index];
    const image = screen && projectImages[screen.src];
    return screen ? [{ ...step, index, screen, ratio: image ? `${image.width} / ${image.height}` : step.ratio || '16 / 9' }] : [];
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
            <button className={`workflow-image${step.mobileCrop ? ' has-mobile-crop' : ''}`} style={{ aspectRatio: step.ratio,
              '--crop-zoom': step.mobileCrop?.zoom, '--crop-x': `${step.mobileCrop?.x}%`, '--crop-y': `${step.mobileCrop?.y}%`,
            } as CSSProperties} onClick={event => openGallery(step.index, event.currentTarget)} aria-label={`Enlarge ${step.screen.label}`}>
              <ResponsiveProjectImage src={step.screen.src} alt={`${projectDisplayName(project)}: ${step.screen.label}. ${step.notice}`} sizes={step.mobileCrop ? `(max-width:720px) ${Math.ceil(step.mobileCrop.zoom * 90)}vw, 90vw` : '90vw'} fit="frame" />
            </button>
            <figcaption>
              <span className="workflow-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{step.title}</h3>{step.mobileCrop && <span className="workflow-crop-label">Detail excerpt · full screen in the gallery</span>}<p>{step.notice}</p><button className="text-link" onClick={event => openGallery(step.index, event.currentTarget)}>Inspect image<FiArrowUpRight /></button></div>
            </figcaption>
          </figure>)}
        </div>
      </section>}
      {study.flow && study.flowPlacement === 'workflow' && <section id="workflow" className="story-workflow">
        <span className="eyebrow">CODE-PATH WALKTHROUGH</span><h2>{study.workflowHeading}</h2>
        <figure className="decision-path"><h3>{study.flow.title}</h3><ol>{study.flow.steps.map(step => <li key={step}>{step}</li>)}</ol><figcaption>{study.flow.description}</figcaption></figure>
      </section>}
      {hasContribution && <section id="contribution" className="story-contribution">
        <span className="eyebrow">DOCUMENTED PERSONAL WORK</span>
        <h2>My part in the work.</h2>
        {contributions.length > 0 && <ul>{contributions.map(item => <li key={item}>{item}</li>)}</ul>}
        <details className="story-disclosure"><summary>Complete role and collaboration record</summary>
          {role && <p>{role}</p>}{ownership && <p>{ownership}</p>}
          {completeContributions.length > 0 && <ul>{completeContributions.map(item => <li key={item}>{item}</li>)}</ul>}
          {team.length > 0 && <><h3>Team</h3><ul>{team.map(member => <li key={member}>{member}</li>)}</ul></>}
        </details>
      </section>}
      {!hasContribution && team.length > 0 && <section id="team"><h2>Team delivery</h2><ul>{team.map(member => <li key={member}>{member}</li>)}</ul></section>}
      <section id="engineering" className="story-engineering">
        <span className="eyebrow">IMPLEMENTATION EVIDENCE</span>
        <h2>{study.engineeringHeading}</h2>
        {team.length > 1 && <p className="story-evidence-note">These decisions describe the team-delivered implementation. Personal attribution is limited to the contribution record above.</p>}
        {study.flow && !study.flowPlacement && <figure className="decision-path">
          <h3>{study.flow.title}</h3>
          <ol>{study.flow.steps.map(step => <li key={step}>{step}</li>)}</ol>
          <figcaption>{study.flow.description}</figcaption>
        </figure>}
        <div className="engineering-decisions">{study.decisions.map(decision => <details key={decision.title}>
          <summary><h3>{decision.title}<span className="decision-constraint">{decision.constraint}</span></h3></summary>
          <div><p>{decision.choice}</p><p>{decision.consequence}</p>
            {study.sources.filter(source => decision.sources.includes(source.id)).map(source => <a className="text-link" key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}{source.access === 'private' && ' (access required)'}<FiArrowUpRight /></a>)}
          </div>
        </details>)}</div>
      </section>
      <section id="scope" className="story-scope">
        <div><span className="eyebrow">DELIVERED SCOPE</span><h2>What is supported.</h2><ul>{study.delivered.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div><span className="eyebrow">EVIDENCE LIMITS</span><h3>What this review establishes.</h3><ul>{study.limits.map(item => <li key={item}>{item}</li>)}</ul></div>
      </section>
      <details className="story-disclosure story-support"><summary>Full stack and source references</summary>
        <div className="stack-tags">{nonempty(project.stack).map(tech => <span key={tech}>{tech}</span>)}</div>
        <p className="story-evidence-note">Implementation inspected {study.reviewedAt}, at revision {study.revision.slice(0, 7)}. Source inspection and published screens are separate from a live workflow test.</p>
        <ul>{study.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}{source.access === 'private' && ' (access required)'}<FiArrowUpRight /></a></li>)}</ul>
      </details>
    </div>
  );
}
