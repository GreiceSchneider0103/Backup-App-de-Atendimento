-- Idempotent patch to align production DB with current Prisma schema/code.
-- Safe: no DROP, no data reset.

BEGIN;

-- 1) Ensure enum BackupSyncStatus exists (and values).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BackupSyncStatus') THEN
    CREATE TYPE "BackupSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BackupSyncStatus') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'BackupSyncStatus' AND e.enumlabel = 'PENDING'
    ) THEN
      ALTER TYPE "BackupSyncStatus" ADD VALUE 'PENDING';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'BackupSyncStatus' AND e.enumlabel = 'SYNCED'
    ) THEN
      ALTER TYPE "BackupSyncStatus" ADD VALUE 'SYNCED';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'BackupSyncStatus' AND e.enumlabel = 'FAILED'
    ) THEN
      ALTER TYPE "BackupSyncStatus" ADD VALUE 'FAILED';
    END IF;
  END IF;
END $$;

-- 2) Ensure Ticket backup columns exist.
ALTER TABLE "Ticket"
  ADD COLUMN IF NOT EXISTS "backupSheetRowNumber" INTEGER,
  ADD COLUMN IF NOT EXISTS "backupSyncStatus" "BackupSyncStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "backupLastSyncedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "backupSyncError" TEXT,
  ADD COLUMN IF NOT EXISTS "comentarioInterno" TEXT;

CREATE INDEX IF NOT EXISTS "Ticket_backup_status_idx" ON "Ticket"("backupSyncStatus");

-- 3) Ensure enum AcaoUsuarioAuditoria exists (and values).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AcaoUsuarioAuditoria') THEN
    CREATE TYPE "AcaoUsuarioAuditoria" AS ENUM ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'PROFILE_CHANGE');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AcaoUsuarioAuditoria') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'AcaoUsuarioAuditoria' AND e.enumlabel = 'CREATE'
    ) THEN
      ALTER TYPE "AcaoUsuarioAuditoria" ADD VALUE 'CREATE';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'AcaoUsuarioAuditoria' AND e.enumlabel = 'UPDATE'
    ) THEN
      ALTER TYPE "AcaoUsuarioAuditoria" ADD VALUE 'UPDATE';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'AcaoUsuarioAuditoria' AND e.enumlabel = 'STATUS_CHANGE'
    ) THEN
      ALTER TYPE "AcaoUsuarioAuditoria" ADD VALUE 'STATUS_CHANGE';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'AcaoUsuarioAuditoria' AND e.enumlabel = 'PROFILE_CHANGE'
    ) THEN
      ALTER TYPE "AcaoUsuarioAuditoria" ADD VALUE 'PROFILE_CHANGE';
    END IF;
  END IF;
END $$;

-- 4) Ensure UsuarioAuditoria table and indexes exist.
CREATE TABLE IF NOT EXISTS "UsuarioAuditoria" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "atorId" TEXT NOT NULL,
  "acao" "AcaoUsuarioAuditoria" NOT NULL,
  "campo" TEXT NOT NULL,
  "valorAntigo" TEXT,
  "valorNovo" TEXT,
  "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsuarioAuditoria_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UsuarioAuditoria_usuarioId_fkey'
  ) THEN
    ALTER TABLE "UsuarioAuditoria"
      ADD CONSTRAINT "UsuarioAuditoria_usuarioId_fkey"
      FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UsuarioAuditoria_atorId_fkey'
  ) THEN
    ALTER TABLE "UsuarioAuditoria"
      ADD CONSTRAINT "UsuarioAuditoria_atorId_fkey"
      FOREIGN KEY ("atorId") REFERENCES "Usuario"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "UsuarioAuditoria_usuario_data_idx" ON "UsuarioAuditoria"("usuarioId", "dataHora");
CREATE INDEX IF NOT EXISTS "UsuarioAuditoria_ator_idx" ON "UsuarioAuditoria"("atorId");

COMMIT;
