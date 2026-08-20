import { Router } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { generateCvPdfBuffer } from "../lib/cv.js";
import { getCvCatalog, getOrCreateCvConfiguration, normalizeHeader, normalizeMode } from "../lib/cv-config.js";
import { consumeRateLimits } from "../lib/rate-limit.js";
import { changePasswordSchema, cvMutationSchema, loginSchema, profileMutationSchema, projectMutationSchema, routeIdSchema, slugSchema, validationMessage } from "../lib/validation.js";
import { clearAuthCookie, getAuthenticatedAdminId, requireAuth, setAuthCookie, signToken } from "../middleware/auth.js";
import { getClientIp } from "../lib/client-ip.js";

const router = Router();
const DUMMY_PASSWORD_HASH = "$2b$12$VyWR0jiclv4VqXmMnI/3QukirPLOLlgELqDeGEB67PLS9yv2mxiTS";

const str = (value) =>
  value === undefined || value === null ? null : String(value);

const strArr = (value) =>
  Array.isArray(value) ? value.map((v) => String(v)).filter(Boolean) : [];

const hexColor = /^#[0-9a-f]{6}$/i;

const normalizeProjectAccent = (value) => {
  if (typeof value !== "string") return null;
  const accent = value.trim();
  return hexColor.test(accent) ? accent.toUpperCase() : null;
};

/* ------------------------------- Auth --------------------------------- */

router.post("/auth/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: "A valid email and password are required." });
    const email = parsed.data.email.toLowerCase(); const { password } = parsed.data;
    const ip = getClientIp(req);
    const [ipThrottle, accountThrottle, combinedThrottle] = await consumeRateLimits([
      { key: `login-ip:${ip}`, limit: 25, windowMs: 15 * 60 * 1000 },
      { key: `login-account:${email}`, limit: 20, windowMs: 60 * 60 * 1000 },
      { key: `login-combined:${ip}:${email}`, limit: 8, windowMs: 15 * 60 * 1000 },
    ]);
    const throttle = [ipThrottle, accountThrottle, combinedThrottle].find((item) => item.limited);
    if (throttle) { console.warn("[security] login_rate_limited", { ip }); res.setHeader("Retry-After", String(throttle.retryAfter)); return res.status(429).json({ message: "Too many login attempts. Please try again later." }); }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    const passwordMatches = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_PASSWORD_HASH);
    const ok = Boolean(admin && passwordMatches);
    if (!ok) {
      console.warn("[security] login_failed", { ip });
      return res.status(401).json({ message: "Invalid email or password." });
    }

    setAuthCookie(res, signToken(admin.id));
    res.json({ admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

// A passive login-page probe uses 200 for both states so an expected signed-out
// state does not appear as a failed request in the browser console.
router.get("/auth/session", async (req, res, next) => {
  try {
    const adminId = getAuthenticatedAdminId(req);
    if (!adminId) return res.json({ admin: null });
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });
    if (!admin) clearAuthCookie(res);
    return res.json({ admin });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/change-password", requireAuth, async (req, res, next) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: "Provide the current password and a new password of 10–200 characters." });
    const { currentPassword, newPassword } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
    const ok = admin && (await bcrypt.compare(String(currentPassword), admin.passwordHash));
    if (!ok) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: await bcrypt.hash(String(newPassword), 12) },
    });

    res.json({ message: "Password updated." });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId },
      select: { id: true, email: true, name: true },
    });
    if (!admin) return res.status(401).json({ message: "Admin not found." });
    res.json(admin);
  } catch (error) {
    next(error);
  }
});

/* ----------------------------- CV manager ----------------------------- */

router.get("/cv", requireAuth, async (_req, res, next) => {
  try {
    const [configuration, catalog] = await Promise.all([
      getOrCreateCvConfiguration(), getCvCatalog(),
    ]);
    res.json({ configuration: {
      professionalSummary: configuration.professionalSummary,
      header: normalizeHeader(configuration.header),
      application: normalizeMode(configuration.application),
      master: normalizeMode(configuration.master),
    }, catalog });
  } catch (error) { next(error); }
});

router.put("/cv", requireAuth, async (req, res, next) => {
  try {
    const parsed = cvMutationSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed, "Invalid CV configuration.") });
    const body = parsed.data;
    const invalidDate = (value, allowPresent = false) => value && !(allowPresent && /^present$/i.test(String(value).trim())) && !/^\d{4}-(?:[1-9]|0[1-9]|1[0-2])$/.test(String(value).trim());
    for (const modeName of ["application", "master"]) {
      for (const group of ["experienceOverrides", "educationOverrides", "certificationOverrides"]) {
        for (const item of Object.values(body[modeName]?.[group] ?? {})) {
          if (invalidDate(item?.startDate) || invalidDate(item?.endDate, true)) return res.status(400).json({ message: "Dates must use YYYY-MM (for example 2026-05); an end date may also be Present." });
          if (item?.isCurrent && item?.endDate && !/^present$/i.test(String(item.endDate).trim())) return res.status(400).json({ message: "Current entries cannot also have a dated end date." });
        }
      }
    }
    const configuration = await prisma.cvConfiguration.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        professionalSummary: typeof body.professionalSummary === "string" ? body.professionalSummary.trim().slice(0, 4000) || null : null,
        header: normalizeHeader(body.header), application: normalizeMode(body.application), master: normalizeMode(body.master),
      },
      update: {
        professionalSummary: typeof body.professionalSummary === "string" ? body.professionalSummary.trim().slice(0, 4000) || null : null,
        header: normalizeHeader(body.header), application: normalizeMode(body.application), master: normalizeMode(body.master),
      },
    });
    res.json(configuration);
  } catch (error) { next(error); }
});

router.get("/cv/:mode.pdf", requireAuth, async (req, res, next) => {
  try {
    const mode = req.params.mode === "master" ? "master" : "application";
    const origin = `${req.protocol}://${req.get("host")}`;
    const buffer = await generateCvPdfBuffer({ origin, mode });
    res.setHeader("Content-Type", "application/pdf");
    const filename = mode === "application" ? "Mahmoud-Hussein-Abdul-Ghani-CV.pdf" : "Mahmoud-Hussein-Abdul-Ghani-Master-CV.pdf";
    res.setHeader("Content-Disposition", `${req.query.download === "1" ? "attachment" : "inline"}; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.send(buffer);
  } catch (error) { next(error); }
});

/* ------------------------------ Analytics ------------------------------ */

router.get("/analytics", requireAuth, async (_req, res, next) => {
  try {
    const [totalProjects, publishedProjects, totalSkills, unreadMessages, projects] =
      await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { published: true } }),
        prisma.skill.count(),
        prisma.message.count({ where: { read: false } }),
        prisma.project.findMany({
          orderBy: { views: "desc" },
          take: 8,
          select: { name: true, slug: true, views: true },
        }),
      ]);

    const [totalViews, recentMessages] = await Promise.all([
      projects.reduce((sum, p) => sum + p.views, 0),
      prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    res.json({
      totalProjects,
      publishedProjects,
      totalSkills,
      unreadMessages,
      totalViews,
      viewsByProject: projects,
      recentMessages,
    });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------- Profile ------------------------------- */

const profileInclude = {
  experience: { orderBy: { order: "asc" } },
  socials: { orderBy: { id: "asc" } },
};

const profileScalarKeys = [
  "name",
  "shortName",
  "title",
  "tagline",
  "bio",
  "location",
  "email",
  "phone",
  "photo",
  "resumeUrl",
  "portfolioUrl",
  "seoTitle",
  "seoDescription",
  "languages",
];

function profileScalars(body) {
  return Object.fromEntries(
    profileScalarKeys
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, str(body[key])]),
  );
}

function nestedExperience(profile, input) {
  const existingIds = new Set(profile.experience.map((item) => item.id));
  const rows = input.map((item, index) => {
    const role = str(item?.role ?? item?.milestone)?.trim() ?? "";
    const company = str(item?.company ?? item?.facility)?.trim() ?? "";
    const description = str(item?.description ?? item?.details)?.trim() ?? "";
    const startDate = str(item?.startDate)?.trim() || null;
    const isCurrent = Boolean(item?.isCurrent);
    const endDate = isCurrent ? null : str(item?.endDate)?.trim() || null;
    const displayDate = [startDate, isCurrent ? "Present" : endDate].filter(Boolean).join(" – ");
    return {
    id: existingIds.has(item?.id) ? item.id : null,
    data: {
      role, company, description, startDate, endDate, isCurrent,
      location: str(item?.location)?.trim() || null,
      milestone: role, facility: company, meta: displayDate, details: description,
      order: index,
    },
  }; });
  const retainedIds = rows.flatMap((item) => (item.id ? [item.id] : []));

  return {
    deleteMany: retainedIds.length ? { id: { notIn: retainedIds } } : {},
    update: rows
      .filter((item) => item.id)
      .map((item) => ({ where: { id: item.id }, data: item.data })),
    create: rows.filter((item) => !item.id).map((item) => item.data),
  };
}

function nestedSocials(profile, input) {
  const existingIds = new Set(profile.socials.map((item) => item.id));
  const rows = input
    .map((item) => ({
      id: existingIds.has(item?.id) ? item.id : null,
      data: {
        label: str(item?.label)?.trim() ?? "",
        url: str(item?.url)?.trim() ?? "",
      },
    }))
    .filter((item) => item.data.label);
  const retainedIds = rows.flatMap((item) => (item.id ? [item.id] : []));

  return {
    deleteMany: retainedIds.length ? { id: { notIn: retainedIds } } : {},
    update: rows
      .filter((item) => item.id)
      .map((item) => ({ where: { id: item.id }, data: item.data })),
    create: rows.filter((item) => !item.id).map((item) => item.data),
  };
}

router.get("/profile", requireAuth, async (_req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({ include: profileInclude });
    if (!profile) return res.status(404).json({ message: "Profile not found." });
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({ include: profileInclude });
    if (!profile) return res.status(404).json({ message: "Profile not found." });

    const parsed = profileMutationSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed, "Invalid profile data.") });
    const body = parsed.data;
    if (Array.isArray(body.experience)) {
      const validDate = (value) => !value || /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value));
      const invalid = body.experience.find((item) => !validDate(item?.startDate) || !validDate(item?.endDate) || (item?.isCurrent && item?.endDate));
      if (invalid) return res.status(400).json({ message: "Experience dates must use YYYY-MM, and current roles cannot have an end date." });
    }
    const data = profileScalars(body);

    if (Array.isArray(body.experience)) {
      data.experience = nestedExperience(profile, body.experience);
    }
    if (Array.isArray(body.socials)) {
      data.socials = nestedSocials(profile, body.socials);
    }

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data,
      include: profileInclude,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/* ------------------------------- Projects ------------------------------ */

const projectFields = (body) => ({
  slug: body.slug !== undefined ? String(body.slug).toLowerCase().trim() : undefined,
  name: body.name !== undefined ? str(body.name) : undefined,
  type: body.type !== undefined ? str(body.type) : undefined,
  tagline: body.tagline !== undefined ? str(body.tagline) : undefined,
  description: body.description !== undefined ? str(body.description) : undefined,
  overview: body.overview !== undefined ? str(body.overview) : undefined,
  problem: body.problem !== undefined ? str(body.problem) : undefined,
  solution: body.solution !== undefined ? str(body.solution) : undefined,
  features: body.features !== undefined ? strArr(body.features) : undefined,
  stack: body.stack !== undefined ? strArr(body.stack) : undefined,
  team: body.team !== undefined ? strArr(body.team) : undefined,
  program: body.program !== undefined ? str(body.program) : null,
  github: body.github !== undefined ? str(body.github) : null,
  demo: body.demo !== undefined ? str(body.demo) : null,
  featured: body.featured !== undefined ? Boolean(body.featured) : undefined,
  published: body.published !== undefined ? Boolean(body.published) : undefined,
  visual:
    body.visual !== undefined ? normalizeProjectAccent(body.visual) : undefined,
  order: body.order !== undefined ? Number(body.order) || 0 : undefined,
  coverImage: body.coverImage !== undefined ? str(body.coverImage) : undefined,
  screenshots: body.screenshots !== undefined ? strArr(body.screenshots) : undefined,
  myRole: body.myRole !== undefined ? str(body.myRole) : undefined,
  contributions: body.contributions !== undefined ? strArr(body.contributions) : undefined,
  ownership: body.ownership !== undefined ? str(body.ownership) : undefined,
  teamSize: body.teamSize === undefined ? undefined : body.teamSize === null ? null : Number(body.teamSize),
});

router.get("/projects", requireAuth, async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get("/projects/:slug", requireAuth, async (req, res, next) => {
  try {
    if (!slugSchema.safeParse(req.params.slug).success) return res.status(400).json({ message: "Invalid project identifier." });
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.post("/projects", requireAuth, async (req, res, next) => {
  try {
    const parsed = projectMutationSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed, "Invalid project data or URL.") });
    const body = parsed.data;
    if (!body.name?.trim()) {
      return res.status(400).json({ message: "Project name is required." });
    }
    if (!body.type?.trim()) {
      return res.status(400).json({ message: "Project type is required." });
    }
    const data = projectFields(body);
    if (!data.slug) {
      data.slug =
        String(body.name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || `project-${Date.now()}`;
    }
    const project = await prisma.project.create({
      data: { ...data, name: str(body.name) ?? "" },
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.patch("/projects/:id", requireAuth, async (req, res, next) => {
  try {
    if (!routeIdSchema.safeParse(req.params.id).success) return res.status(400).json({ message: "Invalid record identifier." });
    const parsed = projectMutationSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed, "Invalid project data or URL.") });
    if (Object.keys(parsed.data).length === 0) return res.status(400).json({ message: "Provide at least one project field to update." });
    const body = parsed.data;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: projectFields(body),
    });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.delete("/projects/:id", requireAuth, async (req, res, next) => {
  try {
    if (!routeIdSchema.safeParse(req.params.id).success) return res.status(400).json({ message: "Invalid record identifier." });
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/* --------------------------- Generic entities -------------------------- */

function normalizeCrudData(body, { requiredFields, optionalFields }, isPatch) {
  const allowedFields = new Set([...requiredFields, ...optionalFields, "order"]);
  const unknownFields = Object.keys(body).filter((key) => !allowedFields.has(key));
  if (unknownFields.length) {
    return { error: `Unsupported field: ${unknownFields[0]}.` };
  }

  const data = {};
  for (const field of [...requiredFields, ...optionalFields]) {
    if (body[field] === undefined) continue;
    const value = str(body[field])?.trim() ?? "";
    if (value.length > 4000) return { error: `${field} is too long.` };
    if (field === "url" && value) {
      try { if (!["http:", "https:"].includes(new URL(value).protocol)) return { error: "url must use http or https." }; }
      catch { return { error: "url must be a valid URL." }; }
    }
    if (field === "status" && !["verified", "familiar", "learning"].includes(value)) {
      return { error: "status must be verified, familiar, or learning." };
    }
    if (requiredFields.includes(field)) {
      if (!value) return { error: `${field} is required.` };
      data[field] = value;
    } else {
      data[field] = value || null;
    }
  }

  if (!isPatch) {
    for (const field of requiredFields) {
      if (!data[field]) return { error: `${field} is required.` };
    }
  }

  if (body.order !== undefined) {
    const order = Number(body.order);
    if (!Number.isFinite(order)) return { error: "order must be a number." };
    data.order = Math.trunc(order);
  }

  if (isPatch && Object.keys(data).length === 0) {
    return { error: "Provide at least one field to update." };
  }

  return { data };
}

function makeCrudRouter(model, config) {
  const r = Router();

  r.get("/", requireAuth, async (_req, res, next) => {
    try {
      const rows = await model.findMany({ orderBy: { order: "asc" } });
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });

  r.post("/", requireAuth, async (req, res, next) => {
    try {
      const body = req.body ?? {};
      const result = normalizeCrudData(body, config, false);
      if ("error" in result) return res.status(400).json({ message: result.error });
      const row = await model.create({ data: result.data });
      res.status(201).json(row);
    } catch (error) {
      next(error);
    }
  });

  r.patch("/:id", requireAuth, async (req, res, next) => {
    try {
      if (!routeIdSchema.safeParse(req.params.id).success) return res.status(400).json({ message: "Invalid record identifier." });
      const body = req.body ?? {};
      const result = normalizeCrudData(body, config, true);
      if ("error" in result) return res.status(400).json({ message: result.error });
      const row = await model.update({
        where: { id: req.params.id },
        data: result.data,
      });
      res.json(row);
    } catch (error) {
      next(error);
    }
  });

  r.delete("/:id", requireAuth, async (req, res, next) => {
    try {
      if (!routeIdSchema.safeParse(req.params.id).success) return res.status(400).json({ message: "Invalid record identifier." });
      await model.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return r;
}

const technologyCrud = { requiredFields: ["name", "category"], optionalFields: [] };
const skillCrud = { requiredFields: ["name", "category", "status"], optionalFields: [] };
const educationCrud = {
  requiredFields: ["school", "degree"],
  optionalFields: ["field", "period", "details"],
};
const certificationCrud = {
  requiredFields: ["title", "issuer"],
  optionalFields: ["year", "url"],
};

router.use("/technologies", makeCrudRouter(prisma.technology, technologyCrud));
router.use("/skills", makeCrudRouter(prisma.skill, skillCrud));
router.use("/education", makeCrudRouter(prisma.education, educationCrud));
router.use("/certifications", makeCrudRouter(prisma.certification, certificationCrud));

/* ------------------------------- Messages ------------------------------ */

router.get("/messages", requireAuth, async (_req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.patch("/messages/:id/read", requireAuth, async (req, res, next) => {
  try {
    if (!routeIdSchema.safeParse(req.params.id).success) return res.status(400).json({ message: "Invalid record identifier." });
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(message);
  } catch (error) {
    next(error);
  }
});

router.delete("/messages/:id", requireAuth, async (req, res, next) => {
  try {
    if (!routeIdSchema.safeParse(req.params.id).success) return res.status(400).json({ message: "Invalid record identifier." });
    await prisma.message.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

/* --------------------------- Error handling ---------------------------- */

router.use((error, _req, res, _next) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "A record with that unique value already exists." });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Record not found." });
    }
  }
  console.error("Admin route error:", error);
  res.status(500).json({ message: "Internal server error." });
});

export default router;
