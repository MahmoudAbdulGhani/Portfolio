import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { profileContent, projectImpactSummaries, siteSections } from "../../shared/site-content.ts";

const prisma = new PrismaClient();
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  const [profile, sections, projects, counts] = await Promise.all([
    prisma.profile.findFirst({ include: { socials: { orderBy: { order: "asc" } }, experience: { orderBy: { order: "asc" } } } }),
    prisma.siteSection.findMany({ where: { key: { in: siteSections.map((section) => section.key) } }, orderBy: { order: "asc" } }),
    prisma.project.findMany({ orderBy: { order: "asc" } }),
    Promise.all([prisma.admin.count(), prisma.message.count(), prisma.rateLimitBucket.count(), prisma.cvConfiguration.count()]),
  ]);
  assert(profile, "Profile is missing");
  for (const key of Object.keys(profileContent)) assert(profile[key] !== null && profile[key] !== undefined, `Profile field ${key} is missing`);
  assert(profile.socials.every((social) => social.platform && Number.isInteger(social.order)), "Social metadata is incomplete");
  assert(sections.length === siteSections.length, `Expected ${siteSections.length} site sections, found ${sections.length}`);
  for (const expected of siteSections) {
    const saved = sections.find((section) => section.key === expected.key);
    assert(saved && saved.order === expected.order, `Section ${expected.key} is missing or out of order`);
  }
  for (const [slug, value] of Object.entries(projectImpactSummaries)) {
    assert(projects.find((project) => project.slug === slug)?.impactSummary === value, `Impact summary verification failed for ${slug}`);
  }
  console.log(JSON.stringify({ verified: true, profileId: profile.id, experience: profile.experience.length, socials: profile.socials.length, sections: sections.map((section) => section.key), projects: projects.map((project) => ({ id: project.id, slug: project.slug, hasImpactSummary: Boolean(project.impactSummary) })), protectedRecordCounts: { admins: counts[0], messages: counts[1], rateLimitBuckets: counts[2], cvConfigurations: counts[3] } }, null, 2));
} finally { await prisma.$disconnect(); }
