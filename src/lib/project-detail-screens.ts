import type { Project } from '../types';
import { coverDirections } from '../components/cinematic/project-cover-directions';
import { projectScreens } from './project-presentation';
import { caseStudyFor } from '../../shared/case-study-runtime';

export interface DetailScreen { src: string; label: string; viewport?: 'phone' | 'tablet' }

// Presentation labels describe existing captures; project narrative stays CMS-owned.
const labels: Record<string, string> = {
  '/projects/unihub/usercourses.webp': 'Professor course catalog',
  '/projects/unihub/user.webp': 'Student dashboard',
  '/projects/unihub/Admin.webp': 'Administration dashboard',
  '/projects/unihub/transcipt.webp': 'Student academic transcript',
  '/projects/user-management/dashboard.webp': 'Public platform statistics',
  '/projects/lobby/friends.webp': 'Friends directory',
  '/projects/lobby/audio-room.webp': 'Audio room and chat',
  '/projects/lobby/community-chat.webp': 'Community chat',
  '/projects/lobby/guest-access.webp': 'Guest room access',
  '/projects/lobby/share-room.webp': 'Room invitation and QR code',
  '/projects/lobby/cover.webp': 'Screen sharing in an audio room',
  '/projects/gamezone-arena/user_overview.webp': 'Customer bookings dashboard',
  '/projects/gamezone-arena/choose_Room.webp': 'Choose a gaming room',
  '/projects/gamezone-arena/Booking_date_and_time.webp': 'Booking date and time',
  '/projects/gamezone-arena/select_device.webp': 'Device selection',
  '/projects/gamezone-arena/confirm_and_pay.webp': 'Booking confirmation and payment',
  '/projects/gamezone-arena/admin_overview.webp': 'Arena administration overview',
  '/projects/gamezone-arena/admin_Rooms.webp': 'Room management',
  '/projects/gamezone-arena/admin_Users.webp': 'User management',
  '/projects/gamezone-arena/cover.webp': 'Arena landing page',
  '/projects/cinematic/home-services.webp': 'Home services landing page',
  '/projects/cinematic/medicare-logo.webp': 'Medicare project identity',
  '/projects/cinematic/jobpilot-screen.webp': 'Resume library and upload',
  '/projects/cinematic/cedar-screen.webp': 'Construction portfolio overview',
  '/projects/cinematic/cedar-detail.webp': 'Project details and operations',
  '/projects/cinematic/jobpilot-resume.webp': 'Application CV preview',
  // Inspected public CMS image identities, not positional guesses.
  '710055a0-a275-4e6a-991d-4aaa23c6e549.png': 'Resume library and upload',
  '79bf6e53-1fb5-4453-a438-fb5ead4a4961.png': 'Discover jobs',
  'aba248de-e871-483a-b413-e0db8d4df718.png': 'Saved job and application workspace',
  '8a7fd732-16a0-4b77-a1ad-8ad92e6151f1.png': 'Live voice interview practice',
  'c2dd1975-4f17-4f8d-b6ad-eb071dbc20be.png': 'JobPilot product overview artwork',
  '425768da-66d4-4088-b725-3199711f8784.png': 'Construction portfolio overview',
  'b5279347-d2cd-41a6-ac25-84b2cbf7fe71.png': 'Project details and operations',
  'c6dd1c73-c5dc-4e0c-b30b-3b521d7b5ac5.png': 'Financial reports',
  '88b64d21-f5ad-49ff-8392-5176a9358461.png': 'AI project risk and forecast advisor',
  '3a490b53-ee8b-45a9-99f7-34d394c61ed7.png': 'Cedar public landing page',
};

export function detailScreens(project: Project): DetailScreen[] {
  const originals = project.screenshots?.length ? project.screenshots : [projectScreens[project.slug] || project.coverImage].filter((src): src is string => Boolean(src));
  const sources = [...new Set([...originals, project.coverImage].filter((src): src is string => Boolean(src)))];
  const screens: DetailScreen[] = sources.map(src => {
    const path = src.split(/[?#]/)[0];
    return { src, label: labels[path] ?? labels[path.split('/').at(-1) ?? ''] ?? 'Project image' };
  });
  const responsive = coverDirections[project.slug]?.responsive;
  for (const viewport of ['phone', 'tablet'] as const) {
    const capture = responsive?.[viewport];
    if (capture && !sources.includes(capture.src)) screens.push({ ...capture, viewport });
  }
  if (project.slug === 'full-stack-user-management-system') screens.push({
    src: '/projects/responsive/user-management-phone.webp', label: 'Mobile registration', viewport: 'phone',
  });
  if (project.slug === 'home-services' && caseStudyFor(project)) screens.push({
    src: '/projects/phase2/home-services-mobile-menu.webp', label: 'Mobile navigation on the public demonstration page', viewport: 'phone',
  });
  return screens;
}
