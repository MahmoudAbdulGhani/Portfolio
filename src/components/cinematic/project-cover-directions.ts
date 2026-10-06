export interface CoverDirection {
  screens: { index: number; label: string }[];
}

// These indices select the actual CMS screenshots; no promotional artwork is
// substituted for a product interface. Each screenshot owns one device.
export const coverDirections: Record<string, CoverDirection> = {
  'jobpilot-ai': { screens: [{ index: 1, label: 'Discover jobs' }, { index: 0, label: 'Prepare your resume' }, { index: 3, label: 'Practise interviews' }] },
  lobby: { screens: [{ index: 2, label: 'Community chat' }, { index: 1, label: 'Audio rooms' }, { index: 3, label: 'Screen sharing' }] },
  'gamezone-arena': { screens: [{ index: 0, label: 'Explore the arena' }, { index: 1, label: 'Choose your room' }, { index: 2, label: 'Book a session' }] },
  'construction-project-management-accounting-system': { screens: [{ index: 0, label: 'Platform overview' }, { index: 1, label: 'Project overview' }, { index: 2, label: 'Financial reports' }] },
  unihub: { screens: [{ index: 1, label: 'Student dashboard' }, { index: 2, label: 'Course workspace' }, { index: 0, label: 'Administration' }] },
};
