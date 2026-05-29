-- Add supervisor-to-operator assignment support.
ALTER TABLE "users" ADD COLUMN "supervisorId" TEXT;

CREATE INDEX "users_supervisorId_idx" ON "users"("supervisorId");

ALTER TABLE "users" ADD CONSTRAINT "users_supervisorId_fkey"
FOREIGN KEY ("supervisorId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
