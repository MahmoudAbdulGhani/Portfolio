ALTER TABLE "Profile"
  ADD COLUMN "professionalSummary" TEXT,
  ADD COLUMN "availabilityStatus" TEXT,
  ADD COLUMN "availabilityText" TEXT,
  ADD COLUMN "responseTime" TEXT,
  ADD COLUMN "remoteAvailability" TEXT,
  ADD COLUMN "openToOpportunities" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "heroLabel" TEXT,
  ADD COLUMN "profileReference" TEXT,
  ADD COLUMN "whatsappNumber" TEXT,
  ADD COLUMN "whatsappMessage" TEXT,
  ADD COLUMN "focusAreas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "SocialLink"
  ADD COLUMN "platform" TEXT NOT NULL DEFAULT 'link',
  ADD COLUMN "username" TEXT,
  ADD COLUMN "icon" TEXT,
  ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "showInHero" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showInContact" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showInFooter" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showOnCv" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Experience"
  ADD COLUMN "workArrangement" TEXT,
  ADD COLUMN "bullets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "technologies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showOnCv" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "cvDescription" TEXT,
  ADD COLUMN "cvBullets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Project"
  ADD COLUMN "impactSummary" TEXT,
  ADD COLUMN "imageAlt" TEXT,
  ADD COLUMN "showOnCv" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showOnPortfolio" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "cvDescription" TEXT,
  ADD COLUMN "cvBullets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Education"
  ADD COLUMN "location" TEXT,
  ADD COLUMN "startDate" TEXT,
  ADD COLUMN "endDate" TEXT,
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showOnCv" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "cvDescription" TEXT;

ALTER TABLE "Certification"
  ADD COLUMN "issueDate" TEXT,
  ADD COLUMN "expectedDate" TEXT,
  ADD COLUMN "duration" TEXT,
  ADD COLUMN "credentialId" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showOnCv" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "cvDescription" TEXT;

CREATE TABLE "SiteSection" (
  "key" TEXT NOT NULL,
  "eyebrow" TEXT,
  "heading" TEXT,
  "description" TEXT,
  "ctaLabel" TEXT,
  "ctaUrl" TEXT,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "content" JSONB NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("key")
);
