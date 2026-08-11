import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { generateCvPdfBuffer } from "../lib/cv.js";

const router = Router();

router.get("/profile", async (_req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({
      include: {
        experience: { orderBy: { order: "asc" } },
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
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get("/projects/:slug", async (req, res, next) => {
  try {
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
    const origin = `${req.protocol}://${req.get("host")}`;
    const buffer = await generateCvPdfBuffer({ origin });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Mahmoud-Abdul-Ghani-CV.pdf"',
    );
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.post("/messages", async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ message: "Name, email and message are required." });
    }
    if (typeof email === "string" && email.length > 320) {
      return res.status(400).json({ message: "Email is too long." });
    }
    const created = await prisma.message.create({
      data: {
        name: String(name).trim().slice(0, 120),
        email: String(email).trim().slice(0, 320),
        subject: String(subject ?? "").trim().slice(0, 200),
        message: String(message).trim().slice(0, 5000),
      },
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

export default router;
