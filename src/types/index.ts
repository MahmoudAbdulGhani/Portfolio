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
  impactSummary?: string | null;
  imageAlt?: string | null;
  showOnCv?: boolean;
  showOnPortfolio?: boolean;
  cvDescription?: string | null;
  cvBullets?: string[];
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
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  published?: boolean;
  showOnCv?: boolean;
  cvDescription?: string | null;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string | null;
  url: string | null;
  order: number;
  issueDate?: string | null;
  expectedDate?: string | null;
  duration?: string | null;
  credentialId?: string | null;
  description?: string | null;
  published?: boolean;
  showOnCv?: boolean;
  cvDescription?: string | null;
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
  workArrangement?: string | null;
  bullets?: string[];
  technologies?: string[];
  published?: boolean;
  showOnCv?: boolean;
  cvDescription?: string | null;
  cvBullets?: string[];
}

export interface SocialLink {
  id?: string;
  label: string;
  url: string;
  platform?: string;
  username?: string | null;
  icon?: string | null;
  order?: number;
  showInHero?: boolean;
  showInContact?: boolean;
  showInFooter?: boolean;
  showOnCv?: boolean;
  published?: boolean;
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
  professionalSummary: string | null;
  availabilityStatus: string | null;
  availabilityText: string | null;
  responseTime: string | null;
  remoteAvailability: string | null;
  openToOpportunities: boolean;
  heroLabel: string | null;
  profileReference: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  focusAreas: string[];
}

export interface SiteSection {
  key: string;
  eyebrow: string | null;
  heading: string | null;
  description: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  visible: boolean;
  order: number;
  content: Record<string, unknown>;
  updatedAt?: string;
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
