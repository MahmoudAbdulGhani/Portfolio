import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import type { CapabilityGroup } from '../../../shared/content-integrity-runtime.js';
import type { Project } from '../../types';
import { CaseDisclosure } from './CaseDisclosure';
import { groupedProfileEvidence } from './profile-evidence';

export function ProfileCapabilities({ capabilities, projects }: { capabilities: CapabilityGroup[]; projects: Project[] }) {
  const evidence = groupedProfileEvidence(capabilities, projects);
  return <>
    {['languages', 'frameworks', 'databases', 'ops', 'skills']
      .filter(category => capabilities.some(item => item.category === category))
      .map((category, index) => <div className="capability-category" key={category} data-capability-category={category}>
        <h2><span className="record-number">{String(index + 1).padStart(2, '0')}</span>{category === 'ops' ? 'Operations' : category === 'skills' ? 'Practices' : category}</h2>
        <ul className="capability-summary">
          {capabilities.filter(item => item.category === category).map(item => <li key={item.key} data-competency={item.key}>
            <span>{item.name}{item.details.length > 0 && <span className="competency-detail"> — {item.details.join(', ')}</span>}</span>
          </li>)}
        </ul>
      </div>)}
    {(evidence.primary.length > 0 || evidence.additional.length > 0) && <section className="profile-engineering-evidence" aria-label="Project evidence">
      <h2>Engineering evidence</h2>
      <p className="capability-evidence-note">Project references describe documented work and its contribution scope.</p>
      {evidence.primary.map(project => <article className="profile-evidence-row" key={project.slug} data-evidence-project={project.slug}>
        <span className="record-number">{project.number}</span>
        <div>
          <h3>{project.name}</h3>
          <span className="profile-evidence-scope">{project.scope}</span>
          <p>{project.explanation}</p>
          <p className="profile-evidence-associations">Related capabilities: {project.competencies.join(', ')}.</p>
          <Link className="text-link profile-evidence-link" to={project.href}>{project.boundary}<FiArrowUpRight aria-hidden="true" /></Link>
        </div>
      </article>)}
      {evidence.additional.length > 0 && <CaseDisclosure className="profile-additional-evidence" title="Additional project evidence">
        <ul>
          {evidence.additional.map(project => <li key={project.slug} data-evidence-project={project.slug}>
            <span className="profile-evidence-scope">{project.scope}</span>
            <Link className="text-link profile-evidence-link" to={project.href}>{project.number && `${project.number} `}{project.name}<FiArrowUpRight aria-hidden="true" /></Link>
            <p className="profile-evidence-associations">Related capabilities: {project.competencies.join(', ')}.</p>
          </li>)}
        </ul>
      </CaseDisclosure>}
    </section>}
  </>;
}
