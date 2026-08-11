import PDFDocument from "pdfkit";
import { createRequire } from "node:module";
import { prisma } from "./prisma.js";

const require = createRequire(import.meta.url);
const FONTS = {
  regular: require.resolve("@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff"),
  italic: require.resolve("@fontsource/source-sans-3/files/source-sans-3-latin-400-italic.woff"),
  bold: require.resolve("@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff"),
  boldItalic: require.resolve("@fontsource/source-sans-3/files/source-sans-3-latin-700-italic.woff"),
};

const PAGE = { width: 595.28, height: 841.89 };
const LEFT = 45;
const TOP = 45;
const BOTTOM = 803;
const WIDTH = PAGE.width - LEFT * 2;
const INK = "#111111";
const LINK = "#111111";

function clean(value) {
  return String(value ?? "")
    .replace(/\r/g, "")
    .replace(/[\u2013\u2014]/g, "—")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s*[→➜]\s*/g, " to ")
    .replace(/\s*·\s*/g, " | ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function cleanUrl(value) {
  return clean(value).replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function font(doc, face = "regular", size = 11) {
  doc.font(FONTS[face]).fontSize(size);
}

function height(doc, value, options = {}) {
  const text = clean(value);
  if (!text) return 0;
  const { face = "regular", size = 11, width = WIDTH, lineGap = 1 } = options;
  font(doc, face, size);
  return doc.heightOfString(text, { width, lineGap });
}

function text(doc, value, x, y, options = {}) {
  const copy = clean(value);
  if (!copy) return 0;
  const {
    face = "regular", size = 11, width = WIDTH, lineGap = 1,
    align, link, underline = false,
  } = options;
  font(doc, face, size);
  doc.fillColor(options.color ?? INK).text(copy, x, y, {
    width, lineGap, align, link, underline,
  });
  return height(doc, copy, { face, size, width, lineGap });
}

function createFlow() {
  return { y: TOP };
}

function addPage(doc, flow) {
  doc.addPage();
  flow.y = TOP;
}

function ensure(doc, flow, needed) {
  if (flow.y + needed > BOTTOM) addPage(doc, flow);
}

function section(doc, flow, label, firstBlock = 18) {
  const lead = flow.y > TOP + 1 ? 18 : 0;
  ensure(doc, flow, lead + 22 + Math.min(firstBlock, 180));
  flow.y += lead;
  const titleH = text(doc, label, LEFT, flow.y, { face: "bold", size: 12 });
  flow.y += titleH + 2;
  doc.moveTo(LEFT, flow.y).lineTo(LEFT + WIDTH, flow.y)
    .lineWidth(1.35).strokeColor(INK).stroke();
  flow.y += 8;
}

function drawCenteredRow(doc, flow, items, size = 10.2) {
  const valid = items.filter((item) => clean(item.text));
  if (!valid.length) return;
  font(doc, "regular", size);
  const separator = "    ";
  const widths = valid.map((item) => doc.widthOfString(clean(item.text)));
  const separatorWidth = doc.widthOfString(separator);
  const rows = [];
  let row = [];
  let used = 0;
  valid.forEach((item, index) => {
    const w = widths[index];
    const added = (row.length ? separatorWidth : 0) + w;
    if (row.length && used + added > WIDTH) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push({ ...item, width: w });
    used += (row.length > 1 ? separatorWidth : 0) + w;
  });
  if (row.length) rows.push(row);

  for (const entries of rows) {
    const total = entries.reduce((sum, item) => sum + item.width, 0)
      + separatorWidth * (entries.length - 1);
    let x = LEFT + (WIDTH - total) / 2;
    for (const [index, item] of entries.entries()) {
      if (index) x += separatorWidth;
      text(doc, item.text, x, flow.y, {
        size, width: item.width + 1, link: item.link, underline: false,
      });
      x += item.width;
    }
    flow.y += size + 4;
  }
}

function drawHeader(doc, flow, profile, origin) {
  const socials = profile.socials ?? [];
  const linkedin = socials.find((s) => /linkedin/i.test(s.label));
  const github = socials.find((s) => /github/i.test(s.label));
  const name = clean(profile.name) || "Curriculum Vitae";
  flow.y += 1;
  const nameH = text(doc, name, LEFT, flow.y, {
    face: "bold", size: 19, align: "center",
  });
  flow.y += nameH + 3;
  flow.y += text(doc, profile.title, LEFT, flow.y, {
    size: 14.5, align: "center",
  }) + 9;
  drawCenteredRow(doc, flow, [
    { text: profile.email, link: profile.email ? `mailto:${clean(profile.email)}` : "" },
    { text: profile.phone, link: profile.phone ? `tel:${clean(profile.phone).replace(/[^+\d]/g, "")}` : "" },
    { text: profile.location },
  ]);
  flow.y += 2;
  drawCenteredRow(doc, flow, [
    { text: linkedin ? cleanUrl(linkedin.url) : "", link: linkedin?.url },
    { text: github ? cleanUrl(github.url) : "", link: github?.url },
  ]);
  flow.y += 2;
  drawCenteredRow(doc, flow, [{ text: cleanUrl(origin), link: origin }]);
  flow.y += 12;
}

function drawSummary(doc, flow, bio) {
  if (!clean(bio)) return;
  const h = height(doc, bio, { size: 11, lineGap: 1.4 });
  section(doc, flow, "Objective", h);
  ensure(doc, flow, h);
  flow.y += text(doc, bio, LEFT, flow.y, { size: 11, lineGap: 1.4 });
}

function dateLike(value) {
  return /\d|present|current/i.test(clean(value));
}

function splitDetails(value) {
  return String(value ?? "").split(/\r?\n|(?:^|\s)[•▪◦]\s*/)
    .map(clean).filter(Boolean);
}

function twoColumnHeader(doc, flow, left, right, options = {}) {
  const rightWidth = right ? Math.min(150, Math.max(70, (() => {
    font(doc, options.rightFace ?? "regular", options.rightSize ?? 11);
    return doc.widthOfString(clean(right)) + 2;
  })())) : 0;
  const leftWidth = WIDTH - rightWidth - (rightWidth ? 12 : 0);
  const leftH = height(doc, left, {
    face: options.leftFace ?? "bold", size: options.leftSize ?? 11,
    width: leftWidth, lineGap: 1,
  });
  const rightH = height(doc, right, {
    face: options.rightFace ?? "regular", size: options.rightSize ?? 11,
    width: rightWidth || WIDTH,
  });
  text(doc, left, LEFT, flow.y, {
    face: options.leftFace ?? "bold", size: options.leftSize ?? 11,
    width: leftWidth, lineGap: 1,
  });
  if (right) text(doc, right, LEFT + WIDTH - rightWidth, flow.y, {
    face: options.rightFace ?? "regular", size: options.rightSize ?? 11,
    width: rightWidth, align: "right",
  });
  flow.y += Math.max(leftH, rightH);
}

function bulletHeight(doc, value, width = WIDTH - 18) {
  return height(doc, value, { size: 11, width, lineGap: 1 }) + 1;
}

function bullet(doc, flow, value, x = LEFT, width = WIDTH) {
  const h = bulletHeight(doc, value, width - 18);
  ensure(doc, flow, h);
  text(doc, "•", x + 9, flow.y, { size: 11, width: 8 });
  text(doc, value, x + 18, flow.y, { size: 11, width: width - 18, lineGap: 1 });
  flow.y += h;
}

function experienceMetric(doc, item) {
  const rawMeta = clean(item.meta);
  const date = dateLike(rawMeta) ? rawMeta : "";
  const organization = [clean(item.facility), date ? "" : rawMeta].filter(Boolean).join(" — ");
  const details = splitDetails(item.details);
  return 15 + height(doc, item.milestone, { face: "bold", size: 11, width: 350 })
    + height(doc, organization, { face: "italic", size: 11 })
    + details.reduce((sum, line) => sum + bulletHeight(doc, line), 0);
}

function drawExperience(doc, flow, experience) {
  const entries = (experience ?? []).filter((item) => clean(item.milestone));
  if (!entries.length) return;
  section(doc, flow, "Professional Experience", experienceMetric(doc, entries[0]));
  for (const item of entries) {
    const needed = experienceMetric(doc, item);
    ensure(doc, flow, Math.min(needed, 150));
    const rawMeta = clean(item.meta);
    const date = dateLike(rawMeta) ? rawMeta : "";
    const organization = [clean(item.facility), date ? "" : rawMeta].filter(Boolean).join(" — ");
    twoColumnHeader(doc, flow, item.milestone, date);
    if (organization) {
      flow.y += 1;
      flow.y += text(doc, organization, LEFT, flow.y, { face: "italic", size: 11 });
    }
    flow.y += 3;
    for (const detail of splitDetails(item.details)) bullet(doc, flow, detail);
    flow.y += 10;
  }
}

function projectDescription(project) {
  return clean(project.tagline || project.type || project.description);
}

function projectMetric(doc, project) {
  const title = [clean(project.name), projectDescription(project)].filter(Boolean).join(" — ");
  const stack = (project.stack ?? []).map(clean).filter(Boolean).join(", ");
  const features = (project.features ?? []).map(clean).filter(Boolean);
  return height(doc, title, { face: "bold", size: 11 })
    + height(doc, stack, { face: "italic", size: 11 })
    + features.reduce((sum, line) => sum + bulletHeight(doc, line), 0) + 30;
}

function linkLine(doc, flow, label, url) {
  if (!clean(url)) return;
  const prefix = `${label}: `;
  font(doc, "regular", 11);
  const prefixWidth = doc.widthOfString(prefix);
  text(doc, prefix, LEFT + 9, flow.y, { size: 11, width: prefixWidth + 1 });
  const shown = clean(url);
  const linkH = text(doc, shown, LEFT + 9 + prefixWidth, flow.y, {
    face: "boldItalic", size: 11, width: WIDTH - prefixWidth - 9,
    link: shown, underline: false, color: LINK,
  });
  flow.y += Math.max(14, linkH);
}

function drawProjects(doc, flow, projects) {
  const entries = [...(projects ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((project) => clean(project.name));
  if (!entries.length) return;
  section(doc, flow, "Projects", projectMetric(doc, entries[0]));
  for (const project of entries) {
    ensure(doc, flow, Math.min(projectMetric(doc, project), 160));
    const title = [clean(project.name), projectDescription(project)].filter(Boolean).join(" — ");
    flow.y += text(doc, title, LEFT, flow.y, { face: "bold", size: 11, lineGap: 1 });
    const stack = (project.stack ?? []).map(clean).filter(Boolean).join(", ");
    if (stack) {
      flow.y += 1;
      flow.y += text(doc, stack, LEFT, flow.y, { face: "italic", size: 11, lineGap: 1 });
    }
    flow.y += 3;
    for (const feature of (project.features ?? []).map(clean).filter(Boolean)) bullet(doc, flow, feature);
    linkLine(doc, flow, "Live Demo", project.demo);
    linkLine(doc, flow, "Repository", project.github);
    flow.y += 10;
  }
}

function drawEducation(doc, flow, education) {
  const entries = (education ?? []).filter((item) => clean(item.degree));
  if (!entries.length) return;
  section(doc, flow, "Education", 50);
  for (const item of entries) {
    ensure(doc, flow, 48);
    twoColumnHeader(doc, flow, item.degree, item.period);
    flow.y += 1;
    const institution = [clean(item.school), clean(item.field)]
      .filter((part) => part && part !== "-").join(" — ");
    twoColumnHeader(doc, flow, institution, "", { leftFace: "italic" });
    if (clean(item.details)) {
      flow.y += 1;
      flow.y += text(doc, item.details, LEFT + 9, flow.y, { size: 11, width: WIDTH - 9 });
    }
    flow.y += 10;
  }
}

function groupSkills(skills) {
  const groups = new Map();
  for (const item of skills ?? []) {
    const category = clean(item.category) || "Other";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(clean(item.name));
  }
  return [...groups].map(([category, names]) => ({ category, names: names.filter(Boolean) }));
}

function skillGroupHeight(doc, group, columnWidth) {
  return height(doc, group.category, { face: "bold", size: 11, width: columnWidth })
    + group.names.reduce((sum, name) => sum + bulletHeight(doc, name, columnWidth - 3), 0) + 13;
}

function drawSkills(doc, flow, skills) {
  const groups = groupSkills(skills).filter((group) => group.names.length);
  if (!groups.length) return;
  const gap = 20;
  const columnWidth = (WIDTH - gap * 2) / 3;
  const columns = [[], [], []];
  const columnHeights = [0, 0, 0];
  for (const group of groups) {
    const target = columnHeights.indexOf(Math.min(...columnHeights));
    columns[target].push(group);
    columnHeights[target] += skillGroupHeight(doc, group, columnWidth);
  }
  const gridHeight = Math.max(...columnHeights);
  section(doc, flow, "Skills", Math.min(gridHeight, 100));
  ensure(doc, flow, gridHeight);
  const startY = flow.y;
  columns.forEach((column, columnIndex) => {
    const local = { y: startY };
    const x = LEFT + columnIndex * (columnWidth + gap);
    for (const group of column) {
      local.y += text(doc, group.category, x, local.y, {
        face: "bold", size: 11, width: columnWidth,
      }) + 2;
      for (const name of group.names) {
        const h = bulletHeight(doc, name, columnWidth - 3);
        text(doc, "•", x + 9, local.y, { size: 11, width: 8 });
        text(doc, name, x + 18, local.y, {
          size: 11, width: columnWidth - 21, lineGap: 1,
        });
        local.y += h;
      }
      local.y += 10;
    }
  });
  flow.y = startY + gridHeight;
}

function drawCertifications(doc, flow, certifications) {
  const entries = (certifications ?? []).filter((item) => clean(item.title));
  if (!entries.length) return;
  section(doc, flow, "Certifications & Training", 40);
  for (const item of entries) {
    ensure(doc, flow, 40);
    twoColumnHeader(doc, flow, item.title, item.year);
    if (clean(item.issuer)) {
      flow.y += 1;
      flow.y += text(doc, item.issuer, LEFT, flow.y, { face: "italic", size: 11 });
    }
    if (clean(item.url)) linkLine(doc, flow, "Credential", item.url);
    flow.y += 9;
  }
}

function parseLanguages(value) {
  return clean(value).split(/[,;|]/).map((part) => {
    const match = part.trim().match(/^(.+?)\s*\((.+)\)$/);
    return match ? { name: match[1], level: match[2] } : { name: part.trim(), level: "" };
  }).filter((item) => item.name);
}

function drawLanguages(doc, flow, value) {
  const entries = parseLanguages(value);
  if (!entries.length) return;
  section(doc, flow, "Languages", 32);
  const columnWidth = WIDTH / entries.length;
  let maxH = 0;
  entries.forEach((item, index) => {
    const x = LEFT + columnWidth * index;
    const h1 = text(doc, item.name, x, flow.y, { face: "bold", size: 11, width: columnWidth });
    const h2 = item.level ? text(doc, item.level, x, flow.y + h1 + 1, { size: 11, width: columnWidth }) : 0;
    maxH = Math.max(maxH, h1 + h2 + 1);
  });
  flow.y += maxH;
}

export async function generateCvPdfBuffer({ origin = "" } = {}) {
  const profile = await prisma.profile.findFirst({
    include: {
      experience: { orderBy: { order: "asc" } },
      socials: { orderBy: { id: "asc" } },
    },
  });
  if (!profile) throw new Error("Profile not found.");
  const [projects, skills, education, certifications] = await Promise.all([
    prisma.project.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    prisma.skill.findMany({ orderBy: { order: "asc" } }),
    prisma.education.findMany({ orderBy: { order: "asc" } }),
    prisma.certification.findMany({ orderBy: { order: "asc" } }),
  ]);
  const doc = new PDFDocument({
    size: "A4", margins: { top: TOP, bottom: PAGE.height - BOTTOM, left: LEFT, right: LEFT },
    bufferPages: true,
    info: {
      Title: `${clean(profile.name)} - CV`, Author: clean(profile.name),
      Subject: "Curriculum Vitae", Producer: "Portfolio CV Generator",
      Creator: "Portfolio CV Generator",
    },
  });
  const chunks = [];
  const buffer = new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const flow = createFlow();
  drawHeader(doc, flow, profile, origin);
  drawSummary(doc, flow, profile.bio);
  drawExperience(doc, flow, profile.experience);
  drawProjects(doc, flow, projects);
  drawEducation(doc, flow, education);
  drawSkills(doc, flow, skills);
  drawCertifications(doc, flow, certifications);
  drawLanguages(doc, flow, profile.languages);
  doc.end();
  return buffer;
}
