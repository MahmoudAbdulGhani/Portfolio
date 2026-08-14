import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const expectedRole = process.env.EXPECTED_RUNTIME_DB_ROLE ?? "portfolio_app";
const rollbackMarker = new Error("runtime database verification rollback");

const expectedPrivileges = {
  Admin: ["SELECT", "UPDATE"],
  Profile: ["SELECT", "UPDATE"],
  Experience: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  SocialLink: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  Project: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  Technology: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  Skill: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  Education: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  Certification: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  Message: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  RateLimitBucket: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  CvConfiguration: ["SELECT", "INSERT", "UPDATE"],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const [identity] = await prisma.$queryRaw`
    SELECT current_user AS role_name,
           current_database() AS database_name,
           current_schema() AS schema_name
  `;
  assert(identity.role_name === expectedRole, `Expected role ${expectedRole}, received ${identity.role_name}`);
  assert(identity.schema_name === "public", `Expected public schema, received ${identity.schema_name}`);

  const [role] = await prisma.$queryRaw`
    SELECT rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
    FROM pg_catalog.pg_roles
    WHERE rolname = current_user
  `;
  assert(role && !Object.values(role).some(Boolean), "Runtime role has a forbidden PostgreSQL capability");

  const [boundaries] = await prisma.$queryRaw`
    SELECT
      has_database_privilege(current_user, current_database(), 'CONNECT') AS can_connect,
      has_database_privilege(current_user, current_database(), 'CREATE') AS can_create_database_objects,
      has_schema_privilege(current_user, current_schema(), 'USAGE') AS can_use_schema,
      has_schema_privilege(current_user, current_schema(), 'CREATE') AS can_create_schema_objects,
      EXISTS (
        SELECT 1 FROM pg_catalog.pg_tables
        WHERE schemaname = current_schema() AND tableowner = current_user
      ) AS owns_table
  `;
  assert(boundaries.can_connect && boundaries.can_use_schema, "Runtime connection lacks CONNECT or schema USAGE");
  assert(!boundaries.can_create_database_objects, "Runtime role can create database-level objects");
  assert(!boundaries.can_create_schema_objects, "Runtime role can create persistent schema objects");
  assert(!boundaries.owns_table, "Runtime role owns an application table");

  for (const [table, allowed] of Object.entries(expectedPrivileges)) {
    for (const privilege of ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"]) {
      const rows = await prisma.$queryRawUnsafe(
        "SELECT has_table_privilege(current_user, $1, $2) AS allowed",
        `public."${table}"`,
        privilege,
      );
      assert(rows[0].allowed === allowed.includes(privilege), `${table} has unexpected ${privilege} permission`);
    }
  }

  const migrationAccess = await prisma.$queryRaw`
    SELECT has_table_privilege(current_user, 'public._prisma_migrations', 'SELECT') AS allowed
  `;
  assert(!migrationAccess[0].allowed, "Runtime role can read Prisma migration history");

  const suffix = randomUUID().replaceAll("-", "").slice(0, 16);
  try {
    await prisma.$transaction(async (tx) => {
      // Interactive transaction queries share one database connection. Keep
      // them sequential for Neon transaction pooling and allow enough time for
      // a cold serverless compute to wake up.
      for (const model of [
        "admin", "profile", "experience", "socialLink", "project", "technology",
        "skill", "education", "certification", "message", "rateLimitBucket",
        "cvConfiguration",
      ]) {
        await tx[model].count();
      }

      const project = await tx.project.create({
        data: { slug: `security-audit-${suffix}`, name: "Disposable runtime audit", type: "Audit" },
      });
      await tx.project.update({ where: { id: project.id }, data: { published: false } });
      await tx.project.delete({ where: { id: project.id } });

      const message = await tx.message.create({
        data: {
          name: "Runtime audit",
          email: `runtime-audit-${suffix}@example.invalid`,
          subject: "Disposable permission test",
          message: "This transaction is intentionally rolled back.",
        },
      });
      await tx.message.update({ where: { id: message.id }, data: { read: true } });
      await tx.message.delete({ where: { id: message.id } });

      await tx.rateLimitBucket.upsert({
        where: { key: `runtime-audit:${suffix}` },
        create: { key: `runtime-audit:${suffix}`, windowStart: new Date(), count: 1 },
        update: { count: { increment: 1 } },
      });
      await tx.rateLimitBucket.delete({ where: { key: `runtime-audit:${suffix}` } });

      throw rollbackMarker;
    }, { maxWait: 15_000, timeout: 60_000 });
  } catch (error) {
    if (error !== rollbackMarker) throw error;
  }

  console.log("Restricted runtime database verification passed.");
} finally {
  await prisma.$disconnect();
}
