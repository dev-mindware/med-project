-- CreateTable
CREATE TABLE "neologisms" (
    "id" TEXT NOT NULL,
    "entry" TEXT NOT NULL,
    "pronunciation" TEXT,
    "syllabicDivision" TEXT,
    "etymology" TEXT,
    "firstDefinition" TEXT NOT NULL,
    "secondDefinition" TEXT,
    "thirdDefinition" TEXT,
    "usageExample" TEXT,
    "abbreviation" TEXT,
    "acronym" TEXT,
    "acronymMeaning" TEXT,
    "reduction" TEXT,
    "reductionMeaning" TEXT,
    "shortForm" TEXT,
    "fullForm" TEXT,
    "grammaticalCategory" TEXT,
    "grammaticalSubcategory" TEXT,
    "grammaticalStatus" TEXT,
    "languageCode" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "isVocabulary" BOOLEAN NOT NULL DEFAULT false,
    "isVocabularyEP" BOOLEAN NOT NULL DEFAULT false,
    "isForeignism" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "updatedById" TEXT,
    "approvedById" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "correctionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "neologisms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "neologisms_entry_unique_ci_idx" ON "neologisms" (lower(btrim("entry")));

-- AddForeignKey
ALTER TABLE "neologisms" ADD CONSTRAINT "neologisms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neologisms" ADD CONSTRAINT "neologisms_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neologisms" ADD CONSTRAINT "neologisms_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
