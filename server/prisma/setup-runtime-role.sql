-- Run this file manually in the Neon SQL Editor while connected as neondb_owner.
-- Replace <STRONG_RUNTIME_PASSWORD> before execution. Never commit the real value.
-- This script intentionally does not grant access to "_prisma_migrations" and
-- does not configure default privileges for future tables.

DO $setup$
DECLARE
  runtime_password text := '<STRONG_RUNTIME_PASSWORD>';
BEGIN
  IF runtime_password = ('<STRONG_' || 'RUNTIME_PASSWORD>') THEN
    RAISE EXCEPTION 'Replace <STRONG_RUNTIME_PASSWORD> before running this script';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'portfolio_app') THEN
    EXECUTE format(
      'CREATE ROLE portfolio_app LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
      runtime_password
    );
  ELSE
    -- PostgreSQL 18 does not allow a CREATEROLE administrator to ALTER the
    -- SUPERUSER, REPLICATION, or BYPASSRLS attributes, even when setting them
    -- to NO. Those protected attributes were fixed when the role was created.
    EXECUTE format(
      'ALTER ROLE portfolio_app WITH LOGIN PASSWORD %L NOCREATEDB NOCREATEROLE',
      runtime_password
    );
  END IF;
END
$setup$;

GRANT CONNECT ON DATABASE neondb TO portfolio_app;
GRANT USAGE ON SCHEMA public TO portfolio_app;
REVOKE CREATE ON DATABASE neondb FROM portfolio_app;
REVOKE CREATE ON SCHEMA public FROM portfolio_app;

-- Clear any accidental direct grants before applying the explicit allowlist.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM portfolio_app;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM portfolio_app;

-- Authentication: login/session reads and password changes.
GRANT SELECT, UPDATE ON TABLE public."Admin" TO portfolio_app;

-- Profile settings. Related Experience and SocialLink records are replaced by
-- nested Prisma writes, so those child tables require full row-level CRUD.
GRANT SELECT, UPDATE ON TABLE public."Profile" TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Experience" TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."SocialLink" TO portfolio_app;

-- Admin-managed portfolio collections.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Project" TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Technology" TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Skill" TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Education" TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Certification" TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."SiteSection" TO portfolio_app;

-- Contact inbox and server-side abuse protection.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."Message" TO portfolio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."RateLimitBucket" TO portfolio_app;

-- CV Manager uses find/create/upsert/update, but has no runtime delete route.
GRANT SELECT, INSERT, UPDATE ON TABLE public."CvConfiguration" TO portfolio_app;

-- No sequence grants are needed: every current ID is a Prisma-generated CUID,
-- a fixed string ID, or another non-sequence value.

-- IMPORTANT FOR EVERY FUTURE MIGRATION:
-- Add an explicit GRANT for each newly created table to that migration SQL.
-- Keep Prisma migrations on the owner-only DIRECT_URL connection.
