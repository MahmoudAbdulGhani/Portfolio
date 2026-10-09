import type { ReactNode } from 'react';
import { FiPlus } from 'react-icons/fi';
import './case-disclosure.css';

export function CaseDisclosure({ title, description, heading = false, className = '', children }: {
  title: string; description?: string; heading?: boolean; className?: string; children: ReactNode;
}) {
  const label = <><span>{title}{description && <span className="decision-constraint">{description}</span>}</span><FiPlus className="disclosure-indicator" aria-hidden="true" /></>;
  return <details className={`case-disclosure ${className}`}>
    <summary>{heading ? <h3 className="disclosure-label">{label}</h3> : <span className="disclosure-label">{label}</span>}</summary>
    {children}
  </details>;
}
