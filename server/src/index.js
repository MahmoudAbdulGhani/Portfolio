import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync } from "node:fs";
import express from "express";
import { app, prisma } from "./app.js";

// Keep the standalone backend default aligned with Vite's local proxy target.
const PORT = Number(process.env.PORT) || 3001;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../../dist");

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Neon establishes connections on demand. Starting this lightweight handshake
// alongside the dev server avoids making the first portfolio request pay all
// of that setup time, while individual routes still report real query errors.
void prisma.$connect().catch((error) => {
  const reason = error instanceof Error ? error.name : "unknown error";
  console.error(`Database connection warm-up failed (${reason}).`);
});
