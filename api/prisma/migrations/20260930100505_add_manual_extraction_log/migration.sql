-- AlterTable
ALTER TABLE "anthroponyms" ADD COLUMN     "isVocabularyEP" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "entries" ADD COLUMN     "acronymMeaning" TEXT,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isVocabularyEP" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "languageCode" TEXT,
ADD COLUMN     "reductionMeaning" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "foreignisms" ADD COLUMN     "isVocabularyEP" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "toponyms" ADD COLUMN     "isVocabularyEP" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "manual_extraction_logs" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "userId" TEXT,
    "model" TEXT NOT NULL,
    "totalTerms" INTEGER NOT NULL,
    "validRows" INTEGER NOT NULL,
    "entries" INTEGER NOT NULL,
    "toponyms" INTEGER NOT NULL,
    "anthroponyms" INTEGER NOT NULL,
    "foreignisms" INTEGER NOT NULL,
    "warnings" INTEGER NOT NULL,
    "duplicatesRemoved" INTEGER NOT NULL,
    "lowConfidenceDiscarded" INTEGER NOT NULL,
    "processingMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_extraction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manual_extraction_logs_userId_idx" ON "manual_extraction_logs"("userId");

-- CreateIndex
CREATE INDEX "manual_extraction_logs_createdAt_idx" ON "manual_extraction_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "manual_extraction_logs" ADD CONSTRAINT "manual_extraction_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
