-- CreateEnum
CREATE TYPE "VonalpVocabularyType" AS ENUM ('VONALP', 'VONALP_EP');

-- CreateEnum
CREATE TYPE "VonalpSourceType" AS ENUM ('ENTRY', 'TOPONYM', 'ANTHROPONYM', 'FOREIGNISM');

-- CreateEnum
CREATE TYPE "VonalpCompletionStatus" AS ENUM ('COMPLETE', 'INCOMPLETE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "vonalp_terms" (
    "id" TEXT NOT NULL,
    "vocabularyType" "VonalpVocabularyType" NOT NULL,
    "sourceType" "VonalpSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceCreatedById" TEXT,
    "term" TEXT,
    "pronunciation" TEXT,
    "grammaticalCategory" TEXT,
    "grammaticalSubcategory" TEXT,
    "syllabicDivision" TEXT,
    "etymology" TEXT,
    "firstDefinition" TEXT,
    "secondDefinition" TEXT,
    "origin" TEXT,
    "completionStatus" "VonalpCompletionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "missingFields" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT,
    "updatedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vonalp_terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vonalp_terms_vocabularyType_sourceType_sourceId_key" ON "vonalp_terms"("vocabularyType", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "vonalp_terms_vocabularyType_completionStatus_idx" ON "vonalp_terms"("vocabularyType", "completionStatus");

-- CreateIndex
CREATE INDEX "vonalp_terms_sourceType_sourceId_idx" ON "vonalp_terms"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "vonalp_terms_sourceCreatedById_idx" ON "vonalp_terms"("sourceCreatedById");

-- AddForeignKey
ALTER TABLE "vonalp_terms" ADD CONSTRAINT "vonalp_terms_sourceCreatedById_fkey" FOREIGN KEY ("sourceCreatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vonalp_terms" ADD CONSTRAINT "vonalp_terms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vonalp_terms" ADD CONSTRAINT "vonalp_terms_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
