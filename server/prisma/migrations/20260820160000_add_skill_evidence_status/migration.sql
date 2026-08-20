ALTER TABLE "Skill" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'verified';

ALTER TABLE "Skill" ADD CONSTRAINT "Skill_status_check"
CHECK ("status" IN ('verified', 'familiar', 'learning'));
