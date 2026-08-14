-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'CANCELLED', 'REJECTED', 'ATTENDED');

-- AlterTable
ALTER TABLE "events" DROP COLUMN IF EXISTS "googleFormUrl";
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "maxRegistrations" INTEGER;
ALTER TABLE "events" ALTER COLUMN "category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organization" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_eventId_email_key" ON "event_registrations"("eventId", "email");

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
