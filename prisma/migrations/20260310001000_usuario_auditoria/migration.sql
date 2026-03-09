CREATE TYPE "AcaoUsuarioAuditoria" AS ENUM ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'PROFILE_CHANGE');

CREATE TABLE "UsuarioAuditoria" (
  "id" TEXT PRIMARY KEY,
  "usuarioId" TEXT NOT NULL,
  "atorId" TEXT NOT NULL,
  "acao" "AcaoUsuarioAuditoria" NOT NULL,
  "campo" TEXT NOT NULL,
  "valorAntigo" TEXT,
  "valorNovo" TEXT,
  "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsuarioAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id"),
  CONSTRAINT "UsuarioAuditoria_atorId_fkey" FOREIGN KEY ("atorId") REFERENCES "Usuario"("id")
);

CREATE INDEX "UsuarioAuditoria_usuario_data_idx" ON "UsuarioAuditoria"("usuarioId", "dataHora");
CREATE INDEX "UsuarioAuditoria_ator_idx" ON "UsuarioAuditoria"("atorId");
