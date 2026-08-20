import { prisma } from "./prisma.js";

export const DEFAULT_HEADER = {
  title: true, email: true, phone: true, location: true,
  linkedin: true, github: true, portfolio: true,
};
export const DEFAULT_SECTIONS = ["summary", "experience", "projects", "education", "skills", "certifications", "languages"];
export const DEFAULT_SECTION_TITLES = {
  summary: "Objective", experience: "Professional Experience", projects: "Projects",
  education: "Education", skills: "Skills", certifications: "Certifications & Training", languages: "Languages",
};

const ids = (rows) => rows.map((row) => row.id);
const orderedIds = (rows) => [...rows]
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map((row) => row.id);

export async function getCvCatalog() {
  const profile = await prisma.profile.findFirst({
    include: { experience: { where: { showOnCv: true }, orderBy: { order: "asc" } }, socials: { where: { showOnCv: true, published: true }, orderBy: { order: "asc" } } },
  });
  if (!profile) throw new Error("Profile not found.");
  const [projects, skills, education, certifications] = await Promise.all([
    prisma.project.findMany({ where: { showOnCv: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    prisma.skill.findMany({ orderBy: { order: "asc" } }),
    prisma.education.findMany({ where: { showOnCv: true }, orderBy: { order: "asc" } }),
    prisma.certification.findMany({ where: { showOnCv: true }, orderBy: { order: "asc" } }),
  ]);
  const languages = String(profile.languages ?? "").split(/[,;|]/).map((value) => value.trim()).filter(Boolean);
  return { profile, projects, skills, education, certifications, languages };
}

export function initialModes(catalog) {
  const strongest = [...catalog.projects]
    .filter((p) => p.published)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3);
  const mode = (projectRows, all = false) => ({
    experience: all ? orderedIds(catalog.profile.experience) : orderedIds(catalog.profile.experience).slice(0, 2),
    projects: ids(projectRows),
    skills: all ? orderedIds(catalog.skills) : orderedIds(catalog.skills).slice(0, 16),
    education: orderedIds(catalog.education),
    certifications: all ? orderedIds(catalog.certifications) : orderedIds(catalog.certifications).slice(0, 2),
    languages: [...catalog.languages],
    projectOverrides: {},
    experienceOverrides: {},
    educationOverrides: {}, certificationOverrides: {},
    skillCategoryOverrides: {}, cvOnlySkills: [],
    sections: [...DEFAULT_SECTIONS], sectionTitles: { ...DEFAULT_SECTION_TITLES },
    ...(all ? { includeUnpublishedProjects: false } : {}),
  });
  return { application: mode(strongest), master: mode(catalog.projects.filter((p) => p.published), true) };
}

export async function getOrCreateCvConfiguration() {
  const existing = await prisma.cvConfiguration.findUnique({ where: { id: "default" } });
  if (existing) return existing;
  const catalog = await getCvCatalog();
  const modes = initialModes(catalog);
  return prisma.cvConfiguration.create({
    data: { id: "default", professionalSummary: null, header: DEFAULT_HEADER, ...modes },
  });
}

const stringList = (value) => Array.isArray(value)
  ? [...new Set(value.filter((v) => typeof v === "string").map((v) => v.trim()).filter(Boolean))]
  : [];

export function normalizeMode(value) {
  const input = value && typeof value === "object" ? value : {};
  const textFields = ["role", "company", "startDate", "endDate", "displayDate", "location", "description", "technologies", "name", "subtitle", "techStack", "demo", "github", "degree", "institution", "gpa", "details", "provider", "date", "duration"];
  const overrides = (candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? Object.fromEntries(Object.entries(candidate).map(([id, item]) => { const current = item?.isCurrent === true || /^present$/i.test(item?.endDate?.trim() ?? ""); return [id, {
      ...Object.fromEntries(textFields.filter((key) => typeof item?.[key] === "string" && item[key].trim() && !(key === "endDate" && current)).map((key) => {
        const raw = item[key].trim(); const date = raw.match(/^(\d{4})-(\d{1,2})$/);
        return [key, date ? `${date[1]}-${date[2].padStart(2, "0")}` : raw.slice(0, 2000)];
      })),
      ...(current ? { isCurrent: true } : {}),
      ...(Array.isArray(item?.bullets) ? { bullets: stringList(item.bullets).slice(0, 12).map((line) => line.slice(0, 500)) } : {}),
    }]; })) : {};
  const sectionTitles = Object.fromEntries(DEFAULT_SECTIONS.map((key) => [key,
    typeof input.sectionTitles?.[key] === "string" && input.sectionTitles[key].trim()
      ? input.sectionTitles[key].trim().replace(/[<>]/g, "").slice(0, 80) : DEFAULT_SECTION_TITLES[key]]));
  const sections = stringList(input.sections).filter((key) => DEFAULT_SECTIONS.includes(key));
  const categoryOverrides = input.skillCategoryOverrides && typeof input.skillCategoryOverrides === "object"
    ? Object.fromEntries(Object.entries(input.skillCategoryOverrides).map(([key, val]) => [key, String(val ?? "").trim().slice(0, 80)]).filter(([, val]) => val)) : {};
  const cvOnlySkills = Array.isArray(input.cvOnlySkills) ? input.cvOnlySkills.slice(0, 50).map((item) => ({
    id: typeof item?.id === "string" ? item.id : "", name: String(item?.name ?? "").trim().slice(0, 100), category: String(item?.category ?? "Other").trim().slice(0, 80),
  })).filter((item) => item.id && item.name) : [];
  return {
    experience: stringList(input.experience), projects: stringList(input.projects),
    skills: stringList(input.skills), education: stringList(input.education),
    certifications: stringList(input.certifications), languages: stringList(input.languages),
    projectOverrides: overrides(input.projectOverrides),
    experienceOverrides: overrides(input.experienceOverrides),
    educationOverrides: overrides(input.educationOverrides), certificationOverrides: overrides(input.certificationOverrides),
    skillCategoryOverrides: categoryOverrides, cvOnlySkills,
    sections: sections.length ? sections : [...DEFAULT_SECTIONS], sectionTitles,
  };
}

export function normalizeHeader(value) {
  const input = value && typeof value === "object" ? value : {};
  return {
    ...Object.fromEntries(Object.keys(DEFAULT_HEADER).map((key) => [key, input[key] !== false])),
    overrides: Object.fromEntries(["name", "title", "email", "phone", "location", "linkedin", "github", "portfolio"]
      .filter((key) => typeof input.overrides?.[key] === "string" && input.overrides[key].trim())
      .map((key) => [key, input.overrides[key].trim().slice(0, 500)])),
  };
}

function formattedDate(start, end, current) {
  const display = (value) => /^\d{4}-\d{2}$/.test(value ?? "") ? `${value.slice(5)}/${value.slice(0, 4)}` : value ?? "";
  const from = display(start); const to = current ? "Present" : display(end);
  return [from, to].filter(Boolean).join(" – ");
}

export async function resolveCvData(modeName = "application") {
  const [catalog, configuration] = await Promise.all([getCvCatalog(), getOrCreateCvConfiguration()]);
  const mode = normalizeMode(modeName === "master" ? configuration.master : configuration.application);
  const select = (rows, selected) => {
    const byId = new Map(rows.map((row) => [row.id, row]));
    return selected.map((id) => byId.get(id)).filter(Boolean);
  };
  const projects = select(catalog.projects, mode.projects).map((row) => {
    const override = mode.projectOverrides[row.id];
    return { ...row, name: override?.name || row.name, tagline: override?.subtitle || row.tagline,
      stack: override?.techStack ? override.techStack.split(/[,;|]/).map((v) => v.trim()).filter(Boolean) : row.stack,
      demo: override?.demo || row.demo, github: override?.github || row.github,
      cvDescription: override?.description || row.cvDescription || "",
      cvBullets: override?.bullets?.length ? override.bullets : row.cvBullets?.length ? row.cvBullets : modeName === "application" ? row.features.slice(0, 2) : row.features };
  });
  const experience = select(catalog.profile.experience, mode.experience).map((row) => {
    const override = mode.experienceOverrides[row.id];
    return { ...row, milestone: override?.role || row.role || row.milestone, facility: override?.company || row.company || row.facility,
      meta: override?.displayDate || formattedDate(override?.startDate, override?.endDate, override?.isCurrent) || formattedDate(row.startDate, row.endDate, row.isCurrent) || row.meta,
      cvLocation: override?.location || row.location || "", cvTechnologies: override?.technologies || "",
      cvDescription: override?.description || row.cvDescription || "", details: row.description || row.details,
      cvBullets: override?.bullets?.length ? override.bullets : row.cvBullets?.length ? row.cvBullets : row.bullets };
  });
  const education = select(catalog.education, mode.education).map((row) => { const o = mode.educationOverrides[row.id]; return {
    ...row, degree: o?.degree || row.degree, school: o?.institution || row.school,
    period: o?.displayDate || formattedDate(o?.startDate, o?.endDate, false) || row.period,
    field: [o?.location, o?.gpa && `GPA: ${o.gpa}`].filter(Boolean).join(" | ") || row.field,
    details: o?.details || row.cvDescription || row.details,
  }; });
  const certifications = select(catalog.certifications, mode.certifications).map((row) => { const o = mode.certificationOverrides[row.id]; return {
    ...row, title: o?.name || row.title, issuer: [o?.provider || row.issuer, o?.duration, o?.location].filter(Boolean).join(" | "),
    year: o?.displayDate || o?.date || formattedDate(o?.startDate, o?.endDate, o?.isCurrent) || row.year,
    cvDescription: o?.description || row.cvDescription || "",
  }; });
  const skills = select(catalog.skills, mode.skills)
    .filter((row) => (row.status ?? "verified") === "verified")
    .map((row) => ({ ...row, category: mode.skillCategoryOverrides[row.category] || row.category }));
  return {
    configuration, modeName, mode,
    profile: { ...catalog.profile, experience }, projects,
    skills: [...skills, ...mode.cvOnlySkills], education, certifications,
    languages: mode.languages,
  };
}
