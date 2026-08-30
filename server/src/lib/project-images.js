import { randomUUID } from "node:crypto";

const imageTypes = new Map([
  ["image/jpeg", { extension: "jpg", signature: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff }],
  ["image/png", { extension: "png", signature: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) }],
  ["image/webp", { extension: "webp", signature: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" }],
  ["image/avif", { extension: "avif", signature: (b) => b.subarray(4, 12).toString().includes("ftyp") && b.subarray(8, 32).toString().includes("avif") }],
]);

export function validateProjectImage(file) {
  if (!file?.buffer?.length) return "Choose an image to upload.";
  const type = imageTypes.get(file.mimetype);
  if (!type || !type.signature(file.buffer)) return "Only valid JPEG, PNG, WebP, or AVIF images are allowed.";
  return null;
}

export async function uploadProjectImage(file, projectSlug) {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-images";
  if (!baseUrl || !serviceKey) throw new Error("Image storage is not configured.");

  const { extension } = imageTypes.get(file.mimetype);
  const safeSlug = String(projectSlug || "project").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "project";
  const objectPath = `projects/${safeSlug}/${randomUUID()}.${extension}`;
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": file.mimetype, "x-upsert": "false" },
    body: file.buffer,
  });
  if (!response.ok) throw new Error("Image storage rejected the upload.");
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}
