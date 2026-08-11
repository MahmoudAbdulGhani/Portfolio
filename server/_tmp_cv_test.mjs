import { writeFileSync } from "node:fs";
import { generateCvPdfBuffer } from "./src/lib/cv.js";

const buf = await generateCvPdfBuffer({ origin: "http://localhost:3001" });
writeFileSync("cv-inspect.pdf", buf);
console.log("WROTE cv-inspect.pdf", buf.length, "bytes");