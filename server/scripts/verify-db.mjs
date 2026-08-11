import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const [admin, profile, experience, socialLinks, technologies, skills, projects] =
  await Promise.all([
    prisma.admin.count(),
    prisma.profile.count(),
    prisma.experience.count(),
    prisma.socialLink.count(),
    prisma.technology.count(),
    prisma.skill.count(),
    prisma.project.count(),
  ]);

console.log("Database row counts (neondb):");
console.log({ admin, profile, experience, socialLinks, technologies, skills, projects });

const sample = await prisma.project.findMany({
  select: { slug: true, published: true, featured: true },
  orderBy: { order: "asc" },
});
console.log("Projects:", sample.map((p) => p.slug).join(", "));

await prisma.$disconnect();
