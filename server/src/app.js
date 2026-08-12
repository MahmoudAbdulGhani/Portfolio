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
app.use(cors());
app.use(express.json({ limit: "1mb" }));

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
