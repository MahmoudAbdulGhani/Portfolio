import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/projects");

async function files(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes: true })).map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? files(target) : target;
  }))).flat();
}

let before = 0;
let after = 0;
for (const file of (await files(root)).filter((entry) => entry.toLowerCase().endsWith(".webp"))) {
  const source = await readFile(file);
  const metadata = await sharp(source).metadata();
  const maxWidth = path.basename(file).toLowerCase() === "cover.webp" ? 1600 : 1920;
  const output = await sharp(source)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6, smartSubsample: true })
    .toBuffer();
  before += source.length;
  if (output.length < source.length) {
    await writeFile(file, output);
    after += output.length;
    console.log(`${path.relative(root, file)}: ${metadata.width}x${metadata.height}, ${source.length} -> ${output.length} bytes`);
  } else {
    after += source.length;
  }
}

console.log(`Project images: ${before} -> ${after} bytes (${Math.round((1 - after / before) * 100)}% smaller)`);
