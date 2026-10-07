// Optional CMS presentation fields. The CMS editor exposes these defaults so
// copy and selection remain editable; profile and project facts stay API-owned.
export const presentationDefaults: Record<string, Record<string, unknown>> = {
  hero: {
    offerDescription: 'Websites, web applications and APIs built around your business.',
    projectCtaLabel: 'Start a project',
    workCtaLabel: 'View selected work',
    capabilities: [
      { title: 'Websites & landing pages', shortTitle: 'Websites', description: 'Responsive interfaces with clear content and purposeful interaction.' },
      { title: 'Full-stack applications', shortTitle: 'Applications', description: 'Connected workflows, secure accounts and persistent data.' },
      { title: 'APIs & integrations', shortTitle: 'APIs', description: 'Backend services and integrations that connect your tools.' },
    ],
  },
  featuredProjects: { featuredSlugs: ['jobpilot-ai', 'construction-project-management-accounting-system', 'lobby'] },
  contact: { projectCtaLabel: 'Start a project', projectHeading: 'Have a project in mind?', projectDescription: 'Tell me what you want to build. Share the scope, goals and any timeline you have in mind.' },
};

export function presentationContent(key: string, content?: Record<string, unknown>) {
  return { ...presentationDefaults[key], ...content };
}

export function contentText(content: Record<string, unknown>, key: string) {
  return typeof content[key] === 'string' ? content[key] as string : '';
}
