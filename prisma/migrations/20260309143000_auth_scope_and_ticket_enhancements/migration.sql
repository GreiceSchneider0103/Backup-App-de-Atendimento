ALTER TABLE "Ticket" ADD COLUMN "mesReclamacao" INTEGER;
ALTER TABLE "Ticket" ADD COLUMN "anoReclamacao" INTEGER;
ALTER TABLE "Ticket" ADD COLUMN "slaStatus" TEXT NOT NULL DEFAULT 'NO_PRAZO';

UPDATE "Ticket"
SET "mesReclamacao" = EXTRACT(MONTH FROM "dataReclamacao")::int,
    "anoReclamacao" = EXTRACT(YEAR FROM "dataReclamacao")::int
WHERE "mesReclamacao" IS NULL OR "anoReclamacao" IS NULL;

ALTER TABLE "Ticket" ALTER COLUMN "mesReclamacao" SET NOT NULL;
ALTER TABLE "Ticket" ALTER COLUMN "anoReclamacao" SET NOT NULL;

ALTER TABLE "Ticket"
ADD CONSTRAINT "Ticket_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Ticket_mes_ano_idx" ON "Ticket"("mesReclamacao", "anoReclamacao");
