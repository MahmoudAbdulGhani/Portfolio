export interface CoverDirection {
  screens: { index: number; label: string }[];
  responsive?: Partial<Record<'phone' | 'tablet', { src: string; label: string }>>;
}

// These indices select the actual CMS screenshots; no promotional artwork is
// substituted for a product interface. Each screenshot owns one device.
export const coverDirections: Record<string, CoverDirection> = {
  'jobpilot-ai': {
    screens: [{ index: 1, label: 'Discover jobs' }, { index: 0, label: 'Prepare your resume' }, { index: 3, label: 'Practise interviews' }],
    responsive: {
      phone: { src: '/projects/responsive/jobpilot-phone.webp', label: 'Mobile welcome and application workflow' },
      tablet: { src: '/projects/responsive/jobpilot-tablet.webp', label: 'Tablet application workflow' },
    },
  },
  lobby: {
    screens: [{ index: 2, label: 'Community chat' }, { index: 1, label: 'Audio rooms' }, { index: 3, label: 'Screen sharing' }],
    responsive: {
      phone: { src: '/projects/responsive/lobby-phone.webp', label: 'Mobile welcome and workspace preview' },
      tablet: { src: '/projects/responsive/lobby-tablet.webp', label: 'Tablet welcome and workspace preview' },
    },
  },
  'gamezone-arena': {
    screens: [{ index: 0, label: 'Explore the arena' }, { index: 1, label: 'Choose your room' }, { index: 2, label: 'Book a session' }],
    responsive: {
      phone: { src: '/projects/responsive/gamezone-phone.webp', label: 'Mobile gaming rooms' },
      tablet: { src: '/projects/responsive/gamezone-tablet.webp', label: 'Tablet gaming rooms' },
    },
  },
  'construction-project-management-accounting-system': {
    screens: [{ index: 0, label: 'Platform overview' }, { index: 1, label: 'Project overview' }, { index: 2, label: 'Financial reports' }],
    responsive: {
      phone: { src: '/projects/responsive/cedar-phone.webp', label: 'Mobile public landing page' },
      tablet: { src: '/projects/responsive/cedar-tablet.webp', label: 'Tablet public landing page' },
    },
  },
  unihub: {
    screens: [{ index: 1, label: 'Student dashboard' }, { index: 2, label: 'Course workspace' }, { index: 0, label: 'Administration' }],
    responsive: {
      phone: { src: '/projects/responsive/unihub-phone.webp', label: 'Mobile student registration' },
      tablet: { src: '/projects/responsive/unihub-tablet.webp', label: 'Tablet sign in' },
    },
  },
};

// Keep CMS originals available in the gallery and append genuine viewport
// captures. Device clicks and gallery navigation share this exact ordering.
export function projectPreviewImages(project: { slug: string; screenshots?: string[]; coverImage?: string | null }) {
  const originals = project.screenshots?.length ? project.screenshots : project.coverImage ? [project.coverImage] : [];
  const responsive = coverDirections[project.slug]?.responsive;
  return [...originals, ...(['phone', 'tablet'] as const).flatMap(kind => responsive?.[kind] ? [responsive[kind].src] : [])];
}
