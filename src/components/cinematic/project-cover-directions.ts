export interface CoverDirection {
  theme: string;
  environment?: string;
  category: string;
  headline: string;
  emphasis: string;
  features: string[];
  screens: { index: number; label: string }[];
}

export const coverDirections: Record<string, CoverDirection> = {
  'jobpilot-ai': {
    theme: 'jobpilot', environment: '/projects/covers/jobpilot-environment.webp', category: 'AI CAREER PLATFORM',
    headline: 'Your next career move,', emphasis: 'prepared.', features: ['Discover', 'Compare', 'Prepare', 'Practise'],
    screens: [{ index: 1, label: 'Discover jobs' }, { index: 0, label: 'Prepare your resume' }, { index: 3, label: 'Practise interviews' }],
  },
  lobby: {
    theme: 'lobby', environment: '/projects/covers/lobby-environment.webp', category: 'REAL-TIME COMMUNICATION',
    headline: 'Good conversations.', emphasis: 'Closer connections.', features: ['Communities', 'Audio rooms', 'Screen sharing'],
    screens: [{ index: 2, label: 'Community chat' }, { index: 1, label: 'Audio rooms' }, { index: 3, label: 'Screen sharing' }],
  },
  'gamezone-arena': {
    theme: 'gamezone', environment: '/projects/covers/gamezone-environment.webp', category: 'GAMING & BOOKING PLATFORM',
    headline: 'Find your arena.', emphasis: 'Make it game time.', features: ['Explore', 'Choose a room', 'Book a session'],
    screens: [{ index: 0, label: 'Explore the arena' }, { index: 1, label: 'Choose your room' }, { index: 2, label: 'Book a session' }],
  },
  'construction-project-management-accounting-system': {
    theme: 'cedar', environment: '/projects/covers/cedar-environment.webp', category: 'CONSTRUCTION MANAGEMENT',
    headline: 'A clearer view of', emphasis: 'every project.', features: ['Projects', 'Operations', 'Accounting'],
    screens: [{ index: 0, label: 'Platform overview' }, { index: 1, label: 'Project overview' }, { index: 2, label: 'Financial reports' }],
  },
  unihub: {
    theme: 'unihub', environment: '/projects/covers/unihub-environment.webp', category: 'UNIVERSITY PLATFORM',
    headline: 'Campus life,', emphasis: 'connected.', features: ['Students', 'Courses', 'Administration'],
    screens: [{ index: 1, label: 'Student dashboard' }, { index: 2, label: 'Course workspace' }, { index: 0, label: 'Administration' }],
  },
};
