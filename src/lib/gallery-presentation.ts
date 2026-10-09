import type { Project } from '../types';
import { projectDisplayName } from '../../shared/content-integrity';

// All visible project titles share the same presentation rule. Search retains
// the full CMS name, and identifiers and destinations remain unchanged.
export function galleryTitle(project: Pick<Project, 'slug' | 'name'>) {
  return projectDisplayName(project);
}
