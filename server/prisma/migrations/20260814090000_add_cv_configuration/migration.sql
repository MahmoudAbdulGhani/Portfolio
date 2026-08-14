CREATE TABLE "CvConfiguration" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "professionalSummary" TEXT,
    "header" JSONB NOT NULL,
    "application" JSONB NOT NULL,
    "master" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CvConfiguration_pkey" PRIMARY KEY ("id")
);
