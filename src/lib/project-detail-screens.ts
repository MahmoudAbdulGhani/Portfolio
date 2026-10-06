import type { Project } from '../types';
import { coverDirections } from '../components/cinematic/project-cover-directions';
import { projectScreens } from './project-presentation';

export interface DetailScreen { src: string; label: string; viewport?: 'phone' | 'tablet' }

// Presentation labels describe existing captures; project narrative stays CMS-owned.
const labels: Record<string, string> = {
  'usercourses.webp': 'Student courses', 'user.webp': 'User portal',
  'Admin.webp': 'Admin portal', 'dashboard.webp': 'Dashboard',
  'community-chat.webp': 'Community chat', 'guest-access.webp': 'Guest rooms',
  'choose_Room.webp': 'Choose a room', 'Booking_date_and_time.webp': 'Date and time',
  'select_device.webp': 'Select a device', 'confirm_and_pay.webp': 'Confirm and pay',
  'medicare-logo.webp': 'Project identity',
};

export function detailScreens(project: Project): DetailScreen[] {
  const originals = project.screenshots?.length ? project.screenshots : [projectScreens[project.slug] || project.coverImage].filter((src): src is string => Boolean(src));
  const directions = coverDirections[project.slug]?.screens ?? [];
  const sources = [...new Set([...originals, project.coverImage].filter((src): src is string => Boolean(src)))];
  const screens: DetailScreen[] = sources.map((src, index) => ({ src, label: labels[src.split('/').at(-1) ?? '']
    ?? directions.find(screen => screen.index === index)?.label
    ?? ({ 'jobpilot-ai': ['Prepare your resume', 'Discover jobs', 'Application workspace', 'Practise interviews'], 'construction-project-management-accounting-system': ['Platform overview', 'Project overview', 'Financial reports', 'Project operations'] } as Record<string, string[]>)[project.slug]?.[index]
    ?? (src === project.coverImage ? 'Project cover' : `Screen ${String(index + 1).padStart(2, '0')}`) }));
  const responsive = coverDirections[project.slug]?.responsive;
  for (const viewport of ['phone', 'tablet'] as const) {
    const capture = responsive?.[viewport];
    if (capture && !sources.includes(capture.src)) screens.push({ ...capture, viewport });
  }
  if (project.slug === 'full-stack-user-management-system') screens.push({
    src: '/projects/responsive/user-management-phone.webp', label: 'Mobile registration', viewport: 'phone',
  });
  return screens;
}
