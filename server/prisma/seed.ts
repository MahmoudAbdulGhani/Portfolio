import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  certificationsData,
  educationData,
  profileData,
  projectsData,
  skillsData,
  technologiesData,
} from "../../shared/portfolio-data";

const prisma = new PrismaClient();

async function main() {
  /* ----------------------------- Admin account ----------------------------- */

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env before seeding.",
    );
  }

  const normalizedEmail = adminEmail.toLowerCase();
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.upsert({
    where: { email: normalizedEmail },
    update: { email: normalizedEmail, passwordHash },
    create: {
      email: normalizedEmail,
      name: "Mahmoud Abdul Ghani",
      passwordHash,
    },
  });

  /* -------------------------------- Profile -------------------------------- */

  const profile = await prisma.profile.upsert({
    where: { id: profileData.id },
    update: {
      name: profileData.name,
      shortName: profileData.shortName,
      title: profileData.title,
      tagline: profileData.tagline,
      bio: profileData.bio,
      location: profileData.location,
      email: profileData.email,
      phone: profileData.phone,
      photo: profileData.photo,
      resumeUrl: profileData.resumeUrl,
      languages: profileData.languages,
    },
    create: {
      id: profileData.id,
      name: profileData.name,
      shortName: profileData.shortName,
      title: profileData.title,
      tagline: profileData.tagline,
      bio: profileData.bio,
      location: profileData.location,
      email: profileData.email,
      phone: profileData.phone,
      photo: profileData.photo,
      resumeUrl: profileData.resumeUrl,
      languages: profileData.languages,
    },
  });

  await prisma.socialLink.deleteMany({ where: { profileId: profile.id } });
  await prisma.socialLink.createMany({
    data: profileData.socials.map((s) => ({
      label: s.label,
      url: s.url,
      profileId: profile.id,
    })),
  });

  /* ------------------------------ Technologies ----------------------------- */

  for (const [i, tech] of technologiesData.entries()) {
    await prisma.technology.upsert({
      where: { name: tech.name },
      update: { category: tech.category, order: i },
      create: { name: tech.name, category: tech.category, order: i },
    });
  }

  /* --------------------------------- Skills -------------------------------- */

  for (const [i, skill] of skillsData.entries()) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category, order: i },
      create: { name: skill.name, category: skill.category, order: i },
    });
  }

  /* -------------------------------- Projects ------------------------------- */

  for (const project of projectsData) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        name: project.name,
        type: project.type,
        tagline: project.tagline,
        description: project.description,
        overview: project.overview,
        problem: project.problem,
        solution: project.solution,
        features: project.features,
        stack: project.stack,
        team: project.team,
        program: project.program,
        github: project.github,
        demo: project.demo,
        featured: project.featured,
        published: project.published,
        visual: project.visual,
        order: project.order,
      },
      create: {
        slug: project.slug,
        name: project.name,
        type: project.type,
        tagline: project.tagline,
        description: project.description,
        overview: project.overview,
        problem: project.problem,
        solution: project.solution,
        features: project.features,
        stack: project.stack,
        team: project.team,
        program: project.program,
        github: project.github,
        demo: project.demo,
        featured: project.featured,
        published: project.published,
        visual: project.visual,
        order: project.order,
      },
    });
  }

  /* ------------------------------- Education ------------------------------- */

  for (const [i, edu] of educationData.entries()) {
    await prisma.education.upsert({
      where: { id: edu.id },
      update: {
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        period: edu.period,
        details: edu.details,
        order: i,
      },
      create: {
        id: edu.id,
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        period: edu.period,
        details: edu.details,
        order: i,
      },
    });
  }

  /* ---------------------------- Certifications ----------------------------- */

  for (const [i, cert] of certificationsData.entries()) {
    await prisma.certification.upsert({
      where: { id: cert.id },
      update: {
        title: cert.title,
        issuer: cert.issuer,
        year: cert.year,
        url: cert.url,
        order: i,
      },
      create: {
        id: cert.id,
        title: cert.title,
        issuer: cert.issuer,
        year: cert.year,
        url: cert.url,
        order: i,
      },
    });
  }

  console.log(
    "Seed complete: admin account, profile, experience, socials, technologies, skills, projects, education and certifications are in the database.",
  );
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
