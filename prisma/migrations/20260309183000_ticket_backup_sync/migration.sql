CREATE TYPE "BackupSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

ALTER TABLE "Ticket"
  ADD COLUMN "backupSheetRowNumber" INTEGER,
  ADD COLUMN "backupSyncStatus" "BackupSyncStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "backupLastSyncedAt" TIMESTAMP(3),
  ADD COLUMN "backupSyncError" TEXT;

CREATE INDEX "Ticket_backup_status_idx" ON "Ticket"("backupSyncStatus");
