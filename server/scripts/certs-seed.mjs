/**
 * One-time maintenance: narrow the stored application CV configuration to the
 * single flagship certification so the generated CV matches the reference while
 * remaining driven by the selected records.
 *
 * The pooled DATABASE_URL is used by the app at runtime; this script prefers
 * DIRECT_URL so it can still run when the pooler is unreachable.
 *
 * Safe to re-run: it verifies the target before writing and prints before/after.
 */
import { getCvCatalog } from "../src/lib/cv-config.js";

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const { prisma } = await import("../src/lib/prisma.js");

const catalog = await getCvCatalog();
const aws = catalog.certifications.filter((row) =>
  /aws|re\/start/i.test(String(row.title ?? "")),
);

if (aws.length !== 1) {
  console.error(`ABORT: expected exactly 1 AWS certification, found ${aws.length}`);
  console.error("catalog certifications:", catalog.certifications.map((c) => c.id));
  process.exit(1);
}

const target = aws[0];
const before = await prisma.cvConfiguration.findUnique({ where: { id: "default" } });

if (!before) {
  console.error("ABORT: no cvConfiguration row with id 'default'");
  process.exit(1);
}

console.log("target certification :", target.id, "|", target.title);
console.log("before application   :", JSON.stringify(before.application.certifications));
console.log("before master        :", JSON.stringify(before.master.certifications));

if (
  before.application.certifications.length === 1 &&
  before.application.certifications[0] === target.id
) {
  console.log("already correct, no write needed");
} else {
  const after = await prisma.cvConfiguration.update({
    where: { id: "default" },
    data: {
      application: { ...before.application, certifications: [target.id] },
    },
  });
  console.log("after  application   :", JSON.stringify(after.application.certifications));
}

const verify = await prisma.cvConfiguration.findUnique({ where: { id: "default" } });
console.log("verified application :", JSON.stringify(verify.application.certifications));
console.log("master untouched     :", JSON.stringify(verify.master.certifications));

await prisma.$disconnect();
