import { z } from "zod";

const text = (max, min = 0) => z.string().trim().min(min).max(max);
const nullableText = (max) => z.union([text(max), z.literal(""), z.null()]).optional();
const httpUrl = z.string().trim().max(1000).refine((value) => {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "Only http(s) URLs are allowed.");
const optionalHttpUrl = z.union([z.literal(""), httpUrl, z.null()]).optional();
const publicAsset = z.string().trim().max(1000).refine((value) => {
  if (/^https?:\/\//i.test(value)) return httpUrl.safeParse(value).success;
  return /^\/(?!\/)[^\s\\]*$/.test(value) && !value.split(/[/?#]/).includes("..");
}, "Use an http(s) URL or a safe public path beginning with /.");
const optionalPublicAsset = z.union([z.literal(""), publicAsset, z.null()]).optional();
const id = z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);
const month = z.union([z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), z.literal(""), z.null()]).optional();
const stringArray = (maxItems, maxLength) => z.array(text(maxLength, 1)).max(maxItems);

export const routeIdSchema = id;
export const slugSchema = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const contactSchema = z.object({ name: text(120, 2), email: text(320, 3).email(), subject: text(200).optional().default(""), message: text(5000, 10), website: z.string().max(0).optional().default("") }).strict();
export const loginSchema = z.object({ email: text(320, 3).email(), password: z.string().min(1).max(200) }).strict();
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(10).max(200) }).strict();
export const assistantSchema = z.object({ question: text(600, 1), projectSlug: slugSchema.optional() }).strict();
export const jobMatchSchema = z.object({ jobDescription: text(8000, 80) }).strict();

export const projectMutationSchema = z.object({
  slug: slugSchema.optional(), name: text(160, 1).optional(), type: text(120, 1).optional(), tagline: nullableText(500),
  description: nullableText(2000), overview: nullableText(6000), problem: nullableText(4000), solution: nullableText(4000),
  features: stringArray(40, 1000).optional(), stack: stringArray(40, 120).optional(), team: stringArray(30, 160).optional(),
  program: nullableText(300), github: optionalHttpUrl, demo: optionalHttpUrl, featured: z.boolean().optional(), published: z.boolean().optional(),
  visual: z.string().regex(/^#[0-9a-f]{6}$/i).optional(), order: z.number().int().min(-10000).max(10000).optional(),
  coverImage: optionalPublicAsset, screenshots: z.array(publicAsset).max(12).optional(), myRole: nullableText(300),
  contributions: stringArray(30, 1000).optional(), ownership: nullableText(4000), teamSize: z.union([z.number().int().min(1).max(10000), z.null()]).optional(),
  impactSummary: nullableText(1000), imageAlt: nullableText(500), showOnCv: z.boolean().optional(), showOnPortfolio: z.boolean().optional(),
  cvDescription: nullableText(3000), cvBullets: stringArray(20, 1000).optional(),
}).strict();

const experienceSchema = z.object({
  id: id.optional(), role: text(200).optional(), company: text(200).optional(), description: text(4000).optional(),
  profileId: id.optional(),
  startDate: month, endDate: month, isCurrent: z.boolean().optional(), location: nullableText(300), order: z.number().int().optional(),
  milestone: text(200).optional(), facility: text(200).optional(), meta: text(200).optional(), details: text(4000).optional(),
  workArrangement: nullableText(120), bullets: stringArray(30, 1000).optional(), technologies: stringArray(30, 120).optional(),
  published: z.boolean().optional(), showOnCv: z.boolean().optional(), cvDescription: nullableText(3000), cvBullets: stringArray(30, 1000).optional(),
}).strict().refine((item) => !(item.isCurrent && item.endDate), "Current roles cannot have an end date.");
const socialSchema = z.object({ id: id.optional(), profileId: id.optional(), label: text(80, 1), url: httpUrl,
  platform: text(80).optional(), username: nullableText(160), icon: nullableText(80), order: z.number().int().optional(),
  showInHero: z.boolean().optional(), showInContact: z.boolean().optional(), showInFooter: z.boolean().optional(),
  showOnCv: z.boolean().optional(), published: z.boolean().optional(),
}).strict();
export const profileMutationSchema = z.object({
  name: text(160, 1).optional(), shortName: text(80, 1).optional(), title: text(200, 1).optional(), tagline: text(500).optional(),
  bio: text(6000).optional(), location: text(300).optional(), email: text(320).email().optional(), phone: text(80).optional(),
  photo: optionalPublicAsset, resumeUrl: optionalPublicAsset, languages: nullableText(1000),
  portfolioUrl: optionalHttpUrl, seoTitle: nullableText(200), seoDescription: nullableText(500),
  experience: z.array(experienceSchema).max(50).optional(), socials: z.array(socialSchema).max(20).optional(),
  professionalSummary: nullableText(4000), availabilityStatus: nullableText(200), availabilityText: nullableText(300),
  responseTime: nullableText(200), remoteAvailability: nullableText(200), openToOpportunities: z.boolean().optional(),
  heroLabel: nullableText(200), profileReference: nullableText(200), whatsappNumber: nullableText(80),
  whatsappMessage: nullableText(500), focusAreas: stringArray(20, 120).optional(),
}).strict();
export const siteSectionSchema = z.object({
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{1,79}$/), eyebrow: nullableText(200), heading: nullableText(300),
  description: nullableText(2000), ctaLabel: nullableText(120), ctaUrl: nullableText(1000), visible: z.boolean(),
  order: z.number().int().min(-1000).max(1000), content: z.record(z.string(), z.unknown()),
}).strict();
export const cvMutationSchema = z.object({ professionalSummary: nullableText(4000), header: z.record(z.string(), z.unknown()), application: z.record(z.string(), z.unknown()), master: z.record(z.string(), z.unknown()) }).strict();

export function validationMessage(result, fallback = "Invalid request data.") {
  if (result.success) return undefined;
  const issue = result.error.issues[0];
  return issue?.code === "unrecognized_keys" ? `Unsupported field: ${issue.keys?.[0] ?? "unknown"}.` : fallback;
}
