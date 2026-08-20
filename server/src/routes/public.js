import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { generateCvPdfBuffer } from "../lib/cv.js";
import { contactSchema, slugSchema } from "../lib/validation.js";
import { consumeRateLimit } from "../lib/rate-limit.js";
import { createHash } from "node:crypto";
import { getClientIp } from "../lib/client-ip.js";

const router = Router();

const xml = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character]);

router.get("/robots.txt", (req, res) => {
  const origin = `${req.protocol}://${req.get("host")}`;
  res.type("text/plain").set("Cache-Control", "public, max-age=3600, s-maxage=86400").send([
    "User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /login", `Sitemap: ${origin}/sitemap.xml`, "",
  ].join("\n"));
});

router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const origin = `${req.protocol}://${req.get("host")}`;
    const projects = await prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
    const fixed = ["/", "/projects", "/contact", "/job-match", "/cv"];
    const urls = [
      ...fixed.map((path) => ({ path })),
      ...projects.map((project) => ({ path: `/projects/${project.slug}`, updatedAt: project.updatedAt })),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ path, updatedAt }) => `  <url><loc>${xml(`${origin}${path}`)}</loc>${updatedAt ? `<lastmod>${updatedAt.toISOString()}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`;
    res.type("application/xml").set("Cache-Control", "public, max-age=3600, s-maxage=86400").send(body);
  } catch (error) { next(error); }
});

router.get("/profile", async (_req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({
      select: {
        id: true, name: true, shortName: true, title: true, tagline: true, bio: true, location: true,
        email: true, phone: true, photo: true, resumeUrl: true, portfolioUrl: true, seoTitle: true, seoDescription: true, languages: true, updatedAt: true,
        experience: { orderBy: { order: "asc" }, select: { id: true, role: true, company: true, description: true, startDate: true, endDate: true, isCurrent: true, location: true, order: true } },
        socials: { orderBy: { id: "asc" } },
      },
    });
    if (!profile) return res.status(404).json({ message: "Profile not found." });
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.get("/projects", async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    res.setHeader("Cache-Control", "public, max-age=30, s-maxage=120, stale-while-revalidate=300");
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get("/projects/:slug", async (req, res, next) => {
  try {
    if (!slugSchema.safeParse(req.params.slug).success) return res.status(400).json({ message: "Invalid project identifier." });
    const project = await prisma.project.findFirst({
      where: { slug: req.params.slug, published: true },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    await prisma.project.update({
      where: { id: project.id },
      data: { views: { increment: 1 } },
    });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.get("/technologies", async (_req, res, next) => {
  try {
    const technologies = await prisma.technology.findMany({
      orderBy: { order: "asc" },
    });
    res.json(technologies);
  } catch (error) {
    next(error);
  }
});

router.get("/skills", async (_req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { order: "asc" },
    });
    res.json(skills);
  } catch (error) {
    next(error);
  }
});

router.get("/education", async (_req, res, next) => {
  try {
    const education = await prisma.education.findMany({
      orderBy: { order: "asc" },
    });
    res.json(education);
  } catch (error) {
    next(error);
  }
});

router.get("/certifications", async (_req, res, next) => {
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: { order: "asc" },
    });
    res.json(certifications);
  } catch (error) {
    next(error);
  }
});

router.get("/cv.pdf", async (req, res, next) => {
  try {
    const limit = await consumeRateLimit(`cv:${getClientIp(req)}`, { limit: 10, windowMs: 10 * 60 * 1000 });
    if (limit.limited) { res.setHeader("Retry-After", String(limit.retryAfter)); return res.status(429).json({ message: "Too many CV requests. Please try again later." }); }
    const origin = `${req.protocol}://${req.get("host")}`;
    const buffer = await generateCvPdfBuffer({ origin });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${req.query.preview === "1" ? "inline" : "attachment"}; filename="Mahmoud-Hussein-Abdul-Ghani-CV.pdf"`);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.post("/messages", async (req, res, next) => {
  try {
    if (req.body?.website) return res.status(202).json({ message: "Message received." });
    const parsed = contactSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: "Please provide a valid name, email address, and message." });
    const clientIp = getClientIp(req);
    const limit = await consumeRateLimit(`contact:${clientIp}`, { limit: 5, windowMs: 60 * 60 * 1000 });
    if (limit.limited) { console.warn("[security] contact_rate_limited", { ip: clientIp }); res.setHeader("Retry-After", String(limit.retryAfter)); return res.status(429).json({ message: "Too many messages were sent. Please try again later." }); }
    const { name, email, subject, message } = parsed.data;
    const digest = createHash("sha256").update(`${email.toLowerCase()}:${subject}:${message}`).digest("hex");
    const duplicate = await consumeRateLimit(`contact-duplicate:${clientIp}:${digest}`, { limit: 1, windowMs: 10 * 60 * 1000 });
    if (duplicate.limited) { console.warn("[security] contact_duplicate", { ip: clientIp }); return res.status(429).json({ message: "This message was already received recently." }); }
    const created = await prisma.message.create({
      data: {
        name, email, subject, message,
      },
    });
    res.status(201).json({ id: created.id, createdAt: created.createdAt });
  } catch (error) {
    next(error);
  }
});

export default router;
