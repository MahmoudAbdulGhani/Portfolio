import test from "node:test";
import assert from "node:assert/strict";
import { resumeLink } from "../src/lib/portfolio-links.js";

test("CV context uses the real CV endpoint when the CMS link is missing or invalid", () => {
  for (const value of [
    null,
    undefined,
    "",
    "javascript:alert(1)",
    "//untrusted.example/cv.pdf",
    "{resumeUrl}",
    "https://example.com/%7BresumeUrl%7D",
  ])
    assert.equal(resumeLink(value), "/api/cv.pdf");
});
test("CV context retains valid configured relative and absolute CV destinations", () => {
  for (const value of ["/api/cv.pdf", "/cv", "https://example.com/resume.pdf"])
    assert.equal(resumeLink(` ${value} `), value);
});
