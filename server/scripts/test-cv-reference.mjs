#!/usr/bin/env node
/**
 * Conformance test: the generated application CV must match the reference layout.
 *
 * Runs entirely from the committed fixture, so it needs neither the reference
 * PDF nor a database. Pass `--db` to render from live data as well.
 *
 * Tolerances are deliberate and tighter than the defaults:
 *   x / x1  2.0pt  covers Carlito-vs-Calibri and Caladea-vs-Cambria width drift
 *                 (worst observed 1.10pt on the contact line)
 *   y       1.0pt  Word places a bullet glyph on a different baseline than
 *                 PDFKit does (worst observed 0.53pt)
 *   rules   1.0pt  PDFKit draws link underlines as zero-height lines where Word
 *                 draws 0.75pt rects, offsetting them by up to 0.67pt
 *                 (worst observed 0.67pt)
 *
 * Rule thickness (h) is never compared, and neither is the rendered width of a
 * line: both are properties of the font engine, not of the layout.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { generateCvPdfBuffer } from "../src/lib/cv.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(here, "..", "..");
const fixturePath = join(root, "server", "test", "fixtures", "application-cv-reference.json");

const TOLERANCE_X = "2.0";
const TOLERANCE_Y = "1.0";
const TOLERANCE_RULE = "1.0";

// The reference embeds Word's `symbol` font purely for bullet glyphs; PDFKit
// draws bullets with the body font, so this face is expected to be absent.
const REFERENCE_ONLY_FONTS = new Set(["symbol"]);

const failures = [];
const check = (label, condition, detail) => {
  if (!condition) failures.push(detail ? `${label}\n    ${detail}` : label);
};

async function runMode(mode) {
  const dir = mkdtempSync(join(tmpdir(), "cv-reference-"));
  const candidate = join(dir, "candidate.pdf");
  // The fallback run must not touch the database, and the db run must.
  if (mode === "db") delete process.env.CV_STATIC_ONLY;
  else process.env.CV_STATIC_ONLY = "1";
  try {
    const buffer = await generateCvPdfBuffer({ mode: "application" });
    writeFileSync(candidate, buffer);

    const args = [
      "scripts/cv-diff.py",
      candidate,
      candidate,
      "--fixture",
      fixturePath,
      "--tolerance",
      TOLERANCE_RULE,
      "--tolerance-x",
      TOLERANCE_X,
      "--tolerance-y",
      TOLERANCE_Y,
      "--json",
    ];

    let stdout;
    let status = 0;
    try {
      stdout = execFileSync("python", args, { cwd: root, encoding: "utf8" });
    } catch (error) {
      // cv-diff exits 1 when issues remain, which is a legitimate test failure
      // rather than a crash.
      if (error.status === undefined || error.status > 1) throw error;
      status = error.status;
      stdout = error.stdout;
    }

    const report = JSON.parse(stdout);
    const scope = mode === "db" ? "db" : "fallback";

    for (const [index, page] of report.pages.entries()) {
      const at = `${scope} page ${index + 1}`;

      check(
        `${at}: page size`,
        JSON.stringify(page.pageSize.reference) === JSON.stringify(page.pageSize.candidate),
        `reference=${JSON.stringify(page.pageSize.reference)} candidate=${JSON.stringify(page.pageSize.candidate)}`,
      );
      check(
        `${at}: line count`,
        page.counts.referenceLines === page.counts.candidateLines,
        `reference=${page.counts.referenceLines} candidate=${page.counts.candidateLines}`,
      );
      check(
        `${at}: rule count`,
        page.counts.referenceRules === page.counts.candidateRules,
        `reference=${page.counts.referenceRules} candidate=${page.counts.candidateRules}`,
      );

      const expectedFonts = page.fonts.reference.filter((f) => !REFERENCE_ONLY_FONTS.has(f));
      const missing = expectedFonts.filter((f) => !page.fonts.candidate.includes(f));
      check(
        `${at}: fonts`,
        missing.length === 0,
        `missing=${JSON.stringify(missing)} candidate=${JSON.stringify(page.fonts.candidate)}`,
      );

      check(
        `${at}: text`,
        page.textMismatches.length === 0,
        page.textMismatches
          .slice(0, 5)
          .map((m) => JSON.stringify(m))
          .join("\n    "),
      );
      check(
        `${at}: line geometry`,
        page.geometryDrift.length === 0,
        page.geometryDrift
          .slice(0, 5)
          .map((m) => JSON.stringify(m))
          .join("\n    "),
      );
      check(
        `${at}: rules`,
        page.ruleDrift.length === 0,
        page.ruleDrift
          .slice(0, 5)
          .map((m) => JSON.stringify(m))
          .join("\n    "),
      );
    }

    const label = mode === "db" ? "live data" : "static fallback";
    console.log(
      `${label.padEnd(15)} ${report.totalIssues === 0 ? "OK" : `${report.totalIssues} issue(s)`}`,
    );
    return status === 0 && report.totalIssues === 0;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`fixture: ${fixturePath}`);
console.log(
  `tolerance: x=${TOLERANCE_X}pt y=${TOLERANCE_Y}pt rules=${TOLERANCE_RULE}pt\n`,
);

let ok = await runMode("fallback");
if (process.argv.includes("--db")) {
  ok = (await runMode("db")) && ok;
}

if (failures.length) {
  console.error(`\n${failures.length} assertion(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nApplication CV matches the reference layout.");
