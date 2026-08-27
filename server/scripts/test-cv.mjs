import "dotenv/config";
import assert from "node:assert/strict";
import { generateCvPdfBuffer } from "../src/lib/cv.js";
import { resolveCvData } from "../src/lib/cv-config.js";

const data = await resolveCvData("application");
assert.equal(data.profile.title, "Full-Stack Software Engineer");
assert.equal(data.skills.every((skill) => (skill.status ?? "verified") === "verified"), true);
assert.equal(data.certifications.some((item) => /digital hub|unrwa/i.test(`${item.title} ${item.issuer}`)), false);

const pdf = await generateCvPdfBuffer({ origin: "http://localhost:3001", mode: "application" });
const source = pdf.toString("latin1");
assert.equal((source.match(/\/Type \/Page\b/g) ?? []).length, 1);
assert.equal(source.includes("localhost"), false);
assert.equal(source.includes("mailto:Mahmoud.Abdulghani@outlook.com"), true);
assert.equal(source.includes("https://linkedin.com/in/MahmoudAbdulGhani"), true);
assert.equal(source.includes("https://github.com/MahmoudAbdulGhani"), true);
const tailoredPdf = await generateCvPdfBuffer({
  origin: "https://portfolio.example",
  mode: "application",
  tailor: {
    summary: "Full-stack engineer matched to an accessible React and Node.js product role.",
    strongMatches: ["React", "Node.js"],
    projectSlugs: data.projects.slice(0, 2).map((project) => project.slug),
  },
});
assert.equal((tailoredPdf.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length, 1);
console.log("CV generation checks passed.");
