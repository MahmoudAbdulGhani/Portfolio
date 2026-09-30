#!/usr/bin/env node
/**
 * Generate the application CV and diff it against the reference PDF.
 *
 * Usage:
 *   node server/scripts/compare-cv.mjs [reference.pdf] [--tolerance 1.0]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { generateCvPdfBuffer } from "../src/lib/cv.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(here, "..", "..");
const DEFAULT_REFERENCE = "C:/Users/Admin/Downloads/Mahmoud_Abdul_Ghani_CVV.pdf";

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("--"));
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const reference = resolve(positional[0] ?? DEFAULT_REFERENCE);
const tolerance = flag("--tolerance", "1.0");
const keep = argv.includes("--keep");

const dir = mkdtempSync(join(tmpdir(), "cv-compare-"));
const candidate = join(dir, "candidate.pdf");

try {
  const buffer = await generateCvPdfBuffer({ mode: "application" });
  writeFileSync(candidate, buffer);
  console.log(`reference: ${reference}`);
  console.log(`candidate: ${candidate}\n`);

  const args = ["scripts/cv-diff.py", reference, candidate, "--tolerance", tolerance];
  for (const name of ["--json", "--runs"]) {
    if (argv.includes(name)) args.push(name);
  }
  try {
    execFileSync("python", args, { cwd: root, stdio: "inherit" });
  } catch (error) {
    // cv-diff exits 1 when issues remain; that is a normal result here.
    if (error.status === undefined || error.status > 1) throw error;
    process.exitCode = 1;
  }
} finally {
  if (keep) console.log(`\nkept: ${dir}`);
  else rmSync(dir, { recursive: true, force: true });
}
