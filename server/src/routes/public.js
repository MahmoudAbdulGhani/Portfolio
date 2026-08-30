import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { generateCvPdfBuffer } from "../lib/cv.js";
import { contactSchema, slugSchema } from "../lib/validation.js";
import { consumeRateLimit } from "../lib/rate-limit.js";
import { createHash } from "node:crypto";
import { getClientIp } from "../lib/client-ip.js";
import { apiCache } from "../lib/cache.js";
import { sendContactAlerts } from "../lib/contact-alerts.js";

const router = Router();

const xml = (value) =>
  String(value).replace(
    /[<>&'\"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '\"': "&quot;",
      })[character],
  );

async function sendCachedJson(req, res, cacheKey, fetcher, ttlMs = 0) {
  let data = ttlMs > 0 ? apiCache.get(cacheKey) : undefined;
  if (!data) {
    data = await fetcher();
    if (data !== undefined && data !== null) {
      if (ttlMs > 0) apiCache.set(cacheKey, data, ttlMs);
    }
  }
  if (!data) return res.status(404).json({ message: "Not found." });

  const etag = `W/"${createHash("md5").update(JSON.stringify(data)).digest("hex").slice(0, 16)}"`;
  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", "no-cache, must-revalidate");

  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end();
  }
  return res.json(data);
}

router.get("/robots.txt", (req, res) => {
  const origin = `${req.protocol}://${req.get("host")}`;
  res
    .type("text/plain")
    .set("Cache-Control", "public, max-age=3600, s-maxage=86400")
    .send(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /login",
        `Sitemap: ${origin}/sitemap.xml`,
        "",
      ].join("\n"),
    );
});

router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const origin = `${req.protocol}://${req.get("host")}`;
    const projects = await prisma.project.findMany({
      where: { published: true, showOnPortfolio: true },
      select: { slug: true, updatedAt: true },
    });
    const fixed = ["/", "/projects", "/contact", "/job-match", "/cv"];
    const urls = [
      ...fixed.map((path) => ({ path })),
      ...projects.map((project) => ({
        path: `/projects/${project.slug}`,
        updatedAt: project.updatedAt,
      })),
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ path, updatedAt }) => `  <url><loc>${xml(`${origin}${path}`)}</loc>${updatedAt ? `<lastmod>${updatedAt.toISOString()}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`;
    res
      .type("application/xml")
      .set("Cache-Control", "public, max-age=3600, s-maxage=86400")
      .send(body);
  } catch (error) {
    next(error);
  }
});

router.get("/profile", async (req, res, next) => {
  try {
    await sendCachedJson(req, res, "public:profile", () =>
      prisma.profile.findFirst({
        select: {
          id: true,
          name: true,
          shortName: true,
          title: true,
          tagline: true,
          bio: true,
          location: true,
          email: true,
          phone: true,
          photo: true,
          resumeUrl: true,
          portfolioUrl: true,
          seoTitle: true,
          seoDescription: true,
          languages: true,
          updatedAt: true,
          professionalSummary: true,
          availabilityStatus: true,
          availabilityText: true,
          responseTime: true,
          remoteAvailability: true,
          openToOpportunities: true,
          heroLabel: true,
          profileReference: true,
          whatsappNumber: true,
          whatsappMessage: true,
          focusAreas: true,
          experience: { where: { published: true }, orderBy: { order: "asc" } },
          socials: { where: { published: true }, orderBy: { order: "asc" } },
        },
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/site-content", async (req, res, next) => {
  try {
    await sendCachedJson(req, res, "public:site-content", () =>
      prisma.siteSection.findMany({
        where: { visible: true, key: { not: { startsWith: "_migration:" } } },
        orderBy: { order: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/projects", async (req, res, next) => {
  try {
    await sendCachedJson(req, res, "public:projects", () =>
      prisma.project.findMany({
        where: { published: true, showOnPortfolio: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/projects/:slug", async (req, res, next) => {
  try {
    if (!slugSchema.safeParse(req.params.slug).success)
      return res.status(400).json({ message: "Invalid project identifier." });
    const slug = req.params.slug;

    // Check cached or find project
    const project = await prisma.project.findFirst({
      where: { slug, published: true, showOnPortfolio: true },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Async increment views in background without blocking response
    prisma.project
      .update({
        where: { id: project.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => {});

    const etag = `W/"${createHash("md5").update(JSON.stringify(project)).digest("hex").slice(0, 16)}"`;
    res.setHeader("ETag", etag);
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
    );

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.get("/technologies", async (req, res, next) => {
  try {
    await sendCachedJson(req, res, "public:technologies", () =>
      prisma.technology.findMany({
        orderBy: { order: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/skills", async (req, res, next) => {
  try {
    await sendCachedJson(req, res, "public:skills", () =>
      prisma.skill.findMany({
        orderBy: { order: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/education", async (req, res, next) => {
  try {
    await sendCachedJson(req, res, "public:education", () =>
      prisma.education.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/certifications", async (req, res, next) => {
  try {
    await sendCachedJson(req, res, "public:certifications", () =>
      prisma.certification.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/cv.pdf", async (req, res, next) => {
  try {
    const limit = await consumeRateLimit(`cv:${getClientIp(req)}`, {
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (limit.limited) {
      res.setHeader("Retry-After", String(limit.retryAfter));
      return res
        .status(429)
        .json({ message: "Too many CV requests. Please try again later." });
    }

    let pdfData = apiCache.get("public:cv-pdf-buffer");
    if (!pdfData) {
      const origin = `${req.protocol}://${req.get("host")}`;
      const buffer = await generateCvPdfBuffer({ origin });
      const etag = `"${createHash("md5").update(buffer).digest("hex").slice(0, 16)}"`;
      pdfData = { buffer, etag };
      apiCache.set("public:cv-pdf-buffer", pdfData, 300_000);
    }

    res.setHeader("ETag", pdfData.etag);
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600",
    );

    if (req.headers["if-none-match"] === pdfData.etag) {
      return res.status(304).end();
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${req.query.preview === "1" ? "inline" : "attachment"}; filename="portfolio-cv.pdf"`,
    );
    res.setHeader("Content-Length", pdfData.buffer.length);
    res.send(pdfData.buffer);
  } catch (error) {
    next(error);
  }
});

router.post("/messages", async (req, res, next) => {
  try {
    if (req.body?.website)
      return res.status(202).json({ message: "Message received." });
    const parsed = contactSchema.safeParse(req.body ?? {});
    if (!parsed.success)
      return res
        .status(400)
        .json({
          message: "Please provide a valid name, email address, and message.",
        });
    const clientIp = getClientIp(req);
    const limit = await consumeRateLimit(`contact:${clientIp}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limit.limited) {
      console.warn("[security] contact_rate_limited", { ip: clientIp });
      res.setHeader("Retry-After", String(limit.retryAfter));
      return res
        .status(429)
        .json({
          message: "Too many messages were sent. Please try again later.",
        });
    }
    const { name, email, subject, message } = parsed.data;
    const digest = createHash("sha256")
      .update(`${email.toLowerCase()}:${subject}:${message}`)
      .digest("hex");
    const duplicate = await consumeRateLimit(
      `contact-duplicate:${clientIp}:${digest}`,
      { limit: 1, windowMs: 10 * 60 * 1000 },
    );
    if (duplicate.limited) {
      console.warn("[security] contact_duplicate", { ip: clientIp });
      return res
        .status(429)
        .json({ message: "This message was already received recently." });
    }
    const created = await prisma.message.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });
    void sendContactAlerts({ name, email, subject, message });
    res.status(201).json({ id: created.id, createdAt: created.createdAt });
  } catch (error) {
    next(error);
  }
});

export default router;
