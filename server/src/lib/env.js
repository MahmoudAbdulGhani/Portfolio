const weakSecrets = new Set(["secret", "changeme", "change-me", "development-secret"]);

export function validateProductionEnvironment() {
  if (process.env.NODE_ENV !== "production") return;
  const missing = ["DATABASE_URL", "JWT_SECRET", "GEMINI_API_KEY"].filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(", ")}.`);
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (jwtSecret.length < 32 || weakSecrets.has(jwtSecret.toLowerCase())) {
    throw new Error("JWT_SECRET must be a strong, unique value of at least 32 characters in production.");
  }
  if (!/^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL ?? "")) throw new Error("DATABASE_URL must be a PostgreSQL connection URL.");
}
