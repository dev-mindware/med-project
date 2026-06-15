-- CreateTable
CREATE TABLE "volna_terms" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "grammaticalCategory" TEXT,
    "grammaticalSubcategory" TEXT,
    "definition" TEXT NOT NULL,
    "usageExample" TEXT,
    "notes" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "updatedById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "correctionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volna_terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "volna_terms_term_language_key" ON "volna_terms"("term", "language");

-- CreateIndex
CREATE INDEX "volna_terms_language_approvalStatus_idx" ON "volna_terms"("language", "approvalStatus");

-- CreateIndex
CREATE INDEX "volna_terms_grammaticalCategory_idx" ON "volna_terms"("grammaticalCategory");

-- CreateIndex
CREATE INDEX "volna_terms_createdById_idx" ON "volna_terms"("createdById");

-- AddForeignKey
ALTER TABLE "volna_terms" ADD CONSTRAINT "volna_terms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volna_terms" ADD CONSTRAINT "volna_terms_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volna_terms" ADD CONSTRAINT "volna_terms_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
