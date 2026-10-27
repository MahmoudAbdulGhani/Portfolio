import type { ReactNode } from 'react';

export function JobPilotObjectDetail() {
  return <img className="jobpilot-object-detail" src="/landscape/jobpilot-sculpture.webp" alt="" aria-hidden="true" width="144" height="144" />;
}

// Baseline keeps its exact DOM wrapper/order. Candidate changes composition,
// reusing the real screenshot, controls and single project heading.
export function JobPilotPreviewComposition({ candidate, refined = false, identity, actions, intro, image, detail, choices }: {
  candidate: boolean; refined?: boolean; identity?: ReactNode; actions?: ReactNode; intro: ReactNode; image: ReactNode; detail: ReactNode; choices: ReactNode;
}) {
  if(refined)return <div className="selection-frame">{identity}
    <div className="jobpilot-selected-product">{image}<div className="jobpilot-screen-selection"><span className="eyebrow">SCREENS</span>{choices}</div></div>
    {actions}
  </div>;
  return <div className="selection-frame">{candidate ? <>
    {detail}
    <div className="jobpilot-selected-product">{image}<div className="jobpilot-screen-selection"><span className="eyebrow">SCREENS</span>{choices}</div></div>
  </> : <>{intro}{image}{detail}</>}</div>;
}
