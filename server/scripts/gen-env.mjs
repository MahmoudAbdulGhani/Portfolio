import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, "..", ".env");

let content = readFileSync(envPath, "utf8");

function ensure(key, value) {
  const pattern = new RegExp(`^${key}=`, "m");
  if (!pattern.test(content)) {
    content += `\n${key}="${value}"\n`;
    return true;
  }
  return false;
}

ensure("JWT_SECRET", randomBytes(32).toString("base64url"));
ensure("ADMIN_PASSWORD", randomBytes(18).toString("base64url"));
ensure("ADMIN_EMAIL", "Mahmoud.Abdulghani@outlook.com");

writeFileSync(envPath, content);

console.log("server/.env ready: JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD are set.");
console.log("Secret values are stored only in server/.env and are not printed.");
