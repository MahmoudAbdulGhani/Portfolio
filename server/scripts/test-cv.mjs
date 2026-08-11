import "dotenv/config";
import { writeFileSync } from "node:fs";
import { generateCvPdfBuffer } from "../src/lib/cv.js";

const buffer = await generateCvPdfBuffer({ origin: "http://localhost:5173" });
writeFileSync("./cv-test.pdf", buffer);
console.log("PDF bytes:", buffer.length);
await generateCvPdfBuffer.length; // noop