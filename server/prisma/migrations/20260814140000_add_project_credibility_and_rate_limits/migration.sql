ALTER TABLE "Project"
ADD COLUMN "coverImage" TEXT,
ADD COLUMN "screenshots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "myRole" TEXT,
ADD COLUMN "contributions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "ownership" TEXT,
ADD COLUMN "teamSize" INTEGER;

CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "RateLimitBucket_updatedAt_idx" ON "RateLimitBucket"("updatedAt");

UPDATE "Experience" SET "description" = 'Built and updated PHP MVC modules, worked with relational database schemas, and wrote SQL queries for production admin systems.', "details" = 'Built and updated PHP MVC modules, worked with relational database schemas, and wrote SQL queries for production admin systems.' WHERE "role" = 'Backend Developer';
UPDATE "Experience" SET "description" = 'Tested application flows, documented bugs, and used logs to help identify and reproduce failures.', "details" = 'Tested application flows, documented bugs, and used logs to help identify and reproduce failures.' WHERE "role" = 'QA Intern';
UPDATE "Project" SET "features" = array_replace("features", 'Five-gate auth flow: registration → OTP → verification → JWT → protected routes', 'Registration with OTP verification, followed by JWT-protected routes') WHERE "slug" = 'gamezone-arena';
UPDATE "Project" SET "demo" = NULL WHERE "slug" = 'medicare-hub' AND "demo" = 'https://clinic-management-system.kesug.com/';
