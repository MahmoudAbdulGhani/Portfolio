ALTER TABLE "Experience"
ADD COLUMN "role" TEXT,
ADD COLUMN "company" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "startDate" TEXT,
ADD COLUMN "endDate" TEXT,
ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "location" TEXT;

UPDATE "Experience"
SET
  "role" = CASE
    WHEN "milestone" = 'Backend Engineering Layer' THEN 'Backend Developer'
    WHEN "milestone" = 'Quality Assurance Engine' THEN 'QA Intern'
    ELSE "milestone"
  END,
  "company" = "facility",
  "description" = "details",
  "startDate" = CASE
    WHEN "meta" ~ '^\d{2}/\d{4}\s*[–-]\s*' THEN substring("meta" from 4 for 4) || '-' || substring("meta" from 1 for 2)
    ELSE NULL
  END,
  "endDate" = CASE
    WHEN "meta" ~ '^\d{2}/\d{4}\s*[–-]\s*\d{2}/\d{4}$' THEN substring("meta" from 14 for 4) || '-' || substring("meta" from 11 for 2)
    ELSE NULL
  END,
  "isCurrent" = "meta" ~* 'Present';
