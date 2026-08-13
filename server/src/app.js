import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import publicRouter from "./routes/public.js";
import adminRouter from "./routes/admin.js";
import assistantRouter from "./routes/assistant.js";
import jobMatchRouter from "./routes/job-match.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
const configuredOrigin = process.env.FRONTEND_URL?.replace(/\/$/, "");
const developmentOrigins = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
app.use(cors((req, callback) => {
  const origin = req.get("origin");
  const ownOrigin = `${req.protocol}://${req.get("host")}`;
  const allowed = !origin || origin === ownOrigin || origin === configuredOrigin || developmentOrigins.has(origin);
  callback(null, {
    credentials: true,
    origin: allowed ? origin || false : false,
  });
}));
app.use(express.json({ limit: "1mb" }));

app.use("/api/admin", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (!origin) return next();
  const ownOrigin = `${req.protocol}://${req.get("host")}`;
  if (origin === ownOrigin || origin === configuredOrigin || developmentOrigins.has(origin)) return next();
  return res.status(403).json({ message: "Invalid request origin." });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/assistant", assistantRouter);
app.use("/api/job-match", jobMatchRouter);
app.use("/api", publicRouter);
app.use("/api/admin", adminRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found." });
});

app.use((error, _req, res, _next) => {
  console.error("Server error:", error);
  res.status(500).json({ message: "Internal server error." });
});

export { app, prisma };
export default app;
