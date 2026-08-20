export type TechCategory = "languages" | "frameworks" | "databases" | "ops";

export interface Project {
  id: string;
  slug: string;
  name: string;
  type: string;
  tagline: string | null;
  description: string | null;
  overview: string | null;
  problem: string | null;
  solution: string | null;
  features: string[];
  stack: string[];
  team?: string[] | null;
  program?: string | null;
  github?: string | null;
  demo?: string | null;
  featured: boolean;
  published: boolean;
  visual: string;
  coverImage?: string | null;
  screenshots?: string[];
  myRole?: string | null;
  contributions?: string[];
  ownership?: string | null;
  teamSize?: number | null;
  order: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  status: "verified" | "familiar" | "learning";
  order: number;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string | null;
  period: string | null;
  details: string | null;
  order: number;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string | null;
  url: string | null;
  order: number;
}

export interface ExperienceItem {
  id?: string;
  milestone?: string;
  facility?: string;
  meta?: string;
  details?: string;
  role?: string | null;
  company?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  location?: string | null;
  order?: number;
}

export interface SocialLink {
  id?: string;
  label: string;
  url: string;
}

export interface Profile {
  id: string;
  name: string;
  shortName: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  photo: string | null;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  languages: string | null;
  experience: ExperienceItem[];
  socials: SocialLink[];
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AnalyticsSummary {
  totalProjects: number;
  publishedProjects: number;
  totalSkills: number;
  unreadMessages: number;
  totalViews: number;
  viewsByProject: { name: string; slug: string; views: number }[];
  recentMessages: Message[];
}

export interface AssistantResponse {
  answer: string;
}
