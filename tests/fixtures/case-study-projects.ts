import type { Project } from '../../src/types';

// Synthetic CMS attribution and remote image responses for contract/UI tests.
// Public-snapshot visual review is separate and uses the actual published media.
const entries = [
  ['jobpilot-ai', 'JobPilot AI', 'MahmoudAbdulGhani/jobpilot-ai', ['710055a0-a275-4e6a-991d-4aaa23c6e549.png', '79bf6e53-1fb5-4453-a438-fb5ead4a4961.png', 'aba248de-e871-483a-b413-e0db8d4df718.png', '8a7fd732-16a0-4b77-a1ad-8ad92e6151f1.png']],
  ['construction-project-management-accounting-system', 'Construction Project Management & Accounting System', 'MahmoudAbdulGhani/Construction-Project-Management-Accounting-System', ['425768da-66d4-4088-b725-3199711f8784.png', 'b5279347-d2cd-41a6-ac25-84b2cbf7fe71.png', 'c6dd1c73-c5dc-4e0c-b30b-3b521d7b5ac5.png', '88b64d21-f5ad-49ff-8392-5176a9358461.png']],
  ['lobby', 'Lobby', 'Ahmad-khalaf517/lobby', ['/projects/lobby/cover.webp', '/projects/lobby/guest-access.webp', '/projects/lobby/share-room.webp', '/projects/lobby/audio-room.webp']],
  ['gamezone-arena', 'GameZone Arena', 'MahmoudAbdulGhani/Gaming-Arena-Reservation-System', ['/projects/gamezone-arena/choose_Room.webp', '/projects/gamezone-arena/Booking_date_and_time.webp', '/projects/gamezone-arena/select_device.webp', '/projects/gamezone-arena/confirm_and_pay.webp']],
  ['unihub', 'UniHub', 'MahmoudAbdulGhani/university-management-system', ['/projects/unihub/user.webp', '/projects/unihub/transcipt.webp', '/projects/unihub/usercourses.webp']],
  ['full-stack-user-management-system', 'Full-Stack User Management System', 'MahmoudAbdulGhani/fastapi-user-management', ['/projects/user-management/dashboard.webp']],
  ['medicare-hub', 'Medicare Hub', 'MahmoudAbdulGhani/Clinic-management-system', ['/projects/cinematic/medicare-logo.webp']],
  ['home-services', 'Home Services', 'MahmoudAbdulGhani/home-services', ['/projects/cinematic/home-services.webp']],
] as const;

export const caseStudyProjects: Project[] = entries.map(([slug, name, repo, media], index) => {
  const unattributed = ['medicare-hub', 'home-services'].includes(slug);
  const independent = ['jobpilot-ai', 'full-stack-user-management-system'].includes(slug);
  const images = media.map(src => src.startsWith('/') ? src : `https://screens.example.test/${slug}/${src}`);
  return {
    id: slug, slug, name, type: 'Synthetic test project', tagline: 'Legacy fixture tagline',
    description: 'Legacy fixture description', overview: 'Legacy fixture overview', problem: 'Legacy fixture problem', solution: 'Legacy fixture solution',
    features: ['Legacy fixture feature'], stack: ['TypeScript', 'PostgreSQL'], github: `https://github.com/${repo}`, demo: 'https://demo.example.test/',
    published: true, featured: index < 3, showOnPortfolio: true, visual: '', coverImage: images[0], screenshots: images,
    myRole: unattributed ? '' : 'Documented fixture role', ownership: unattributed ? '' : 'Documented fixture ownership',
    contributions: unattributed ? [] : Array.from({ length: 14 }, (_, i) => `Documented contribution ${i + 1}`),
    team: unattributed ? [] : independent ? ['Test owner'] : ['Test owner', 'Documented colleague'], teamSize: unattributed ? undefined : independent ? 1 : 2,
    order: index, views: 0, createdAt: '2026-01-01', updatedAt: '2026-10-09',
  };
});
