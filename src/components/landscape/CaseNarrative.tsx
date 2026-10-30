import { FiArrowUpRight } from 'react-icons/fi';
import type { CSSProperties } from 'react';
import type { Project } from '../../types';
import { completeScreenSource, screenColumnWidth, screenGeometry, screenSizes, type DetailScreen } from '../../lib/project-detail-screens';
import type { CaseStudy } from '../../../shared/case-study-runtime';
import { selectedContributions, screenMatches } from '../../../shared/case-study-runtime';
import { nonempty, projectDisplayName } from '../../../shared/content-integrity';
import { ScreenshotFrame } from './ScreenshotFrame';
import { CaseDisclosure } from './CaseDisclosure';
import { ProfileBoundary } from './ProfileBoundary';
import { CedarBoundary } from './CedarBoundary';
import { LobbyBoundary } from './LobbyBoundary';
import './case-narrative.css';
import type { CedarState } from './cedar-boundary-state';
import type { LobbyState } from './lobby-boundary-state';
import type { BoundaryState } from './profile-boundary-state';

export function CaseNarrative({ project, study, screens, openGallery, candidate = false, refined = false, supporting, selectedSource, boundaryState, onBoundaryStateChange, cedarState, lobbyState, onCedarStateChange, onLobbyStateChange }: {
  project: Project;
  study: CaseStudy;
  screens: DetailScreen[];
  openGallery: (index: number, trigger: HTMLButtonElement) => void;
  candidate?: boolean;
  refined?: boolean;
  supporting?: { contributionFirst?: boolean; workflowLimit?: number };
  selectedSource?: string;
  cedarState?: CedarState;
  lobbyState?: LobbyState;
  onCedarStateChange?: (state: CedarState) => void;
  onLobbyStateChange?: (state: LobbyState) => void;
  boundaryState?: BoundaryState;
  onBoundaryStateChange?: (state: BoundaryState) => void;
}) {
  const workflow = study.workflow.flatMap(step => {
    const index = step.matches.map(match => screens.findIndex(screen => screenMatches(screen.src, [completeScreenSource(match)]))).find(index => index >= 0) ?? -1;
    const screen = screens[index];
    const image = screen && screenGeometry(screen);
    return screen && image ? [{ ...step, index, screen, image }] : [];
  }).reduce<Array<{ index: number; screen: DetailScreen; image: { width: number; height: number }; explanations: CaseStudy['workflow'] }>>((figures, step) => {
    const existing = figures.find(figure => figure.screen.src === step.screen.src);
    if (existing) existing.explanations.push(step);
    else figures.push({ ...step, explanations: [step] });
    return figures;
  }, []);
  const role = project.myRole?.trim(), ownership = project.ownership?.trim();
  const completeContributions = nonempty(project.contributions);
  const contributions = selectedContributions(project, study);
  const team = nonempty(project.team);
  const hasContribution = Boolean(role || ownership || completeContributions.length);
  const context = <section id="overview" className="story-context">
    <span className="eyebrow">THE CONTEXT</span><h2>{study.problemHeading}</h2><p>{study.problem}</p>
    {candidate && <p>{study.summary}</p>}
    {!supporting && study.designCredit && <p className="story-credit">Design from a supplied <a href={study.designCredit.url} target="_blank" rel="noopener noreferrer">{study.designCredit.label}<FiArrowUpRight /></a>.</p>}
  </section>;
  const workflowFigure = (step: (typeof workflow)[number], index: number) => <figure key={step.screen.src}>
    <figcaption className="workflow-intro">
      <span className="workflow-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
      <div><h3>{step.explanations[0].title}</h3><p>{step.explanations.map((explanation,i)=><span key={explanation.title}>{i>0&&<strong>{explanation.title} </strong>}{explanation.notice}{' '}</span>)}</p></div>
    </figcaption>
    <div className="workflow-details">{selectedSource === step.screen.src ? <a className="text-link" href="#case-image">Inspect the selected image<FiArrowUpRight aria-hidden="true" /></a> : <ScreenshotFrame src={step.screen.src} alt={`${projectDisplayName(project)}: ${step.screen.label}`} label={step.screen.label} ratio={`${step.image.width} / ${step.image.height}`}
      style={{'--frame-max-width':`${screenColumnWidth(step.screen)}px`} as CSSProperties} className="workflow-image" enlarge={trigger=>openGallery(step.index,trigger)} sizes={screenSizes(step.screen)} />}</div>
  </figure>;
  const contribution = hasContribution && <section id="contribution" className="story-contribution">
    <span className="eyebrow">MY CONTRIBUTION</span>
    <h2>My part in the work.</h2>
    {contributions.length > 0 && <ul>{contributions.map(item => <li key={item}>{item}</li>)}</ul>}
    <CaseDisclosure className="story-disclosure" title="Role and collaborators">
      {role && <p>{role}</p>}{ownership && <p>{ownership}</p>}
      {completeContributions.length > 0 && <ul>{completeContributions.map(item => <li key={item}>{item}</li>)}</ul>}
      {team.length > 0 && <><h3>Team</h3><ul>{team.map(member => <li key={member}>{member}</li>)}</ul></>}
    </CaseDisclosure>
  </section>;
  const workflowLimit = supporting?.workflowLimit ?? (candidate ? 2 : workflow.length);
  return (
    <div className={`case-narrative case-narrative-${study.kind}`}>
      {candidate && <section id="engineering" className="jobpilot-defining-decision">
        {!refined&&<><span className="eyebrow">THE DEFINING DECISION</span><h2>{study.engineeringHeading}</h2></>}
        {project.slug === 'jobpilot-ai' ? <ProfileBoundary concise={refined} headingLevel={refined?2:3} initialState={boundaryState} onStateChange={onBoundaryStateChange} /> : project.slug === 'lobby' ? <LobbyBoundary concise={refined} headingLevel={2} initialState={lobbyState} onStateChange={onLobbyStateChange} /> : <CedarBoundary concise={refined} headingLevel={2} initialState={cedarState} onStateChange={onCedarStateChange} />}
      </section>}
      {!candidate && !supporting && context}
      {supporting?.contributionFirst && contribution}
      {workflow.length > 0 && <section id="workflow" className="story-workflow">
        <span className="eyebrow">{study.kind === 'compact' ? 'A CLOSER LOOK' : 'PRODUCT WORKFLOW'}</span>
        <h2>{study.workflowHeading}</h2>
        <div className="workflow-frames">
          {workflow.slice(0,workflowLimit).map(workflowFigure)}
        </div>
        {(candidate || supporting) && workflow.length>workflowLimit&&<CaseDisclosure className="story-disclosure jobpilot-secondary-workflow" title={project.slug === 'jobpilot-ai' ? 'Interview preparation workflow' : project.slug === 'gamezone-arena' ? 'Review the booking before confirmation' : 'More project workflow'}>
          <div className="workflow-frames">{workflow.slice(workflowLimit).map((step,index)=>workflowFigure(step,index+workflowLimit))}</div>
        </CaseDisclosure>}
      </section>}
      {study.flow && study.flowPlacement === 'workflow' && <section id="workflow" className="story-workflow">
        <span className="eyebrow">CODE-PATH WALKTHROUGH</span><h2>{study.workflowHeading}</h2>
        <figure className="decision-path"><h3>{study.flow.title}</h3><ol>{study.flow.steps.map(step => <li key={step}>{step}</li>)}</ol><figcaption>{study.flow.description}</figcaption></figure>
      </section>}
      {!supporting?.contributionFirst && contribution}
      {!hasContribution && team.length > 0 && <section id="team"><h2>Team delivery</h2><ul>{team.map(member => <li key={member}>{member}</li>)}</ul></section>}
      {(candidate || supporting) && <CaseDisclosure className="story-disclosure jobpilot-context" title="Project context">{context}</CaseDisclosure>}
      <section id={candidate ? 'technical-details' : 'engineering'} className="story-engineering">
        <span className="eyebrow">ENGINEERING DECISIONS</span>
        <h2>{candidate ? 'Implementation details' : study.engineeringHeading}</h2>
        {team.length > 1 && <p className="story-evidence-note">These decisions describe the team’s implementation. Individual contributions are listed separately above.</p>}
        {project.slug === 'jobpilot-ai' && !candidate && <ProfileBoundary />}
        {project.slug === 'construction-project-management-accounting-system' && !candidate && <CedarBoundary />}
        {project.slug === 'lobby' && !candidate && <LobbyBoundary />}
        {study.flow && !study.flowPlacement && project.slug !== 'jobpilot-ai' && <figure className="decision-path">
          <h3>{study.flow.title}</h3>
          <ol>{study.flow.steps.map(step => <li key={step}>{step}</li>)}</ol>
          <figcaption>{study.flow.description}</figcaption>
        </figure>}
        <div className="engineering-decisions">{study.decisions.filter(decision => !(project.slug === 'construction-project-management-accounting-system' && decision.sources.includes('advisor')) && !(project.slug === 'lobby' && decision.sources.includes('media'))).map(decision => <CaseDisclosure key={decision.title} heading title={decision.title} description={decision.constraint}>
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
        <p className="story-evidence-note">Explore the project’s stack and implementation below.</p>
        {study.mediaNotes?.map(note => <p className="story-evidence-note" key={note}>{note}</p>)}
        <ul>{study.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}{source.access === 'private' && ' (access required)'}<FiArrowUpRight /></a></li>)}</ul>
      </CaseDisclosure>
    </div>
  );
}
