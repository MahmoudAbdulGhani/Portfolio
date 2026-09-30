/**
 * One-off migration: syncs the application CV content in the database to match
 * the reference PDF, using shared/portfolio-data.ts as the source of truth.
 *
 * The static data already renders to a byte-faithful match against the
 * reference, so copying it into the database is what makes the *deployed*
 * (admin-editable) CV match. Nothing is deleted: existing rows are reused when
 * the name matches exactly, and new rows are created otherwise.
 *
 * Usage:
 *   node --env-file=server/.env server/scripts/sync-cv-content.mjs --dry-run
 *   node --env-file=server/.env server/scripts/sync-cv-content.mjs
 */
import { writeFile } from "node:fs/promises";
import { prisma } from "../src/lib/prisma.js";
import {
  DEFAULT_SECTION_TITLES,
  DEFAULT_SECTIONS,
} from "../src/lib/cv-config.js";
import {
  certificationsData,
  educationData,
  profileData,
  projectsData,
  skillsData,
} from "../../shared/portfolio-data.ts";

const dryRun = process.argv.includes("--dry-run");
const APPLICATION_PROJECTS = ["jobpilot-ai", "lobby", "gamezone-arena"];

const say = (line = "") => console.log(line);

// ---------------------------------------------------------------- backup ----
const backup = {
  takenAt: new Date().toISOString(),
  profile: await prisma.profile.findFirst(),
  experience: await prisma.experience.findMany({ orderBy: { order: "asc" } }),
  projects: await prisma.project.findMany({ orderBy: { order: "asc" } }),
  skills: await prisma.skill.findMany({ orderBy: { order: "asc" } }),
  education: await prisma.education.findMany({ orderBy: { order: "asc" } }),
  certifications: await prisma.certification.findMany({
    orderBy: { order: "asc" },
  }),
  cvConfiguration: await prisma.cvConfiguration.findUnique({
    where: { id: "default" },
  }),
};

const backupPath = `C:/Users/Admin/AppData/Local/Temp/opencode/cv-backup-${Date.now()}.json`;
await writeFile(backupPath, JSON.stringify(backup, null, 2));

say("=== BACKUP ===");
say(`  written to ${backupPath}`);
say(
  `  captured profile(1) experience(${backup.experience.length}) projects(${backup.projects.length}) ` +
    `skills(${backup.skills.length}) education(${backup.education.length}) ` +
    `certifications(${backup.certifications.length}) cvConfiguration(1)`,
);
say();

// ------------------------------------------------------------------ plan ----
const changes = [];
const record = (group, target, field, from, to) => {
  if (JSON.stringify(from) === JSON.stringify(to)) return;
  changes.push({ group, target, field, from, to });
};

say("=== PROFILE ===");
const profile = backup.profile;
record("profile", "profile", "professionalSummary", profile.professionalSummary, profileData.professionalSummary);
record("profile", "profile", "languages", profile.languages, profileData.languages);
say(`  professionalSummary -> ${JSON.stringify(profileData.professionalSummary).slice(0, 70)}...`);
say(`  languages           -> ${JSON.stringify(profileData.languages)}`);

// experience ---------------------------------------------------------------
say();
say("=== EXPERIENCE ===");
const experiencePlan = [];
for (const source of profileData.experience) {
  const target = backup.experience.find(
    (row) => row.role === source.role || row.milestone === source.milestone,
  );
  if (!target) {
    say(`  ${source.role}: NO MATCHING ROW (skipped)`);
    continue;
  }
  const fields = {
    role: source.role,
    milestone: source.milestone,
    company: source.company ?? source.facility,
    facility: source.facility,
    meta: source.meta,
    location: source.location,
    startDate: source.startDate,
    endDate: source.endDate,
    isCurrent: source.isCurrent,
    details: source.details,
    // The static data has no cvBullets for the short non-application roles.
    // Leave whatever the admin has rather than blanking it.
    cvBullets: source.cvBullets ?? target.cvBullets,
    showOnCv: true,
  };
  for (const [field, to] of Object.entries(fields)) {
    record("experience", target.id, field, target[field], to);
  }
  const bulletDelta = (target.cvBullets?.length ?? 0) - (source.cvBullets?.length ?? 0);
  say(
    `  ${target.id}  ${source.role}\n` +
      `      meta    ${JSON.stringify(target.meta)} -> ${JSON.stringify(source.meta)}\n` +
      `      company ${JSON.stringify(target.company)} -> ${JSON.stringify(fields.company)}\n` +
      `      bullets ${target.cvBullets?.length ?? 0} -> ${source.cvBullets?.length ?? 0} (${bulletDelta >= 0 ? "+" : ""}${bulletDelta})`,
  );
  experiencePlan.push(target.id);
}
const applicationExperience = experiencePlan.slice(0, 2);

// projects -----------------------------------------------------------------
say();
say("=== PROJECTS (application set) ===");
const projectIds = [];
for (const slug of APPLICATION_PROJECTS) {
  const source = projectsData.find((item) => item.slug === slug);
  const target = backup.projects.find((row) => row.slug === slug);
  if (!source || !target) {
    say(`  ${slug}: ${!source ? "NOT IN STATIC DATA" : "NOT IN DATABASE"} (skipped)`);
    continue;
  }
  const fields = {
    name: source.name,
    cvDescription: source.cvDescription ?? null,
    cvBullets: source.cvBullets ?? [],
    github: source.github,
    demo: source.demo,
  };
  for (const [field, to] of Object.entries(fields)) {
    record("project", target.id, field, target[field], to);
  }
  say(
    `  ${slug} (${target.id})\n` +
      `      name     ${JSON.stringify(target.name)} -> ${JSON.stringify(source.name)}\n` +
      `      desc     ${JSON.stringify((target.cvBullets?.[0] ?? "").slice(0, 58))}\n` +
      `         -> ${JSON.stringify((fields.cvBullets[0] ?? "").slice(0, 58))}\n` +
      `      links    github=${target.github ? "y" : "n"} demo=${target.demo ? "y" : "n"}` +
      ` -> github=${source.github ? "y" : "n"} demo=${source.demo ? "y" : "n"}`,
  );
  projectIds.push(target.id);
}

// skills -------------------------------------------------------------------
say();
say(`=== SKILLS (${skillsData.length} reference skills) ===`);
const skillIds = [];
const createdSkills = [];
const reusedSkills = [];
const nearDuplicates = [];
for (const [index, source] of skillsData.entries()) {
  const exact = backup.skills.find((row) => row.name === source.name);
  if (exact) {
    record("skill", exact.id, "category", exact.category, source.category);
    reusedSkills.push(exact);
    skillIds.push(exact.id);
    continue;
  }
  const similar = backup.skills.find((row) => {
    const a = row.name.toLowerCase();
    const b = source.name.toLowerCase();
    return a === b || a.startsWith(b) || b.startsWith(a);
  });
  if (similar) nearDuplicates.push({ reference: source.name, existing: similar.name });
  const created = { name: source.name, category: source.category, status: "verified", order: index };
  skillIds.push(`(new) ${source.name}`);
  createdSkills.push(created);
}
const byCat = new Map();
for (const source of skillsData) {
  if (!byCat.has(source.category)) byCat.set(source.category, []);
  byCat.get(source.category).push(source.name);
}
for (const [category, names] of byCat) {
  const newCount = names.filter((n) => !backup.skills.some((r) => r.name === n)).length;
  say(
    `  ${category.padEnd(22)} ${String(names.length).padStart(2)} skills` +
      (newCount ? `  (${newCount} new rows)` : "  (reused)"),
  );
}
say(`  reused existing rows : ${reusedSkills.length}`);
say(`  new rows to create   : ${createdSkills.length}`);
if (nearDuplicates.length) {
  say(`  near-duplicate names (existing row left untouched, new row added):`);
  for (const item of nearDuplicates) say(`      ${item.existing}  ->  ${item.reference}`);
}

// education ----------------------------------------------------------------
say();
say("=== EDUCATION ===");
const educationIds = [];
for (const source of educationData) {
  const target = backup.education.find(
    (row) => row.school === source.school || row.degree === source.degree,
  );
  if (!target) {
    say(`  ${source.degree}: NO MATCHING ROW (skipped)`);
    continue;
  }
  const fields = {
    school: source.school,
    degree: source.degree,
    field: source.field,
    period: source.period,
    details: source.details,
    showOnCv: true,
  };
  for (const [field, to] of Object.entries(fields)) {
    record("education", target.id, field, target[field], to);
  }
  say(`  ${target.id}  ${source.degree}`);
  say(`      period ${JSON.stringify(target.period)} -> ${JSON.stringify(source.period)}`);
  educationIds.push(target.id);
}

// certifications ----------------------------------------------------------
say();
say("=== CERTIFICATIONS (application set only) ===");
const certificationIds = [];
// Only the certification the application CV renders is synced. The other rows
// are admin-owned content that the reference CV never shows.
const applicationCerts = certificationsData.filter((item) =>
  /aws|re\/start/i.test(item.title),
);
for (const source of applicationCerts) {
  const row = await prisma.certification.findUnique({ where: { id: source.id } });
  if (!row) {
    say(`  ${source.id}: NOT IN DATABASE (skipped)`);
    continue;
  }
  const fields = { title: source.title, issuer: source.issuer, year: source.year };
  for (const [field, to] of Object.entries(fields)) {
    record("certification", row.id, field, row[field], to);
  }
  say(`  ${row.id}  ${source.title.slice(0, 58)}`);
  if (row.title !== source.title)
    say(
      `      title ${JSON.stringify(row.title)}\n         -> ${JSON.stringify(source.title)}`,
    );
  if (row.year !== source.year)
    say(`      year  ${JSON.stringify(row.year)} -> ${JSON.stringify(source.year)}`);
  certificationIds.push(row.id);
}

// ---------------------------------------------------------------- config ----
const languages = String(profileData.languages ?? "")
  .split(/[,;|]/)
  .map((value) => value.trim())
  .filter(Boolean);

const application = {
  experience: applicationExperience,
  projects: projectIds,
  skills: skillIds,
  education: educationIds,
  certifications: certificationIds,
  languages,
  projectOverrides: {},
  experienceOverrides: {},
  educationOverrides: {},
  certificationOverrides: {},
  skillCategoryOverrides: {},
  cvOnlySkills: [],
  sections: [...DEFAULT_SECTIONS],
  sectionTitles: { ...DEFAULT_SECTION_TITLES },
};

say();
say("=== CV CONFIGURATION (application mode) ===");
const current = backup.cvConfiguration?.application;
for (const key of ["experience", "projects", "skills", "education", "certifications", "languages", "sections"]) {
  const before = JSON.stringify(current?.[key]);
  const after = JSON.stringify(application[key]);
  if (before !== after) {
    record("config", "default.application", key, current?.[key], application[key]);
    say(`  ${key}:`);
    say(`      before ${(before ?? "null").slice(0, 120)}`);
    say(`      after  ${after.slice(0, 120)}`);
  }
}
const beforeTitles = JSON.stringify(current?.sectionTitles);
const afterTitles = JSON.stringify(application.sectionTitles);
if (beforeTitles !== afterTitles) {
  record("config", "default.application", "sectionTitles", current?.sectionTitles, application.sectionTitles);
  say(`  sectionTitles:`);
  say(`      before ${beforeTitles}`);
  say(`      after  ${afterTitles}`);
}
record(
  "config",
  "default",
  "professionalSummary",
  backup.cvConfiguration?.professionalSummary,
  profileData.professionalSummary,
);

say();
say(`=== ${changes.length} FIELD CHANGES ===`);
const grouped = new Map();
for (const change of changes) {
  if (!grouped.has(change.group)) grouped.set(change.group, []);
  grouped.get(change.group).push(change);
}
for (const [group, items] of grouped) {
  say(`  ${group}: ${items.length}`);
  for (const item of items) say(`      ${item.target}.${item.field}`);
}

// ----------------------------------------------------------------- apply ----
if (dryRun) {
  say();
  say("DRY RUN - nothing written to the database.");
  await prisma.$disconnect();
  process.exit(0);
}

say();
say("=== APPLYING ===");

await prisma.profile.updateMany({
  where: { id: profile.id },
  data: {
    professionalSummary: profileData.professionalSummary,
    languages: profileData.languages,
  },
});
say("  profile updated");

for (const source of profileData.experience) {
  const target = backup.experience.find(
    (row) => row.role === source.role || row.milestone === source.milestone,
  );
  if (!target) continue;
  await prisma.experience.update({
    where: { id: target.id },
    data: {
      role: source.role,
      milestone: source.milestone,
      company: source.company ?? source.facility,
      facility: source.facility,
      meta: source.meta,
      location: source.location,
      startDate: source.startDate,
      endDate: source.endDate,
      isCurrent: source.isCurrent,
      details: source.details,
      cvBullets: source.cvBullets ?? target.cvBullets,
      showOnCv: true,
    },
  });
  say(`  experience ${target.id} updated`);
}

for (const slug of APPLICATION_PROJECTS) {
  const source = projectsData.find((item) => item.slug === slug);
  const target = backup.projects.find((row) => row.slug === slug);
  if (!source || !target) continue;
  await prisma.project.update({
    where: { id: target.id },
    data: {
      name: source.name,
      cvDescription: source.cvDescription ?? null,
      cvBullets: source.cvBullets ?? [],
      github: source.github,
      demo: source.demo,
    },
  });
  say(`  project ${slug} updated`);
}

const finalSkillIds = [];
for (const [index, source] of skillsData.entries()) {
  const existing = await prisma.skill.findUnique({ where: { name: source.name } });
  if (existing) {
    await prisma.skill.update({
      where: { id: existing.id },
      data: { category: source.category, status: "verified" },
    });
    finalSkillIds.push(existing.id);
  } else {
    const created = await prisma.skill.create({
      data: {
        name: source.name,
        category: source.category,
        status: "verified",
        order: index,
      },
    });
    finalSkillIds.push(created.id);
  }
}
say(`  skills synced (${finalSkillIds.length} rows for the application)`);

for (const source of educationData) {
  const target = backup.education.find(
    (row) => row.school === source.school || row.degree === source.degree,
  );
  if (!target) continue;
  await prisma.education.update({
    where: { id: target.id },
    data: {
      school: source.school,
      degree: source.degree,
      field: source.field,
      period: source.period,
      details: source.details,
      showOnCv: true,
    },
  });
  say(`  education ${target.id} updated`);
}

for (const source of applicationCerts) {
  const row = await prisma.certification.findUnique({ where: { id: source.id } });
  if (!row) continue;
  await prisma.certification.update({
    where: { id: row.id },
    data: { title: source.title, issuer: source.issuer, year: source.year },
  });
  say(`  certification ${row.id} updated`);
}

await prisma.cvConfiguration.update({
  where: { id: "default" },
  data: {
    professionalSummary: profileData.professionalSummary,
    application: { ...application, skills: finalSkillIds },
  },
});
say("  cvConfiguration.application updated (master mode untouched)");

say();
say("=== DONE ===");
say(`  restore from: ${backupPath}`);
await prisma.$disconnect();
