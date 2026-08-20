import { PrismaClient } from "@prisma/client";
import { CONTENT_MIGRATION_VERSION, profileContent, projectImpactSummaries, siteSections } from "../../shared/site-content";

const prisma = new PrismaClient();

const socialDefaults = (label: string, index: number) => {
  const platform = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "link";
  return { platform, icon: platform, order: index, showInHero: true, showInContact: true, showInFooter: true, showOnCv: /github|linkedin/i.test(label), published: true };
};
const mergeMissing = (current: unknown, defaults: unknown): unknown => {
  if (!current || typeof current !== "object" || Array.isArray(current) || !defaults || typeof defaults !== "object" || Array.isArray(defaults)) return current ?? defaults;
  const merged = { ...(current as Record<string, unknown>) };
  for (const [key, value] of Object.entries(defaults as Record<string, unknown>)) merged[key] = key in merged ? mergeMissing(merged[key], value) : value;
  return merged;
};

async function main() {
  const profile = await prisma.profile.findFirst({ include: { socials: { orderBy: { id: "asc" } } } });
  if (!profile) throw new Error("Portfolio profile not found; migration stopped.");

  const marker = await prisma.siteSection.findUnique({ where: { key: `_migration:${CONTENT_MIGRATION_VERSION}` } });
  const profileUpdate = Object.fromEntries(Object.entries(profileContent).filter(([key, value]) => {
    const current = profile[key as keyof typeof profile];
    return current == null || current === "" || (Array.isArray(current) && current.length === 0) || (typeof current === "boolean" && key === "openToOpportunities" && value === true);
  }));
  await prisma.profile.update({ where: { id: profile.id }, data: profileUpdate });

  for (const [index, social] of profile.socials.entries()) {
    const url = new URL(social.url);
    const username = url.pathname.split("/").filter(Boolean).at(-1) ?? url.hostname;
    await prisma.socialLink.update({ where: { id: social.id }, data: { ...socialDefaults(social.label, index), username } });
  }

  for (const section of siteSections) {
    const existing = await prisma.siteSection.findUnique({ where: { key: section.key } });
    await prisma.siteSection.upsert({
      where: { key: section.key },
      update: existing ? { eyebrow: existing.eyebrow ?? section.eyebrow, heading: existing.heading ?? section.heading, description: existing.description ?? section.description, ctaLabel: existing.ctaLabel ?? section.ctaLabel, ctaUrl: existing.ctaUrl ?? section.ctaUrl, content: mergeMissing(existing.content, section.content) } : {},
      create: { ...section, visible: true },
    });
  }

  for (const [slug, impactSummary] of Object.entries(projectImpactSummaries)) {
    await prisma.project.updateMany({ where: { slug, impactSummary: null }, data: { impactSummary } });
  }

  if (!marker) await prisma.siteSection.create({
    data: { key: `_migration:${CONTENT_MIGRATION_VERSION}`, visible: false, order: 9999, content: { appliedAt: new Date().toISOString() } },
  });

  const [savedProfile, savedSections, savedProjects] = await Promise.all([
    prisma.profile.findUnique({ where: { id: profile.id }, include: { socials: { orderBy: { order: "asc" } } } }),
    prisma.siteSection.findMany({ where: { key: { in: siteSections.map((section) => section.key) } }, orderBy: { order: "asc" } }),
    prisma.project.findMany({ where: { slug: { in: Object.keys(projectImpactSummaries) } }, select: { id: true, slug: true, impactSummary: true } }),
  ]);
  console.log(JSON.stringify({ status: "applied-and-verified", version: CONTENT_MIGRATION_VERSION, profileId: savedProfile?.id, socialCount: savedProfile?.socials.length, sectionKeys: savedSections.map((section) => section.key), projectImpacts: savedProjects }, null, 2));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
