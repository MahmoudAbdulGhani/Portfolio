// Captured product artwork only. All narrative, visibility and destinations are CMS-owned.
export const projectScreens: Record<string, string> = {
  "jobpilot-ai": "/projects/cinematic/jobpilot-screen.webp",
  lobby: "/projects/lobby/cover.webp",
  "gamezone-arena": "/projects/gamezone-arena/cover.webp",
  "construction-project-management-accounting-system": "/projects/cinematic/cedar-screen.webp",
  unihub: "/projects/unihub/usercourses.webp",
  "full-stack-user-management-system": "/projects/user-management/dashboard.webp",
  "home-services": "/projects/cinematic/home-services.webp",
  "medicare-hub": "/projects/cinematic/medicare-logo.webp",
};
export const featureGroups: Record<string, { label: string; indices: number[] }[]> = {
  "jobpilot-ai": [
    { label: "Discovery and tracking", indices: [0, 8] },
    { label: "Reviewed candidate information", indices: [1, 2, 3] },
    { label: "Application documents", indices: [5, 6] },
    { label: "Fit, interview and user control", indices: [4, 7, 9] },
  ],
  "construction-project-management-accounting-system": [
    { label: "Projects and relationships", indices: [0, 1, 2, 3, 4, 5] },
    { label: "Purchasing and inventory", indices: [6, 7] },
    { label: "Financial control", indices: [8, 9, 10, 11, 12, 13] },
    { label: "Reporting, access and production", indices: [14, 15, 16, 17, 18, 19] },
  ],
};
