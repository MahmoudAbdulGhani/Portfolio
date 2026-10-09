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

// Application CV uses metric-compatible clones of the reference's Calibri/Cambria.
// Carlito is advance-for-advance identical to Calibri; Caladea approximates Cambria.
const APPLICATION_FONTS = {
  regular: require.resolve("@fontsource/carlito/files/carlito-latin-400-normal.woff"),
  italic: require.resolve("@fontsource/carlito/files/carlito-latin-400-italic.woff"),
  bold: require.resolve("@fontsource/carlito/files/carlito-latin-700-normal.woff"),
  boldItalic:
    require.resolve("@fontsource/carlito/files/carlito-latin-700-italic.woff"),
  serif: require.resolve("@fontsource/caladea/files/caladea-latin-400-normal.woff"),
  serifBold: require.resolve("@fontsource/caladea/files/caladea-latin-700-normal.woff"),
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

// Geometry mirrors the reference one-page application CV (US Letter).
const APPLICATION = {
  page: { width: 612, height: 792 },
  left: 36.03,
  bulletIndent: 18,
  textWidth: 540.42,
  // Bullet text starts at 54.03; the reference's wrap column is 516pt wide,
  // which reproduces every bullet line break in the source document.
  bulletWidth: 516,
  ruleColor: "#1E293B",
  ruleHeight: 0.75,
  ruleX0: 34.525,
  ruleX1: 577.745,
  ink: "#111111",
  // Every value above was measured from the reference PDF, not chosen for
  // aesthetics. Changing one shifts real text, so keep
  // `npm run test:cv-reference` --prefix server passing: it diffs the generated
  // application CV against server/test/fixtures/application-cv-reference.json
  // and enforces x 2.0pt, y 1.0pt, and rules 1.0pt. The vertical tolerance is
  // 1.0pt rather than tighter because Word sets a bullet glyph on a different
  // baseline than PDFKit does (0.53pt observed); x is 2.0pt because Carlito and
  // Caladea are not pixel-identical to Calibri and Cambria (1.10pt observed on
  // the contact line). Rule thickness is never compared: Word draws link
  // underlines as 0.75pt rects where PDFKit draws zero-height lines.
  //
  // Natural line height of Carlito 10pt is 12.207pt; the reference uses 12.75
  // for wrapped body copy, 12.25 within bullets, and 13.75 between bullets.
  bodyLeading: 12.75,
  bulletLeading: 12.25,
  // The reference opens the list with two roomier gaps, then settles at 12.75.
  bulletGapWide: 13.75,
  bulletGap: 12.75,
  // Title baseline for each experience entry, from the reference.
  experienceTitleY: [183.33, 307.88],
  // Right edge of the right-aligned date for each experience entry.
  experienceDateRight: [569.78, 567.79],
  // First bullet text baseline for each experience entry, from the reference.
  experienceBulletY: [201.31, 325.58],
};

function drawApplicationCv(doc, data, origin) {
  const { profile, projects, skills, education, certifications, languages, configuration } =
    data;
  const { left, textWidth, ink } = APPLICATION;

  const setFont = (face, size) => {
    doc.font(APPLICATION_FONTS[face]).fontSize(size);
  };

  // Draw a single visual line at an absolute top coordinate.
  const line = (runs, y, options = {}) => {
    const { x = left, width = textWidth, align, link } = options;
    const widthOf = (run) => {
      setFont(run.face ?? "regular", run.size);
      return doc.widthOfString(run.text);
    };
    const total = runs.reduce((sum, run) => sum + widthOf(run), 0);
    let cursor = x;
    if (align === "center") cursor = x + (width - total) / 2;
    if (align === "right") cursor = x + width - total;
    for (const [index, run] of runs.entries()) {
      setFont(run.face ?? "regular", run.size);
      const href = run.link ?? link;
      const w = widthOf(run);
      // Each run is positioned absolutely, so wrapping is disabled; the width
      // is required for PDFKit to place link annotations.
      doc.fillColor(run.color ?? ink).text(run.text, cursor, y + (run.dy ?? 0), {
        width: w + 1,
        lineBreak: false,
        ...(href ? { link: href } : {}),
        underline: run.underline ?? false,
      });
      if (index < runs.length - 1) cursor += w;
    }
  };

  // A section rule plus the heading above it, matching reference offsets.
  const sectionRule = (y) => {
    doc
      .rect(
        APPLICATION.ruleX0,
        y,
        APPLICATION.ruleX1 - APPLICATION.ruleX0,
        APPLICATION.ruleHeight,
      )
      .fillColor(APPLICATION.ruleColor)
      .fill();
  };

  // Word-wrap helper matching PDFKit's greedy algorithm at a fixed leading.
  const wrapLines = (value, width, face, size) => {
    setFont(face, size);
    const words = value.split(" ");
    const out = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && doc.widthOfString(candidate) > width) {
        out.push(current);
        current = word;
      } else current = candidate;
    }
    if (current) out.push(current);
    return out;
  };

  // Wrapped paragraph rendered with explicit leading. Returns the bottom of the
  // last line, so callers can position the next element.
  const paragraph = (value, y, options = {}) => {
    const {
      x = left,
      width = textWidth,
      face = "regular",
      size = 10,
      leading = APPLICATION.bodyLeading,
    } = options;
    const value_ = clean(value);
    if (!value_) return y;
    const lines = wrapLines(value_, width, face, size);
    lines.forEach((text, index) => {
      setFont(face, size);
      doc.fillColor(ink).text(text, x, y + index * leading, {
        width,
        lineBreak: false,
      });
    });
    return y + (lines.length - 1) * leading;
  };

  const socials = profile.socials ?? [];
  const overrides = configuration.header?.overrides ?? {};
  const linkedin =
    overrides.linkedin ||
    socials.find((item) => /linkedin/i.test(item.label))?.url ||
    "https://linkedin.com/in/MahmoudAbdulGhani";
  const github =
    overrides.github ||
    socials.find((item) => /github/i.test(item.label))?.url ||
    "https://github.com/MahmoudAbdulGhani";
  const portfolioCandidate =
    overrides.portfolio || profile.portfolioUrl || origin;
  const portfolio = /^https?:\/\//i.test(portfolioCandidate)
    ? portfolioCandidate
    : "https://mahmoud-portfolio-omega.vercel.app/";
  const email =
    overrides.email || profile.email || "Mahmoud.Abdulghani@outlook.com";
  const phone = overrides.phone || profile.phone || "+961 76 364 340";
  const location = overrides.location || profile.location || "Tripoli, Lebanon";
  const name =
    overrides.name || profile.name || "Mahmoud Hussein Abdul Ghani";
  const title =
    overrides.title || profile.title || "Full-Stack Software Engineer";

  // --- Header ---
  line([{ text: name, face: "bold", size: 16 }], 36.05, {
    width: textWidth,
    align: "center",
  });
  line([{ text: title, face: "bold", size: 12 }], 59.61, {
    width: textWidth,
    align: "center",
  });

  const dot = "  \u2022  ";
  line(
    [
      { text: location },
      { text: dot },
      { text: phone, link: `tel:${phone.replace(/[^+\d]/g, "")}` },
      { text: dot },
      { text: email, link: `mailto:${email}`, underline: true },
      { text: dot },
      { text: "LinkedIn", link: linkedin, underline: true },
      { text: dot },
      { text: "GitHub", link: github, underline: true },
      { text: dot },
      { text: "Portfolio", link: portfolio, underline: true },
    ].map((run) => ({ size: 10, ...run })),
    79.26,
    { width: textWidth, align: "center" },
  );

  // --- PROFESSIONAL SUMMARY ---
  line([{ text: "PROFESSIONAL SUMMARY", face: "bold", size: 11 }], 97.56);
  sectionRule(115.03);
  const summary =
    configuration.professionalSummary ||
    profile.professionalSummary ||
    "";
  paragraph(summary, 117.78, { leading: APPLICATION.bodyLeading });

  // --- PROFESSIONAL EXPERIENCE ---
  line([{ text: "PROFESSIONAL EXPERIENCE", face: "bold", size: 11 }], 162.33);
  sectionRule(179.55);

  // Reference bullets sit on a 12.25pt rhythm: the glyph is drawn 1.53pt above
  // the text top, and each bullet block advances by its own line count.
  const bullet = (value, y, options = {}) => {
    const {
      leading = APPLICATION.bulletLeading,
      face = "regular",
      markerOffset = 1.53,
    } = options;
    setFont("regular", 11);
    doc.fillColor(ink).text("\u2022", left, y - markerOffset, {
      width: 8,
      lineBreak: false,
    });
    return paragraph(value, y, {
      x: left + APPLICATION.bulletIndent,
      width:
        APPLICATION.bulletWidth,
      leading,
      face,
    });
  };

  const experience = profile.experience.slice(0, 2);
  let cursor = 183.33;
  experience.forEach((item, index) => {
    const rawRole = item.role || item.milestone || "";
    const rawCompany = item.company || item.facility || "";
    const dateText = clean(item.meta);
    // `company` already ends with the location, which the reference renders in
    // regular weight. The split is the last two comma-separated segments.
    const segments = rawCompany.split(", ");
    const tail = segments.length > 2 ? segments.slice(-2).join(", ") : "";
    // The company name is bold; the trailing location is regular weight.
    const company = (tail
      ? rawCompany.slice(0, rawCompany.indexOf(tail)).trim()
      : rawCompany
    ).replace(/,+$/, "");
    // The reference drops the location to 10pt on the first entry only, and
    // keeps the separating comma with the bold name.
    const tailSize = index === 0 ? 10 : 11;
    const tailDy = tailSize === 11 ? 0 : 0.95;
    const titleRuns = [
      { text: `${rawRole} — ${company}${tailSize === 11 ? ", " : ""}`, face: "bold", size: 11 },
      ...(tailSize === 10 ? [{ text: ", ", face: "bold", size: 10, dy: 0.95 }] : []),
      ...(tail ? [{ text: tail, size: tailSize, dy: tailDy }] : []),
    ];
    const titleY = APPLICATION.experienceTitleY[index] ?? 183.33;
    line(titleRuns, titleY);
    if (dateText) {
      // Right-aligned on the lower baseline, matching the reference's edge.
      const right = APPLICATION.experienceDateRight[index] ?? 569.78;
      line([{ text: dateText, size: 10 }], titleY + 0.95, {
        x: left,
        width: right - left,
        align: "right",
      });
    }

    const bullets = item.cvBullets?.length
      ? item.cvBullets
      : item.bullets?.length
        ? item.bullets
        : splitDetails(item.details);
    let bulletCursor = APPLICATION.experienceBulletY[index] ?? 201.31;
    bullets.forEach((value, bulletIndex) => {
      bulletCursor = bullet(value, bulletCursor, {
        // The reference hugs the marker to the text once the gaps tighten.
        markerOffset: bulletIndex < 3 ? 1.53 : 0.53,
      });
      if (bulletIndex < bullets.length - 1) {
        bulletCursor +=
          bulletIndex < 2 ? APPLICATION.bulletGapWide : APPLICATION.bulletGap;
      }
    });
  });

  // --- PROJECT EXPERIENCE ---
  line([{ text: "PROJECT EXPERIENCE", face: "bold", size: 11 }], 358.4);
  sectionRule(375.87);

  const projectLinks = (project) =>
    [
      { label: "GitHub", url: project.github },
      { label: "Live Demo", url: project.demo },
    ].filter((link) => clean(link.url));

  // Absolute title anchors from the reference; the description flows beneath
  // each one, so only the title positions are fixed.
  const projectTitleY = [379.4, 434.68, 475.93];
  let projectBottom = 0;
  for (const [index, project] of projects.slice(0, 3).entries()) {
    const nameStr = clean(project.name);
    const links =
      project.slug === "jobpilot-ai"
        ? projectLinks(project).filter((l) => l.label === "Live Demo")
        : projectLinks(project);
    const runs = [{ text: nameStr, face: "bold", size: 11 }];
    for (const link of links)
      runs.push(
        { text: " | ", face: "italic", size: 10, dy: 0.95 },
        { text: link.label, size: 10, dy: 0.95, link: link.url, underline: true },
      );
    // Retain the standard reference anchors; reordered tailored projects must
    // leave room for the preceding paragraph's real line count.
    const titleY = Math.max(projectTitleY[index] ?? 379.4 + index * 55, projectBottom + 14);
    line(runs, titleY);

    const description =
      project.cvBullets?.[0] || project.features?.[0] || project.description || "";
    // Project descriptions hang 0.53pt below their marker, unlike the 1.53pt
    // offset used by the experience section.
    projectBottom = bullet(description, titleY + (project.slug === "jobpilot-ai" ? 16.97 : 13.95), {
      face: "regular",
      leading: APPLICATION.bulletLeading,
      markerOffset: 0.55,
    });
  }

  // --- TECHNICAL SKILLS ---
  const projectShift = Math.max(0, projectBottom + 18 - 520.45);
  line([{ text: "TECHNICAL SKILLS", face: "bold", size: 11 }], 520.45 + projectShift);
  sectionRule(537.92 + projectShift);

  const skillGroups = groupSkills(skills);
  let skillY = 540.65 + projectShift;
  for (const group of skillGroups) {
    if (!group.names.length) continue;
    line(
      [
        { text: `${group.category}: `, face: "bold", size: 10 },
        { text: group.names.join(", "), size: 10 },
      ],
      skillY,
    );
    skillY += 13.75;
  }

  // --- EDUCATION & CERTIFICATION ---
  line([{ text: "EDUCATION & TRAINING", face: "bold", size: 11 }], 642.48 + projectShift);
  sectionRule(659.95 + projectShift);

  const edu = education[0] || {};
  const school = clean(edu.school).replace(/\s*\(LIU\)\s*$/, "");
  line(
    [
      { text: clean(edu.degree), face: "bold", size: 10 },
      { text: " \u2014 ", face: "italic", size: 10 },
      { text: `${school} `, face: "boldItalic", size: 10 },
      { text: "(LIU)", face: "italic", size: 10 },
    ],
    662.7 + projectShift,
  );
  line([{ text: clean(edu.period), face: "bold", size: 9 }], 663.65 + projectShift, {
    x: left,
    width: 558.78 - left,
    align: "right",
  });

  // Certifications follow the mode selection, so admin edits are honoured. The
  // first entry sits at the reference anchor and later ones step down the page.
  const certStep = 19;
  const shownCerts = certifications.filter((cert) => {
    const title = clean(cert.title);
    const issuer = clean(cert.issuer);
    return Boolean(title || issuer);
  });
  const certsShown = Math.min(shownCerts.length, 4);
  shownCerts.slice(0, certsShown).forEach((cert, index) => {
    const title = clean(cert.title);
    const issuer = clean(cert.issuer);
    const base = 677.46 + index * certStep + projectShift;
    line(
      [
        { text: title, face: "bold", size: 10 },
        ...(issuer ? [{ text: ` — ${issuer}`, face: "italic", size: 10 }] : []),
      ],
      base,
    );
    line([{ text: clean(cert.year), face: "bold", size: 9 }], base + 0.95, {
      x: left,
      width: 561.73 - left,
      align: "right",
    });
  });

  // --- LANGUAGES ---
  // Entries are "Label: Level"; the label is bold and the level follows in
  // regular weight, joined by the reference's four-space pipe separator.
  const languageEntries = languages.map(clean).filter(Boolean);
  const languageRuns = [];
  languageEntries.forEach((entry, index) => {
    const colon = entry.indexOf(":");
    const label = colon === -1 ? entry : entry.slice(0, colon).trim();
    const level = colon === -1 ? "" : entry.slice(colon + 1).trim();
    const last = index === languageEntries.length - 1;
    languageRuns.push({ text: `${label}:`, face: "bold", size: 10 });
    if (level) {
      const tail = ` ${level}`;
      languageRuns.push({ text: last ? tail : `${tail}    |   `, size: 10 });
    }
  });
  if (languageRuns.length) {
    const languageTop = 696.25 + Math.max(0, certsShown - 1) * certStep + projectShift;
    line([{ text: "LANGUAGES", face: "bold", size: 11 }], languageTop);
    sectionRule(languageTop + 17.475);
    line(languageRuns, languageTop + 20.2);
  }
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
  const isApplication = mode === "application";
  const doc = new PDFDocument({
    size: isApplication
      ? [APPLICATION.page.width, APPLICATION.page.height]
      : "A4",
    margins: isApplication
      ? { top: 0, bottom: 0, left: 0, right: 0 }
      : {
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
  if (isApplication) {
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
