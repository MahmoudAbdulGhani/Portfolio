import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./lib/prisma.js";
import publicRouter from "./routes/public.js";
import adminRouter from "./routes/admin.js";
import assistantRouter from "./routes/assistant.js";
import jobMatchRouter from "./routes/job-match.js";
import { validateProductionEnvironment } from "./lib/env.js";

validateProductionEnvironment();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const isVercel = Boolean(process.env.VERCEL);

// Vercel overwrites X-Forwarded-For with the client IP. Trust exactly that
// platform hop in Vercel, but never trust spoofable forwarded headers locally.
app.set("trust proxy", isVercel ? 1 : false);
app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", "data:", "https:"], fontSrc: ["'self'", "data:"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'"], frameSrc: ["'self'", "blob:"] } },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
});
const configuredOrigin = process.env.FRONTEND_URL?.replace(/\/$/, "");
const developmentOrigins = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
const originAllowed = (origin, req) => {
  if (!origin) return true;
  const ownOrigin = `${req.protocol}://${req.get("host")}`;
  return origin === ownOrigin || origin === configuredOrigin || (!isProduction && developmentOrigins.has(origin));
};
app.use(cors((req, callback) => {
  const origin = req.get("origin");
  callback(null, {
    credentials: true,
    origin: originAllowed(origin, req) ? origin || false : false,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 600,
  });
}));
app.use(express.json({ limit: "128kb", strict: true }));

const containsUnsafeObjectKey = (value, depth = 0) => {
  if (!value || typeof value !== "object" || depth > 20) return depth > 20;
  if (Array.isArray(value)) return value.some((item) => containsUnsafeObjectKey(item, depth + 1));
  return Object.keys(value).some((key) => ["__proto__", "prototype", "constructor"].includes(key) || containsUnsafeObjectKey(value[key], depth + 1));
};
app.use("/api", (req, res, next) => {
  const isImageUpload = req.method === "POST" && req.path === "/admin/uploads/project-image";
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.path !== "/admin/auth/logout" && !isImageUpload && !req.is("application/json")) {
    return res.status(415).json({ message: "Content-Type must be application/json." });
  }
  if (containsUnsafeObjectKey(req.body)) return res.status(400).json({ message: "Invalid request data." });
  next();
});

app.use(["/api/admin", "/api/assistant", "/api/job-match"], (_req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  next();
});

app.use("/api/admin", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (!origin && !isProduction) return next();
  if (originAllowed(origin, req)) return next();
  console.warn("[security] blocked_origin", { path: req.path, ip: req.ip });
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
  if (error?.type === "entity.too.large") return res.status(413).json({ message: "Request body is too large." });
  if (error?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "Image must be 4 MB or smaller." });
  if (error?.name === "MulterError") return res.status(400).json({ message: "Invalid image upload." });
  if (error instanceof SyntaxError && "body" in error) return res.status(400).json({ message: "Malformed JSON request." });
  console.error("Server error:", { name: error instanceof Error ? error.name : "UnknownError", code: error?.code });
  res.status(500).json({ message: "Internal server error." });
});

export { app, prisma };
export default app;
