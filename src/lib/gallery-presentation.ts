import type { Project } from '../types';
import { galleryCovers } from '../generated/gallery-covers';

// Presentation copy only. Full CMS names still identify case-study links,
// search results and detail pages; no project record is rewritten.
export function galleryTitle(project: Pick<Project, 'slug' | 'name'>) {
  return galleryCovers[project.slug]?.title ?? project.name;
}
