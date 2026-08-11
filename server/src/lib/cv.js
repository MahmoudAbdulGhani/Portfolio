import PDFDocument from "pdfkit";
import { prisma } from "./prisma.js";

/*
 * CV PDF layout
 * --------------------------------------------------------------------------
 * This generator keeps one explicit vertical cursor instead of mixing
 * PDFKit's implicit doc.y updates with manually calculated positions. Each
 * block is measured using exactly the text that is drawn, then the cursor is
 * advanced by that measured height. A complete resume entry moves to the next
 * page when it will not fit, so content cannot collide or enter the footer.
 */

const PAGE = { width: 595.28, height: 841.89 }; // A4 in points
const MARGIN_X = 44;
const TOP = 42;
const FOOTER_Y = 808;
const CONTENT_BOTTOM = 782;
const CONTENT_W = PAGE.width - MARGIN_X * 2;
const CONTENT_H = CONTENT_BOTTOM - TOP;

const FONT = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

const COLORS = {
  heading: "#0f172a",
  accent: "#2563eb",
  ink: "#1e293b",
  muted: "#64748b",
  line: "#dbe3ee",
};

function cleanText(value) {
  if (value == null) return "";

  return String(value)
    .replace(/\r?\n/g, " ")
    .replace(/â€”|â€“/g, "-")
    .replace(/â€¢|Â·/g, ", ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2022\u00b7]/g, ", ")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanUrl(url) {
  return cleanText(url).replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function configureFont(doc, { font = FONT, size = 9.5 } = {}) {
  doc.font(font).fontSize(size);
}

function textHeight(
  doc,
  value,
  { font = FONT, size = 9.5, width = CONTENT_W, lineGap = 2 } = {},
) {
  const text = cleanText(value);
  if (!text) return 0;
  configureFont(doc, { font, size });
  return doc.heightOfString(text, { width, lineGap });
}

function textWidth(doc, value, { font = FONT, size = 9.5 } = {}) {
  const text = cleanText(value);
  if (!text) return 0;
  configureFont(doc, { font, size });
  return doc.widthOfString(text);
}

function rawTextWidth(doc, value, { font = FONT, size = 9.5 } = {}) {
  const text = String(value ?? "");
  if (!text) return 0;
  configureFont(doc, { font, size });
  return doc.widthOfString(text);
}

function drawText(
  doc,
  value,
  x,
  y,
  {
    font = FONT,
    size = 9.5,
    width = CONTENT_W,
    lineGap = 2,
    color = COLORS.ink,
    align,
    link,
    underline = false,
  } = {},
) {
  const text = cleanText(value);
  if (!text) return 0;

  const height = textHeight(doc, text, { font, size, width, lineGap });
  configureFont(doc, { font, size });
  doc
    .fillColor(color)
    .text(text, x, y, { width, lineGap, align, link, underline });
  return height;
}

function drawInlineText(
  doc,
  value,
  x,
  y,
  {
    font = FONT,
    size = 9,
    color = COLORS.muted,
    link,
    underline = false,
    preserveWhitespace = false,
  } = {},
) {
  const text = preserveWhitespace ? String(value ?? "") : cleanText(value);
  if (!text) return;
  configureFont(doc, { font, size });
  const width = doc.widthOfString(text);
  doc
    .fillColor(color)
    .text(text, x, y, { width, lineBreak: false, link, underline });
}

function createFlow() {
  return { y: TOP };
}

function drawPageAccent(doc) {
  doc
    .rect(MARGIN_X, TOP - 12, CONTENT_W, 1.5)
    .fillColor(COLORS.accent)
    .fill();
}

function addPage(doc, flow) {
  doc.addPage();
  flow.y = TOP;
  drawPageAccent(doc);
}

function ensureSpace(doc, flow, needed) {
  if (needed <= CONTENT_H && flow.y + needed > CONTENT_BOTTOM) {
    addPage(doc, flow);
  }
}

function advance(flow, amount) {
  flow.y += amount;
}

function singleLineHeight(size) {
  // Leave visible leading between manually packed inline rows. PDFKit's
  // glyph bounds can exceed the nominal font size by a fraction of a point.
  return size + 4.5;
}

function drawDivider(doc, y, accentWidth = 52) {
  doc
    .moveTo(MARGIN_X, y)
    .lineTo(MARGIN_X + CONTENT_W, y)
    .lineWidth(0.75)
    .strokeColor(COLORS.line)
    .stroke();
  doc
    .moveTo(MARGIN_X, y)
    .lineTo(MARGIN_X + accentWidth, y)
    .lineWidth(1.5)
    .strokeColor(COLORS.accent)
    .stroke();
}

function inlineItemsHeight(doc, items, { size = 9 } = {}) {
  const valid = items.filter((item) => cleanText(item.text));
  if (!valid.length) return 0;

  const rowHeight = singleLineHeight(size);
  const separatorWidth = rawTextWidth(doc, " | ", { size });
  let rows = 1;
  let x = 0;

  for (const item of valid) {
    const itemWidth = textWidth(doc, item.text, { size });
    const prefixWidth = x > 0 ? separatorWidth : 0;

    if (x > 0 && x + prefixWidth + itemWidth > CONTENT_W) {
      rows += 1;
      x = 0;
    }

    if (itemWidth > CONTENT_W) {
      rows += Math.max(
        0,
        Math.ceil(
          textHeight(doc, item.text, {
            size,
            width: CONTENT_W,
            lineGap: 1,
          }) / rowHeight,
        ) - 1,
      );
      x = 0;
      continue;
    }

    x += (x > 0 ? separatorWidth : 0) + itemWidth;
  }

  return rows * rowHeight;
}

function drawInlineItems(doc, flow, items, { size = 9 } = {}) {
  const valid = items.filter((item) => cleanText(item.text));
  if (!valid.length) return;

  const rowHeight = singleLineHeight(size);
  const separator = " | ";
  const separatorWidth = rawTextWidth(doc, separator, { size });
  let x = MARGIN_X;
  let y = flow.y;

  for (const item of valid) {
    const itemText = cleanText(item.text);
    const itemWidth = textWidth(doc, itemText, { size });
    const needsSeparator = x > MARGIN_X;
    const prefixWidth = needsSeparator ? separatorWidth : 0;

    if (
      needsSeparator &&
      x + prefixWidth + itemWidth > MARGIN_X + CONTENT_W
    ) {
      x = MARGIN_X;
      y += rowHeight;
    }

    if (itemWidth > CONTENT_W) {
      if (x > MARGIN_X) {
        x = MARGIN_X;
        y += rowHeight;
      }
      const height = drawText(doc, itemText, x, y, {
        size,
        width: CONTENT_W,
        lineGap: 1,
        color: item.link ? COLORS.accent : COLORS.muted,
        link: item.link,
        underline: Boolean(item.link),
      });
      y += height + 1;
      x = MARGIN_X;
      continue;
    }

    if (x > MARGIN_X) {
      drawInlineText(doc, separator, x, y, {
        size,
        color: COLORS.muted,
        preserveWhitespace: true,
      });
      x += separatorWidth;
    }

    drawInlineText(doc, itemText, x, y, {
      size,
      color: item.link ? COLORS.accent : COLORS.muted,
      link: item.link,
      underline: Boolean(item.link),
    });
    x += itemWidth;
  }

  flow.y = y + rowHeight;
}

function sectionHeading(doc, flow, label, firstEntryHeight = 0) {
  const lead = flow.y > TOP + 1 ? 10 : 0;
  const labelHeight = textHeight(doc, label, {
    font: FONT_BOLD,
    size: 10.5,
    lineGap: 1,
  });
  const headingHeight = labelHeight + 5 + 9;
  const needed =
    lead +
    headingHeight +
    Math.min(firstEntryHeight, CONTENT_H - headingHeight);

  ensureSpace(doc, flow, needed);
  advance(flow, lead);

  drawText(doc, label.toUpperCase(), MARGIN_X, flow.y, {
    font: FONT_BOLD,
    size: 10.5,
    width: CONTENT_W,
    lineGap: 1,
    color: COLORS.heading,
  });

  const lineY = flow.y + labelHeight + 5;
  drawDivider(doc, lineY);
  flow.y = lineY + 9;
}

function titleMetaMetrics(
  doc,
  title,
  meta,
  { titleSize = 10.6, metaSize = 8.8, minTitleWidth = 230 } = {},
) {
  const safeTitle = cleanText(title);
  const safeMeta = cleanText(meta);
  const gap = 12;
  const metaWidth = safeMeta
    ? Math.min(170, textWidth(doc, safeMeta, { size: metaSize }) + 2)
    : 0;
  const titleWidth = CONTENT_W - metaWidth - gap;

  if (!safeMeta || titleWidth < minTitleWidth) {
    const titleHeight = textHeight(doc, safeTitle, {
      font: FONT_BOLD,
      size: titleSize,
      width: CONTENT_W,
      lineGap: 1.5,
    });
    const metaHeight = safeMeta
      ? textHeight(doc, safeMeta, {
          size: metaSize,
          width: CONTENT_W,
          lineGap: 1,
        })
      : 0;

    return {
      stacked: true,
      titleHeight,
      metaHeight,
      total: titleHeight + (safeMeta ? metaHeight + 1 : 0),
    };
  }

  const titleHeight = textHeight(doc, safeTitle, {
    font: FONT_BOLD,
    size: titleSize,
    width: titleWidth,
    lineGap: 1.5,
  });
  const metaHeight = textHeight(doc, safeMeta, {
    size: metaSize,
    width: metaWidth,
    lineGap: 1,
  });

  return {
    stacked: false,
    titleWidth,
    metaWidth,
    titleHeight,
    metaHeight,
    total: Math.max(titleHeight, metaHeight),
  };
}

function drawTitleMeta(
  doc,
  flow,
  title,
  meta,
  metrics,
  { titleSize = 10.6, metaSize = 8.8 } = {},
) {
  if (metrics.stacked) {
    drawText(doc, title, MARGIN_X, flow.y, {
      font: FONT_BOLD,
      size: titleSize,
      width: CONTENT_W,
      lineGap: 1.5,
      color: COLORS.heading,
    });
    advance(flow, metrics.titleHeight);

    if (cleanText(meta)) {
      advance(flow, 1);
      drawText(doc, meta, MARGIN_X, flow.y, {
        size: metaSize,
        width: CONTENT_W,
        lineGap: 1,
        color: COLORS.muted,
        align: "right",
      });
      advance(flow, metrics.metaHeight);
    }
    return;
  }

  drawText(doc, title, MARGIN_X, flow.y, {
    font: FONT_BOLD,
    size: titleSize,
    width: metrics.titleWidth,
    lineGap: 1.5,
    color: COLORS.heading,
  });
  drawText(doc, meta, MARGIN_X + CONTENT_W - metrics.metaWidth, flow.y, {
    size: metaSize,
    width: metrics.metaWidth,
    lineGap: 1,
    color: COLORS.muted,
    align: "right",
  });
  advance(flow, metrics.total);
}

function bulletHeight(doc, value, { size = 9.3 } = {}) {
  return (
    textHeight(doc, value, {
      size,
      width: CONTENT_W - 14,
      lineGap: 2,
    }) + 2
  );
}

function drawBullet(doc, flow, value, { size = 9.3 } = {}) {
  const height = bulletHeight(doc, value, { size });
  ensureSpace(doc, flow, height);
  const y = flow.y;

  configureFont(doc, { size });
  doc
    .fillColor(COLORS.accent)
    .text("\u2022", MARGIN_X, y, { width: 8, lineBreak: false });
  drawText(doc, value, MARGIN_X + 14, y, {
    size,
    width: CONTENT_W - 14,
    lineGap: 2,
    color: COLORS.ink,
  });
  advance(flow, height);
}

function labeledLineMetrics(doc, label, value, { size = 9.1 } = {}) {
  const labelText = cleanText(label) + ":";
  const labelWidth =
    textWidth(doc, labelText, { font: FONT_BOLD, size }) +
    rawTextWidth(doc, " ", { font: FONT_BOLD, size });
  const valueText = cleanText(value);

  if (labelWidth > 145 || CONTENT_W - labelWidth < 190) {
    const labelHeight = textHeight(doc, labelText, {
      font: FONT_BOLD,
      size,
      lineGap: 1,
    });
    const valueHeight = textHeight(doc, valueText, {
      size,
      lineGap: 2,
    });
    return {
      stacked: true,
      labelHeight,
      valueHeight,
      total: labelHeight + valueHeight + 1,
    };
  }

  const valueWidth = CONTENT_W - labelWidth;
  const valueHeight = textHeight(doc, valueText, {
    size,
    width: valueWidth,
    lineGap: 2,
  });
  const labelHeight = textHeight(doc, labelText, {
    font: FONT_BOLD,
    size,
    width: labelWidth,
    lineGap: 1,
  });

  return {
    stacked: false,
    labelWidth,
    labelHeight,
    valueHeight,
    total: Math.max(labelHeight, valueHeight),
  };
}

function drawLabeledLine(doc, flow, label, value, metrics, { size = 9.1 } = {}) {
  const labelText = cleanText(label) + ":";

  if (metrics.stacked) {
    drawText(doc, labelText, MARGIN_X, flow.y, {
      font: FONT_BOLD,
      size,
      lineGap: 1,
      color: COLORS.heading,
    });
    advance(flow, metrics.labelHeight + 1);
    drawText(doc, value, MARGIN_X, flow.y, {
      size,
      lineGap: 2,
      color: COLORS.ink,
    });
    advance(flow, metrics.valueHeight);
    return;
  }

  drawText(doc, labelText, MARGIN_X, flow.y, {
    font: FONT_BOLD,
    size,
    width: metrics.labelWidth,
    lineGap: 1,
    color: COLORS.heading,
  });
  drawText(doc, value, MARGIN_X + metrics.labelWidth, flow.y, {
    size,
    width: CONTENT_W - metrics.labelWidth,
    lineGap: 2,
    color: COLORS.ink,
  });
  advance(flow, metrics.total);
}

function drawHeader(doc, flow, profile, origin) {
  const name = cleanText(profile.name) || "Curriculum Vitae";
  const title =
    cleanText(profile.title) || "Software Engineer / Full-Stack Developer";
  const socials = profile.socials ?? [];
  const github = socials.find((social) => /github/i.test(social.label))?.url;
  const linkedin = socials.find((social) => /linkedin/i.test(social.label))?.url;

  const nameHeight = textHeight(doc, name, {
    font: FONT_BOLD,
    size: 23,
    lineGap: 1,
  });
  drawText(doc, name, MARGIN_X, flow.y, {
    font: FONT_BOLD,
    size: 23,
    lineGap: 1,
    color: COLORS.heading,
  });
  advance(flow, nameHeight + 2);

  const titleHeight = textHeight(doc, title, {
    font: FONT,
    size: 12,
    lineGap: 1.5,
  });
  drawText(doc, title, MARGIN_X, flow.y, {
    size: 12,
    lineGap: 1.5,
    color: COLORS.accent,
  });
  advance(flow, titleHeight + 6);

  const contacts = [];
  if (profile.email) {
    contacts.push({
      text: cleanText(profile.email),
      link: "mailto:" + cleanText(profile.email),
    });
  }
  if (profile.phone) {
    contacts.push({
      text: cleanText(profile.phone),
      link: "tel:" + cleanText(profile.phone).replace(/[^+\d]/g, ""),
    });
  }
  if (profile.location) contacts.push({ text: cleanText(profile.location) });
  if (linkedin) contacts.push({ text: cleanUrl(linkedin), link: linkedin });
  if (github) contacts.push({ text: cleanUrl(github), link: github });
  if (origin) contacts.push({ text: cleanUrl(origin), link: origin });

  drawInlineItems(doc, flow, contacts, { size: 8.8 });
  advance(flow, 4);
  drawDivider(doc, flow.y, 64);
  advance(flow, 12);
}

function drawSummary(doc, flow, bio) {
  const summary = cleanText(bio);
  if (!summary) return;

  const paragraphHeight = textHeight(doc, summary, {
    size: 9.35,
    lineGap: 2.2,
  });
  sectionHeading(doc, flow, "Professional Summary", paragraphHeight);
  ensureSpace(doc, flow, paragraphHeight);
  drawText(doc, summary, MARGIN_X, flow.y, {
    size: 9.35,
    lineGap: 2.2,
    color: COLORS.ink,
  });
  advance(flow, paragraphHeight);
}

function isDateLikeMeta(value) {
  return /\d|present|current/i.test(cleanText(value));
}

function experienceMetrics(doc, job) {
  const title = cleanText(job.milestone);
  const rawMeta = cleanText(job.meta);
  const meta = isDateLikeMeta(rawMeta) ? rawMeta : "";
  const company = [cleanText(job.facility), meta ? "" : rawMeta]
    .filter(Boolean)
    .join(" | ");
  const detail = cleanText(job.details);
  const titleMeta = titleMetaMetrics(doc, title, meta);
  const companyHeight = company
    ? textHeight(doc, company, { size: 9.2, lineGap: 1.5 })
    : 0;
  const detailHeight = detail ? bulletHeight(doc, detail) : 0;

  return {
    title,
    meta,
    company,
    detail,
    titleMeta,
    companyHeight,
    detailHeight,
    total:
      titleMeta.total +
      (company ? companyHeight + 1.5 : 0) +
      (detail ? detailHeight + 2 : 0) +
      7,
  };
}

function drawExperience(doc, flow, experience) {
  const entries = (experience ?? [])
    .map((job) => experienceMetrics(doc, job))
    .filter((entry) => entry.title);
  if (!entries.length) return;

  sectionHeading(doc, flow, "Experience", entries[0].total);

  for (const entry of entries) {
    ensureSpace(doc, flow, entry.total);
    drawTitleMeta(doc, flow, entry.title, entry.meta, entry.titleMeta);

    if (entry.company) {
      advance(flow, 1.5);
      drawText(doc, entry.company, MARGIN_X, flow.y, {
        size: 9.2,
        lineGap: 1.5,
        color: COLORS.muted,
      });
      advance(flow, entry.companyHeight);
    }

    if (entry.detail) {
      advance(flow, 2);
      drawBullet(doc, flow, entry.detail);
    }
    advance(flow, 7);
  }
}

function selectResumeProjects(projects) {
  const ordered = [...(projects ?? [])].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });
  const featured = ordered.filter((project) => project.featured);
  return (featured.length ? featured : ordered).slice(0, 3);
}

function projectMetrics(doc, project) {
  const name = cleanText(project.name);
  const type = cleanText(project.type);
  const stack = (project.stack ?? [])
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 8)
    .join(", ");
  const features = (project.features ?? [])
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 2);
  const links = [];
  if (project.demo) links.push({ text: "Live Demo", link: project.demo });
  if (project.github) links.push({ text: "GitHub", link: project.github });

  const nameHeight = textHeight(doc, name, {
    font: FONT_BOLD,
    size: 10.6,
    lineGap: 1.5,
  });
  const typeHeight = type
    ? textHeight(doc, type, { size: 9, lineGap: 1.2 })
    : 0;
  const stackMetrics = stack
    ? labeledLineMetrics(doc, "Technologies", stack)
    : null;
  const featureHeight = features.reduce(
    (total, feature) => total + bulletHeight(doc, feature),
    0,
  );
  const linksHeight = inlineItemsHeight(doc, links, { size: 8.8 });

  return {
    name,
    type,
    stack,
    features,
    links,
    nameHeight,
    typeHeight,
    stackMetrics,
    featureHeight,
    linksHeight,
    total:
      nameHeight +
      (type ? typeHeight + 1.5 : 0) +
      (stackMetrics ? stackMetrics.total + 2 : 0) +
      (features.length ? featureHeight + 2 : 0) +
      (links.length ? linksHeight + 2 : 0) +
      7,
  };
}

function drawProjects(doc, flow, projects) {
  const entries = selectResumeProjects(projects)
    .map((project) => projectMetrics(doc, project))
    .filter((entry) => entry.name);
  if (!entries.length) return;

  sectionHeading(doc, flow, "Selected Projects", entries[0].total);

  for (const entry of entries) {
    ensureSpace(doc, flow, entry.total);
    drawText(doc, entry.name, MARGIN_X, flow.y, {
      font: FONT_BOLD,
      size: 10.6,
      lineGap: 1.5,
      color: COLORS.heading,
    });
    advance(flow, entry.nameHeight);

    if (entry.type) {
      advance(flow, 1.5);
      drawText(doc, entry.type, MARGIN_X, flow.y, {
        size: 9,
        lineGap: 1.2,
        color: COLORS.muted,
      });
      advance(flow, entry.typeHeight);
    }

    if (entry.stackMetrics) {
      advance(flow, 2);
      drawLabeledLine(
        doc,
        flow,
        "Technologies",
        entry.stack,
        entry.stackMetrics,
      );
    }

    if (entry.features.length) {
      advance(flow, 2);
      for (const feature of entry.features) drawBullet(doc, flow, feature);
    }

    if (entry.links.length) {
      advance(flow, 2);
      drawInlineItems(doc, flow, entry.links, { size: 8.8 });
    }
    advance(flow, 7);
  }
}

function educationMetrics(doc, education) {
  const title = cleanText(education.degree);
  const meta = cleanText(education.period);
  const school = cleanText(education.school);
  const details = cleanText(education.details);
  const titleMeta = titleMetaMetrics(doc, title, meta);
  const schoolHeight = school
    ? textHeight(doc, school, { size: 9.2, lineGap: 1.5 })
    : 0;
  const detailsHeight = details
    ? textHeight(doc, details, { size: 8.9, lineGap: 1.4 })
    : 0;

  return {
    title,
    meta,
    school,
    details,
    titleMeta,
    schoolHeight,
    detailsHeight,
    total:
      titleMeta.total +
      (school ? schoolHeight + 1.5 : 0) +
      (details ? detailsHeight + 1 : 0) +
      6,
  };
}

function drawEducation(doc, flow, education) {
  const entries = (education ?? [])
    .map((item) => educationMetrics(doc, item))
    .filter((entry) => entry.title);
  if (!entries.length) return;

  sectionHeading(doc, flow, "Education", entries[0].total);

  for (const entry of entries) {
    ensureSpace(doc, flow, entry.total);
    drawTitleMeta(doc, flow, entry.title, entry.meta, entry.titleMeta);

    if (entry.school) {
      advance(flow, 1.5);
      drawText(doc, entry.school, MARGIN_X, flow.y, {
        size: 9.2,
        lineGap: 1.5,
        color: COLORS.muted,
      });
      advance(flow, entry.schoolHeight);
    }

    if (entry.details) {
      advance(flow, 1);
      drawText(doc, entry.details, MARGIN_X, flow.y, {
        size: 8.9,
        lineGap: 1.4,
        color: COLORS.muted,
      });
      advance(flow, entry.detailsHeight);
    }
    advance(flow, 6);
  }
}

function skillLabel(category) {
  const labels = {
    Frontend: "Frontend",
    Backend: "Backend",
    Data: "Databases",
    Tools: "Tools",
  };
  return labels[category] ?? category;
}

function drawSkills(doc, flow, skills) {
  if (!skills?.length) return;

  const order = ["Frontend", "Backend", "Data", "Tools"];
  const groups = new Map();
  for (const skill of skills) {
    const category = cleanText(skill.category) || "Other";
    const list = groups.get(category) ?? [];
    list.push(cleanText(skill.name));
    groups.set(category, list);
  }

  const entries = [...groups.entries()]
    .sort(([a], [b]) => {
      const orderA = order.indexOf(a);
      const orderB = order.indexOf(b);
      return (orderA < 0 ? 99 : orderA) - (orderB < 0 ? 99 : orderB);
    })
    .map(([category, names]) => {
      const label = skillLabel(category);
      const value = names.filter(Boolean).join(", ");
      return { label, value, metrics: labeledLineMetrics(doc, label, value) };
    })
    .filter((entry) => entry.value);
  if (!entries.length) return;

  sectionHeading(doc, flow, "Technical Skills", entries[0].metrics.total);
  for (const entry of entries) {
    ensureSpace(doc, flow, entry.metrics.total + 2);
    drawLabeledLine(doc, flow, entry.label, entry.value, entry.metrics);
    advance(flow, 2);
  }
}

function certificationMetrics(doc, certification) {
  const title = cleanText(certification.title);
  const meta = cleanText(certification.year);
  const issuer = cleanText(certification.issuer);
  const titleMeta = titleMetaMetrics(doc, title, meta, {
    titleSize: 10,
    metaSize: 8.7,
    minTitleWidth: 210,
  });
  const issuerHeight = issuer
    ? textHeight(doc, issuer, { size: 9, lineGap: 1.4 })
    : 0;
  const links = certification.url
    ? [{ text: "Credential", link: certification.url }]
    : [];
  const linksHeight = inlineItemsHeight(doc, links, { size: 8.7 });

  return {
    title,
    meta,
    issuer,
    titleMeta,
    issuerHeight,
    links,
    linksHeight,
    total:
      titleMeta.total +
      (issuer ? issuerHeight + 1 : 0) +
      (links.length ? linksHeight + 1 : 0) +
      5,
  };
}

function drawCertifications(doc, flow, certifications) {
  const entries = (certifications ?? [])
    .map((certification) => certificationMetrics(doc, certification))
    .filter((entry) => entry.title);
  if (!entries.length) return;

  sectionHeading(doc, flow, "Certifications & Training", entries[0].total);

  for (const entry of entries) {
    ensureSpace(doc, flow, entry.total);
    drawTitleMeta(doc, flow, entry.title, entry.meta, entry.titleMeta, {
      titleSize: 10,
      metaSize: 8.7,
    });

    if (entry.issuer) {
      advance(flow, 1);
      drawText(doc, entry.issuer, MARGIN_X, flow.y, {
        size: 9,
        lineGap: 1.4,
        color: COLORS.muted,
      });
      advance(flow, entry.issuerHeight);
    }

    if (entry.links.length) {
      advance(flow, 1);
      drawInlineItems(doc, flow, entry.links, { size: 8.7 });
    }
    advance(flow, 5);
  }
}

function drawLanguages(doc, flow, languages) {
  const value = cleanText(languages);
  if (!value) return;

  const height = textHeight(doc, value, { size: 9.2, lineGap: 1.6 });
  sectionHeading(doc, flow, "Languages", height);
  ensureSpace(doc, flow, height);
  drawText(doc, value, MARGIN_X, flow.y, {
    size: 9.2,
    lineGap: 1.6,
    color: COLORS.ink,
  });
  advance(flow, height);
}

function drawFooters(doc, name) {
  const range = doc.bufferedPageRange();
  const pageCount = range.count;
  const labelName = cleanText(name) || "Curriculum Vitae";

  for (let index = 0; index < pageCount; index += 1) {
    doc.switchToPage(index);
    configureFont(doc, { size: 8 });
    doc
      .fillColor(COLORS.muted)
      .text(
        labelName + " | Page " + (index + 1) + " of " + pageCount,
        MARGIN_X,
        FOOTER_Y,
        {
          width: CONTENT_W,
          align: "center",
          lineBreak: false,
        },
      );
  }
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
    prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.skill.findMany({ orderBy: { order: "asc" } }),
    prisma.education.findMany({ orderBy: { order: "asc" } }),
    prisma.certification.findMany({ orderBy: { order: "asc" } }),
  ]);

  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: TOP,
      // Normal content never relies on PDFKit's automatic page flow; it is
      // constrained by CONTENT_BOTTOM above. A zero bottom margin lets the
      // buffered footer render below that safe area without PDFKit creating an
      // extra blank page for it.
      bottom: 0,
      left: MARGIN_X,
      right: MARGIN_X,
    },
    bufferPages: true,
    info: {
      Title: cleanText(profile.name) + " - CV",
      Author: cleanText(profile.name),
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
  drawPageAccent(doc);
  drawHeader(doc, flow, profile, origin);
  drawSummary(doc, flow, profile.bio);
  drawExperience(doc, flow, profile.experience ?? []);
  drawProjects(doc, flow, projects);
  drawEducation(doc, flow, education);
  drawSkills(doc, flow, skills);
  drawCertifications(doc, flow, certifications);
  drawLanguages(doc, flow, profile.languages);
  drawFooters(doc, profile.name);
  doc.end();

  return buffer;
}
