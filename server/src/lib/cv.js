import PDFDocument from "pdfkit";
import { createRequire } from "node:module";
import { resolveCvData } from "./cv-config.js";

const require = createRequire(import.meta.url);
const FONTS = {
  regular:
    require.resolve("@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff"),
  italic:
    require.resolve("@fontsource/source-sans-3/files/source-sans-3-latin-400-italic.woff"),
  bold: require.resolve("@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff"),
  boldItalic:
    require.resolve("@fontsource/source-sans-3/files/source-sans-3-latin-700-italic.woff"),
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
    .replace(/\u2014/g, "—")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s*[→➜]\s*/g, " to ")
    .replace(/\s*·\s*/g, " | ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function cleanUrl(value) {
  return clean(value)
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
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
    face = "regular",
    size = 11,
    width = WIDTH,
    lineGap = 1,
    align,
    link,
    underline = false,
  } = options;
  font(doc, face, size);
  doc.fillColor(options.color ?? INK).text(copy, x, y, {
    width,
    lineGap,
    align,
    link,
    underline,
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
  doc
    .moveTo(LEFT, flow.y)
    .lineTo(LEFT + WIDTH, flow.y)
    .lineWidth(1.35)
    .strokeColor(INK)
    .stroke();
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
    const total =
      entries.reduce((sum, item) => sum + item.width, 0) +
      separatorWidth * (entries.length - 1);
    let x = LEFT + (WIDTH - total) / 2;
    for (const [index, item] of entries.entries()) {
      if (index) x += separatorWidth;
      text(doc, item.text, x, flow.y, {
        size,
        width: item.width + 1,
        link: item.link,
        underline: false,
      });
      x += item.width;
    }
    flow.y += size + 4;
  }
}

function drawHeader(doc, flow, profile, origin, header) {
  const socials = profile.socials ?? [];
  const linkedin = socials.find((s) => /linkedin/i.test(s.label));
  const github = socials.find((s) => /github/i.test(s.label));
  const values = header.overrides ?? {};
  const name = clean(values.name || profile.name) || "Curriculum Vitae";
  flow.y += 1;
  const nameH = text(doc, name, LEFT, flow.y, {
    face: "bold",
    size: 19,
    align: "center",
  });
  flow.y += nameH + 3;
  flow.y +=
    text(doc, header.title ? values.title || profile.title : "", LEFT, flow.y, {
      size: 14.5,
      align: "center",
    }) + 9;
  drawCenteredRow(doc, flow, [
    {
      text: header.email ? values.email || profile.email : "",
      link: header.email
        ? `mailto:${clean(values.email || profile.email)}`
        : "",
    },
    {
      text: header.phone ? values.phone || profile.phone : "",
      link: header.phone
        ? `tel:${clean(values.phone || profile.phone).replace(/[^+\d]/g, "")}`
        : "",
    },
    { text: header.location ? values.location || profile.location : "" },
  ]);
  flow.y += 2;
  drawCenteredRow(doc, flow, [
    {
      text: header.linkedin ? cleanUrl(values.linkedin || linkedin?.url) : "",
      link: header.linkedin ? values.linkedin || linkedin?.url : "",
    },
    {
      text: header.github ? cleanUrl(values.github || github?.url) : "",
      link: header.github ? values.github || github?.url : "",
    },
  ]);
  flow.y += 2;
  if (header.portfolio)
    drawCenteredRow(doc, flow, [
      {
        text: cleanUrl(values.portfolio || origin),
        link: values.portfolio || origin,
      },
    ]);
  flow.y += 12;
}

function drawSummary(doc, flow, bio, label = "Objective") {
  if (!clean(bio)) return;
  const h = height(doc, bio, { size: 11, lineGap: 1.4 });
  section(doc, flow, label, h);
  ensure(doc, flow, h);
  flow.y += text(doc, bio, LEFT, flow.y, { size: 11, lineGap: 1.4 });
}

function dateLike(value) {
  return /\d|present|current/i.test(clean(value));
}

function splitDetails(value) {
  return String(value ?? "")
    .split(/\r?\n|(?:^|\s)[•▪◦]\s*/)
    .map(clean)
    .filter(Boolean);
}

function twoColumnHeader(doc, flow, left, right, options = {}) {
  const rightWidth = right
    ? Math.min(
        150,
        Math.max(
          70,
          (() => {
            font(doc, options.rightFace ?? "regular", options.rightSize ?? 11);
            return doc.widthOfString(clean(right)) + 2;
          })(),
        ),
      )
    : 0;
  const leftWidth = WIDTH - rightWidth - (rightWidth ? 12 : 0);
  const leftH = height(doc, left, {
    face: options.leftFace ?? "bold",
    size: options.leftSize ?? 11,
    width: leftWidth,
    lineGap: 1,
  });
  const rightH = height(doc, right, {
    face: options.rightFace ?? "regular",
    size: options.rightSize ?? 11,
    width: rightWidth || WIDTH,
  });
  text(doc, left, LEFT, flow.y, {
    face: options.leftFace ?? "bold",
    size: options.leftSize ?? 11,
    width: leftWidth,
    lineGap: 1,
  });
  if (right)
    text(doc, right, LEFT + WIDTH - rightWidth, flow.y, {
      face: options.rightFace ?? "regular",
      size: options.rightSize ?? 11,
      width: rightWidth,
      align: "right",
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
  const organization = [clean(item.facility), date ? "" : rawMeta]
    .filter(Boolean)
    .join(" — ");
  const details = item.cvBullets?.length
    ? item.cvBullets
    : splitDetails(item.details);
  return (
    15 +
    height(doc, item.milestone, { face: "bold", size: 11, width: 350 }) +
    height(doc, organization, { face: "italic", size: 11 }) +
    height(doc, item.cvDescription, { size: 10.5 }) +
    details.reduce((sum, line) => sum + bulletHeight(doc, line), 0)
  );
}

function drawExperience(
  doc,
  flow,
  experience,
  label = "Professional Experience",
) {
  const entries = (experience ?? []).filter((item) => clean(item.milestone));
  if (!entries.length) return;
  section(doc, flow, label, experienceMetric(doc, entries[0]));
  for (const item of entries) {
    const needed = experienceMetric(doc, item);
    ensure(doc, flow, Math.min(needed, 150));
    const rawMeta = clean(item.meta);
    const date = dateLike(rawMeta) ? rawMeta : "";
    const organization = [clean(item.facility), date ? "" : rawMeta]
      .filter(Boolean)
      .join(" — ");
    twoColumnHeader(doc, flow, item.milestone, date);
    if (organization) {
      flow.y += 1;
      flow.y += text(doc, organization, LEFT, flow.y, {
        face: "italic",
        size: 11,
      });
    }
    if (clean(item.cvLocation)) {
      const h = height(doc, item.cvLocation, { size: 10.5 });
      ensure(doc, flow, h);
      flow.y += 1;
      flow.y += text(doc, item.cvLocation, LEFT, flow.y, { size: 10.5 });
    }
    flow.y += 3;
    if (clean(item.cvDescription)) {
      const h = height(doc, item.cvDescription, { size: 10.5 });
      ensure(doc, flow, h);
      flow.y += text(doc, item.cvDescription, LEFT, flow.y, { size: 10.5 });
      flow.y += 2;
    }
    const details = item.cvBullets?.length
      ? item.cvBullets
      : splitDetails(item.details);
    for (const detail of details) bullet(doc, flow, detail);
    if (clean(item.cvTechnologies)) {
      const value = `Technologies: ${item.cvTechnologies}`;
      const h = height(doc, value, {
        face: "italic",
        size: 10.5,
        width: WIDTH - 9,
      });
      ensure(doc, flow, h);
      flow.y += text(doc, value, LEFT + 9, flow.y, {
        face: "italic",
        size: 10.5,
        width: WIDTH - 9,
      });
    }
    flow.y += 10;
  }
}

function projectDescription(project) {
  return clean(project.tagline || project.type || project.description);
}

function projectMetric(doc, project) {
  const title = [clean(project.name), projectDescription(project)]
    .filter(Boolean)
    .join(" — ");
  const stack = (project.stack ?? []).map(clean).filter(Boolean).join(", ");
  const features = (
    project.cvBullets?.length ? project.cvBullets : (project.features ?? [])
  )
    .map(clean)
    .filter(Boolean);
  return (
    height(doc, title, { face: "bold", size: 11 }) +
    height(doc, stack, { face: "italic", size: 11 }) +
    height(doc, project.cvDescription, { size: 10.5 }) +
    features.reduce((sum, line) => sum + bulletHeight(doc, line), 0) +
    30
  );
}

function linkLine(doc, flow, label, url) {
  if (!clean(url)) return;
  const prefix = `${label}: `;
  font(doc, "regular", 11);
  const prefixWidth = doc.widthOfString(prefix);
  text(doc, prefix, LEFT + 9, flow.y, { size: 11, width: prefixWidth + 1 });
  const shown = clean(url);
  const linkH = text(doc, shown, LEFT + 9 + prefixWidth, flow.y, {
    face: "boldItalic",
    size: 11,
    width: WIDTH - prefixWidth - 9,
    link: shown,
    underline: false,
    color: LINK,
  });
  flow.y += Math.max(14, linkH);
}

function drawProjects(doc, flow, projects, label = "Projects") {
  const entries = [...(projects ?? [])].filter((project) =>
    clean(project.name),
  );
  if (!entries.length) return;
  section(doc, flow, label, projectMetric(doc, entries[0]));
  for (const project of entries) {
    ensure(doc, flow, Math.min(projectMetric(doc, project), 160));
    const title = [clean(project.name), projectDescription(project)]
      .filter(Boolean)
      .join(" — ");
    flow.y += text(doc, title, LEFT, flow.y, {
      face: "bold",
      size: 11,
      lineGap: 1,
    });
    const stack = (project.stack ?? []).map(clean).filter(Boolean).join(", ");
    if (stack) {
      flow.y += 1;
      flow.y += text(doc, stack, LEFT, flow.y, {
        face: "italic",
        size: 11,
        lineGap: 1,
      });
    }
    if (clean(project.cvDescription)) {
      flow.y += 2;
      flow.y += text(doc, project.cvDescription, LEFT, flow.y, { size: 10.5 });
    }
    flow.y += 3;
    for (const feature of (project.cvBullets?.length
      ? project.cvBullets
      : (project.features ?? [])
    )
      .map(clean)
      .filter(Boolean))
      bullet(doc, flow, feature);
    linkLine(doc, flow, "Live Demo", project.demo);
    linkLine(doc, flow, "Repository", project.github);
    flow.y += 10;
  }
}

function drawEducation(doc, flow, education, label = "Education") {
  const entries = (education ?? []).filter((item) => clean(item.degree));
  if (!entries.length) return;
  section(doc, flow, label, 50);
  for (const item of entries) {
    ensure(doc, flow, 48);
    twoColumnHeader(doc, flow, item.degree, item.period);
    flow.y += 1;
    const institution = [clean(item.school), clean(item.field)]
      .filter((part) => part && part !== "-")
      .join(" — ");
    twoColumnHeader(doc, flow, institution, "", { leftFace: "italic" });
    if (clean(item.details)) {
      flow.y += 1;
      flow.y += text(doc, item.details, LEFT + 9, flow.y, {
        size: 11,
        width: WIDTH - 9,
      });
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
  return [...groups].map(([category, names]) => ({
    category,
    names: names.filter(Boolean),
  }));
}

function skillGroupHeight(doc, group, columnWidth) {
  return (
    height(doc, group.category, {
      face: "bold",
      size: 11,
      width: columnWidth,
    }) +
    group.names.reduce(
      (sum, name) => sum + bulletHeight(doc, name, columnWidth - 3),
      0,
    ) +
    13
  );
}

function drawSkills(doc, flow, skills, label = "Skills") {
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
  section(doc, flow, label, Math.min(gridHeight, 100));
  ensure(doc, flow, gridHeight);
  const startY = flow.y;
  columns.forEach((column, columnIndex) => {
    const local = { y: startY };
    const x = LEFT + columnIndex * (columnWidth + gap);
    for (const group of column) {
      local.y +=
        text(doc, group.category, x, local.y, {
          face: "bold",
          size: 11,
          width: columnWidth,
        }) + 2;
      for (const name of group.names) {
        const h = bulletHeight(doc, name, columnWidth - 3);
        text(doc, "•", x + 9, local.y, { size: 11, width: 8 });
        text(doc, name, x + 18, local.y, {
          size: 11,
          width: columnWidth - 21,
          lineGap: 1,
        });
        local.y += h;
      }
      local.y += 10;
    }
  });
  flow.y = startY + gridHeight;
}

function drawCertifications(
  doc,
  flow,
  certifications,
  label = "Certifications & Training",
) {
  const entries = (certifications ?? []).filter((item) => clean(item.title));
  if (!entries.length) return;
  section(doc, flow, label, 40);
  for (const item of entries) {
    ensure(doc, flow, 40);
    twoColumnHeader(doc, flow, item.title, item.year);
    if (clean(item.issuer)) {
      flow.y += 1;
      flow.y += text(doc, item.issuer, LEFT, flow.y, {
        face: "italic",
        size: 11,
      });
    }
    if (clean(item.url)) linkLine(doc, flow, "Credential", item.url);
    if (clean(item.cvDescription)) {
      flow.y += text(doc, item.cvDescription, LEFT + 9, flow.y, {
        size: 10.5,
        width: WIDTH - 9,
      });
    }
    flow.y += 9;
  }
}

function parseLanguages(value) {
  return clean(value)
    .split(/[,;|]/)
    .map((part) => {
      const match = part.trim().match(/^(.+?)\s*\((.+)\)$/);
      return match
        ? { name: match[1], level: match[2] }
        : { name: part.trim(), level: "" };
    })
    .filter((item) => item.name);
}

function drawLanguages(doc, flow, value, label = "Languages") {
  const entries = parseLanguages(value);
  if (!entries.length) return;
  section(doc, flow, label, 32);
  const columnWidth = WIDTH / entries.length;
  let maxH = 0;
  entries.forEach((item, index) => {
    const x = LEFT + columnWidth * index;
    const h1 = text(doc, item.name, x, flow.y, {
      face: "bold",
      size: 11,
      width: columnWidth,
    });
    const h2 = item.level
      ? text(doc, item.level, x, flow.y + h1 + 1, {
          size: 11,
          width: columnWidth,
        })
      : 0;
    maxH = Math.max(maxH, h1 + h2 + 1);
  });
  flow.y += maxH;
}

const APPLICATION = {
  left: 36,
  right: 36,
  top: 26,
  bottom: 818,
  body: 8.8,
  ink: "#111111",
  line: "#111111",
};

function drawApplicationCv(doc, data, origin) {
  const {
    profile,
    projects,
    skills,
    education,
    certifications,
    configuration,
  } = data;
  const left = APPLICATION.left;
  const width = PAGE.width - APPLICATION.left - APPLICATION.right;
  let y = APPLICATION.top;

  const heading = (label) => {
    y += 5;
    font(doc, "bold", 9.8);
    doc.fillColor(APPLICATION.ink).text(clean(label).toUpperCase(), left, y);
    y += 12;
    doc
      .moveTo(left, y)
      .lineTo(left + width, y)
      .lineWidth(0.8)
      .strokeColor(APPLICATION.line)
      .stroke();
    y += 4;
  };

  const bulletLine = (value) => {
    const bulletWidth = 10;
    font(doc, "regular", APPLICATION.body);
    doc
      .fillColor(APPLICATION.ink)
      .text("•", left + 2, y, { width: bulletWidth });
    const textWidth = width - bulletWidth - 2;
    const h = doc.heightOfString(clean(value), {
      width: textWidth,
      lineGap: 0.8,
    });
    doc
      .fillColor(APPLICATION.ink)
      .text(clean(value), left + bulletWidth + 2, y, {
        width: textWidth,
        lineGap: 0.8,
      });
    y += h + 1.4;
  };

  const datedTitle = (leftText, rightText, options = {}) => {
    const size = options.size ?? 9.4;
    const face = options.face ?? "bold";
    font(doc, face, size);
    const rightWidth = rightText ? doc.widthOfString(clean(rightText)) + 2 : 0;
    const leftWidth = width - rightWidth - (rightWidth ? 8 : 0);
    const lineGap = 0.5;
    const leftH = doc.heightOfString(clean(leftText), {
      width: leftWidth,
      lineGap,
    });
    doc.fillColor(APPLICATION.ink).text(clean(leftText), left, y, {
      width: leftWidth,
      lineGap,
    });
    if (rightText) {
      font(doc, face, size);
      doc
        .fillColor(APPLICATION.ink)
        .text(clean(rightText), left + width - rightWidth, y, {
          width: rightWidth,
          align: "right",
        });
    }
    y += leftH + (options.spacing ?? 1.8);
  };

  const socials = profile.socials ?? [];
  const linkedin =
    configuration.header.overrides?.linkedin ||
    socials.find((item) => /linkedin/i.test(item.label))?.url ||
    "https://linkedin.com/in/MahmoudAbdulGhani";
  const github =
    configuration.header.overrides?.github ||
    socials.find((item) => /github/i.test(item.label))?.url ||
    "https://github.com/MahmoudAbdulGhani";
  const portfolioCandidate =
    configuration.header.overrides?.portfolio || profile.portfolioUrl || origin;
  const portfolio =
    /^(?!https?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/|$))https?:\/\//i.test(
      portfolioCandidate,
    )
      ? portfolioCandidate
      : "https://mahmoud-portfolio-omega.vercel.app/";
  const email =
    configuration.header.overrides?.email ||
    profile.email ||
    "Mahmoud.Abdulghani@outlook.com";
  const phone =
    configuration.header.overrides?.phone || profile.phone || "+961 76 364 340";
  const location =
    configuration.header.overrides?.location ||
    profile.location ||
    "Tripoli, Lebanon";
  const name =
    configuration.header.overrides?.name ||
    profile.name ||
    "Mahmoud Hussein Abdul Ghani";
  const title =
    configuration.header.overrides?.title ||
    profile.title ||
    "Full-Stack Software Engineer";

  // Name
  font(doc, "bold", 18.5);
  const nameH = doc.heightOfString(name, { width, align: "center" });
  doc
    .fillColor(APPLICATION.ink)
    .text(name, left, y, { width, align: "center" });
  y += nameH + 1;

  // Title
  font(doc, "bold", 11.2);
  const titleH = doc.heightOfString(title, { width, align: "center" });
  doc
    .fillColor(APPLICATION.ink)
    .text(title, left, y, { width, align: "center" });
  y += titleH + 2;

  // Single centered contact line
  const contactItems = [
    { text: location },
    { text: phone, link: `tel:${phone.replace(/[^+\d]/g, "")}` },
    { text: email, link: `mailto:${email}`, underline: true },
    { text: "LinkedIn", link: linkedin, underline: true },
    { text: "GitHub", link: github, underline: true },
    { text: "Portfolio", link: portfolio, underline: true },
  ].filter((item) => clean(item.text));

  const separator = " • ";
  font(doc, "regular", 9.2);
  const sepW = doc.widthOfString(separator);
  let totalContactW = 0;
  contactItems.forEach((item, idx) => {
    item.w = doc.widthOfString(item.text);
    totalContactW += item.w + (idx > 0 ? sepW : 0);
  });
  let curX = left + Math.max(0, (width - totalContactW) / 2);
  contactItems.forEach((item, idx) => {
    if (idx > 0) {
      font(doc, "regular", 9.2);
      doc.fillColor(APPLICATION.ink).text(separator, curX, y);
      curX += sepW;
    }
    font(doc, "regular", 9.2);
    doc.fillColor(APPLICATION.ink).text(item.text, curX, y, {
      link: item.link,
      underline: Boolean(item.underline),
    });
    curX += item.w;
  });
  y += 13;

  // 1. PROFESSIONAL SUMMARY
  heading("PROFESSIONAL SUMMARY");
  const summary =
    configuration.professionalSummary ||
    profile.professionalSummary ||
    "Full-stack software engineer building type-safe web applications, REST APIs, authentication systems, and relational/NoSQL data solutions using React, Next.js, TypeScript, Node.js, Express.js, and Python frameworks. Focused on maintainable architecture, secure integrations, testing, CI/CD, and practical AI application features.";
  font(doc, "regular", 8.8);
  doc
    .fillColor(APPLICATION.ink)
    .text(summary, left, y, { width, lineGap: 1.1 });
  y = doc.y + 3;

  // 2. PROFESSIONAL EXPERIENCE
  heading("PROFESSIONAL EXPERIENCE");
  const expItems = profile.experience.slice(0, 2);
  expItems.forEach((item, index) => {
    const rawRole = item.role || item.milestone || "";
    const rawCompany = item.company || item.facility || "";
    let titleLine = rawRole;
    if (rawCompany && !rawRole.includes(rawCompany)) {
      titleLine = `${rawRole} — ${rawCompany}`;
    }
    let dateText = clean(item.meta);
    if (
      /06\/2026|2026-06/i.test(dateText) &&
      /09\/2026|2026-09/i.test(dateText)
    ) {
      dateText = "June 2026 – Sept 2026";
    } else if (
      /12\/2025|2025-12/i.test(dateText) &&
      /01\/2026|2026-01/i.test(dateText)
    ) {
      dateText = "Dec 2025 – Jan 2026";
    }
    datedTitle(titleLine, dateText, { size: 9.4, spacing: 2 });

    const bullets = item.cvBullets?.length
      ? item.cvBullets
      : item.bullets?.length
        ? item.bullets
        : splitDetails(item.details);
    bullets.forEach(bulletLine);
    if (index < expItems.length - 1) y += 2;
  });

  // 3. PROJECT EXPERIENCE
  heading("PROJECT EXPERIENCE");
  const projectList = projects.slice(0, 3);
  projectList.forEach((project, index) => {
    font(doc, "bold", 9.4);
    const nameStr = clean(project.name);
    let curPx = left;
    doc.fillColor(APPLICATION.ink).text(nameStr, curPx, y);
    curPx += doc.widthOfString(nameStr);

    const projectLinks = [
      { label: "GitHub", url: project.github },
      { label: "Live Demo", url: project.demo },
    ].filter((link) => clean(link.url));

    const activeLinks =
      project.slug === "jobpilot-ai"
        ? projectLinks.filter((l) => l.label === "Live Demo")
        : projectLinks;

    for (const link of activeLinks) {
      font(doc, "regular", 9.4);
      const pipe = " | ";
      doc.fillColor(APPLICATION.ink).text(pipe, curPx, y);
      curPx += doc.widthOfString(pipe);

      const labelW = doc.widthOfString(link.label);
      doc.fillColor(APPLICATION.ink).text(link.label, curPx, y, {
        link: link.url,
        underline: true,
      });
      curPx += labelW;
    }
    y += 12;

    const bullet =
      project.cvBullets?.[0] ||
      project.features?.[0] ||
      project.description ||
      "";
    bulletLine(bullet);
    if (index < projectList.length - 1) y += 1;
  });

  // 4. TECHNICAL SKILLS
  heading("TECHNICAL SKILLS");
  const standardSkillCategories = [
    {
      label: "Languages & Web",
      fallback: [
        "TypeScript",
        "JavaScript",
        "Python",
        "PHP",
        "HTML5",
        "CSS3",
        "SQL",
      ],
    },
    {
      label: "Frontend",
      fallback: [
        "React.js",
        "Next.js",
        "Angular",
        "Tailwind CSS",
        "Zustand",
        "TanStack Query",
        "Vite",
        "Framer Motion",
      ],
    },
    {
      label: "Backend & APIs",
      fallback: [
        "Node.js",
        "Express.js",
        "NestJS",
        "FastAPI",
        "Django",
        "Django REST Framework",
        "RESTful APIs",
      ],
    },
    {
      label: "Databases & ORM",
      fallback: [
        "PostgreSQL",
        "MySQL",
        "MariaDB",
        "MongoDB",
        "Mongoose",
        "Supabase",
        "SQLAlchemy",
        "Alembic",
      ],
    },
    {
      label: "Auth & DevOps",
      fallback: [
        "JWT",
        "RBAC",
        "Argon2",
        "Git",
        "GitHub",
        "CI/CD",
        "Vercel",
        "Render",
      ],
    },
    {
      label: "AI",
      fallback: ["LLMs", "RAG", "Prompt Engineering", "AI API Integration"],
    },
    {
      label: "Architecture & Testing",
      fallback: [
        "Clean Architecture",
        "SOLID",
        "Design Patterns",
        "Scalable Systems",
        "Pytest",
        "Vitest",
        "Jest",
      ],
    },
  ];

  const skillsByCategory = new Map();
  skills.forEach((s) => {
    const cat = s.category || "Other";
    if (!skillsByCategory.has(cat)) skillsByCategory.set(cat, []);
    skillsByCategory.get(cat).push(s.name);
  });

  standardSkillCategories.forEach((group) => {
    const found = skillsByCategory.get(group.label) || [];
    const list = found.length ? found : group.fallback;
    const prefix = `${group.label}: `;
    const listStr = list.join(", ");
    font(doc, "bold", 8.8);
    doc
      .fillColor(APPLICATION.ink)
      .text(prefix, left, y, { continued: true, lineGap: 1 });
    font(doc, "regular", 8.8);
    doc
      .fillColor(APPLICATION.ink)
      .text(listStr, { lineGap: 1, continued: false });
    y = doc.y + 1.8;
  });

  // 5. EDUCATION & CERTIFICATION
  heading("EDUCATION & CERTIFICATION");
  const edu = education[0] || {
    degree: "Bachelor of Science in Computer Science",
    school: "Lebanese International University (LIU)",
    period: "Oct 2022 – June 2025",
  };
  const eduTitle = `${edu.degree} — ${edu.school}`;
  datedTitle(eduTitle, edu.period || "Oct 2022 – June 2025", {
    size: 9.4,
    spacing: 2.5,
  });

  const cert = certifications.find((c) => /aws|re\/start/i.test(c.title)) ||
    certifications[0] || {
      title:
        "AWS re/Start Bootcamp – Cloud Computing & DevOps Fundamentals — Amazon Web Services",
      year: "Expected 2026",
    };
  const certTitle = cert.title.includes("Amazon Web Services")
    ? cert.title
    : `${cert.title} — ${cert.issuer || "Amazon Web Services"}`;
  datedTitle(certTitle, cert.year || "Expected 2026", {
    size: 9.4,
    spacing: 2,
  });

  // 6. LANGUAGES
  heading("LANGUAGES");
  font(doc, "bold", 9);
  doc.fillColor(APPLICATION.ink).text("Arabic: ", left, y, { continued: true });
  font(doc, "regular", 9);
  doc.fillColor(APPLICATION.ink).text("Native", { continued: true });
  font(doc, "regular", 9);
  doc.fillColor(APPLICATION.ink).text("   |   ", { continued: true });
  font(doc, "bold", 9);
  doc.fillColor(APPLICATION.ink).text("English: ", { continued: true });
  font(doc, "regular", 9);
  doc
    .fillColor(APPLICATION.ink)
    .text("Professional Working Proficiency", { continued: false });
  y += 12;

  if (y > APPLICATION.bottom)
    throw new Error(
      `Application CV exceeds one A4 page (${Math.ceil(y - APPLICATION.bottom)}pt overflow).`,
    );
}

export async function generateCvPdfBuffer({
  origin = "",
  mode = "application",
  tailor,
} = {}) {
  const data = await resolveCvData(mode);
  if (tailor && mode === "application") {
    const projectOrder = new Map(
      (tailor.projectSlugs ?? []).map((slug, index) => [slug, index]),
    );
    const selectedProjects = data.projects
      .filter((project) => projectOrder.has(project.slug))
      .sort((a, b) => projectOrder.get(a.slug) - projectOrder.get(b.slug));
    if (selectedProjects.length) data.projects = selectedProjects;

    const evidence = (tailor.strongMatches ?? []).join(" ").toLowerCase();
    data.skills = [...data.skills].sort((a, b) => {
      const aRelevant = evidence.includes(clean(a.name).toLowerCase()) ? 1 : 0;
      const bRelevant = evidence.includes(clean(b.name).toLowerCase()) ? 1 : 0;
      return bRelevant - aRelevant;
    });
    const tailoredSummary = clean(tailor.summary).slice(0, 650);
    if (tailoredSummary) {
      data.configuration = {
        ...data.configuration,
        professionalSummary: tailoredSummary,
      };
    }
  }
  const {
    profile,
    projects,
    skills,
    education,
    certifications,
    languages,
    configuration,
    mode: resolvedMode,
  } = data;
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: TOP,
      bottom: PAGE.height - BOTTOM,
      left: LEFT,
      right: LEFT,
    },
    bufferPages: true,
    info: {
      Title: `${clean(profile.name)} - CV`,
      Author: clean(profile.name),
      Subject: "Curriculum Vitae",
      Producer: "Portfolio CV Generator",
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
  if (mode === "application") {
    drawApplicationCv(doc, data, origin);
    doc.end();
    return buffer;
  }
  drawHeader(doc, flow, profile, origin, configuration.header);
  const titles = resolvedMode.sectionTitles;
  const renderers = {
    summary: () =>
      drawSummary(
        doc,
        flow,
        configuration.professionalSummary ||
          profile.professionalSummary ||
          profile.bio,
        titles.summary,
      ),
    experience: () =>
      drawExperience(doc, flow, profile.experience, titles.experience),
    projects: () => drawProjects(doc, flow, projects, titles.projects),
    education: () => drawEducation(doc, flow, education, titles.education),
    skills: () => drawSkills(doc, flow, skills, titles.skills),
    certifications: () =>
      drawCertifications(doc, flow, certifications, titles.certifications),
    languages: () =>
      drawLanguages(doc, flow, languages.join(" | "), titles.languages),
  };
  for (const key of resolvedMode.sections) renderers[key]?.();
  doc.end();
  return buffer;
}
