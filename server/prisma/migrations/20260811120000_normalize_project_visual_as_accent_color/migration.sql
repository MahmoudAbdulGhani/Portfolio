-- Keep the existing `visual` column for compatibility, but normalize it to a
-- single, canonical accent color rather than a gradient/content identifier.
UPDATE "Project"
SET "visual" = CASE "visual"
  WHEN 'gradient-blue' THEN '#5966A0'
  WHEN 'gradient-violet' THEN '#765D99'
  WHEN 'gradient-teal' THEN '#26879B'
  WHEN 'gradient-amber' THEN '#A8693F'
  WHEN 'gradient-rose' THEN '#825C91'
  WHEN 'gradient-green' THEN '#347F7B'
  ELSE "visual"
END;

UPDATE "Project"
SET "visual" = UPPER("visual")
WHERE "visual" ~ '^#[0-9A-Fa-f]{6}$';

UPDATE "Project"
SET "visual" = '#5966A0'
WHERE "visual" !~ '^#[0-9A-F]{6}$';

ALTER TABLE "Project"
  ALTER COLUMN "visual" SET DEFAULT '#5966A0';

ALTER TABLE "Project"
  ADD CONSTRAINT "Project_visual_hex_color_check"
  CHECK ("visual" ~ '^#[0-9A-F]{6}$');
