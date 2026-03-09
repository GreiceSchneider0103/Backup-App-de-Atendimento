-- Create enums
CREATE TYPE "Perfil" AS ENUM ('ATENDENTE', 'SUPERVISOR', 'ADMIN');
CREATE TYPE "Empresa" AS ENUM ('LESSUL', 'MS_DECOR', 'VIVA_VIDA', 'MOVELBENTO', 'MODIFIKA');
CREATE TYPE "StatusReclamacao" AS ENUM ('AFETANDO', 'NAO_AFETANDO', 'REMOVIDA');
CREATE TYPE "Motivo" AS ENUM ('DESISTENCIA', 'DEFEITO_FABRICACAO', 'PRODUTO_INCORRETO', 'FALTANDO_ITENS', 'PRODUTO_DANIFICADO', 'PROBLEMA');
CREATE TYPE "Resolucao" AS ENUM ('ASSISTENCIA', 'DEVOLUCAO', 'REEMBOLSO', 'RESOLVIDO');
CREATE TYPE "StatusTicket" AS ENUM ('CONCLUIDO', 'ABERTO', 'AGUARDANDO_CLIENTE', 'AGUARDANDO_DEVOLUCAO', 'AGUARDANDO_ASSISTENCIA', 'AGUARDANDO_MARKETPLACE');
CREATE TYPE "AcaoAuditoria" AS ENUM ('CREATE', 'UPDATE', 'SOFT_DELETE', 'STATUS_CHANGE');

CREATE TABLE "Usuario" (
  "id" TEXT PRIMARY KEY,
  "authUserId" TEXT NOT NULL UNIQUE,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "perfil" "Perfil" NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Ticket" (
  "id" TEXT PRIMARY KEY,
  "nomeCliente" TEXT NOT NULL,
  "dataCompra" TIMESTAMP(3) NOT NULL,
  "numeroVenda" TEXT NOT NULL,
  "linkPedido" TEXT,
  "uf" CHAR(2) NOT NULL,
  "cpf" TEXT NOT NULL,
  "canalMarketplace" TEXT NOT NULL,
  "empresa" "Empresa" NOT NULL,
  "produto" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "fabricante" TEXT,
  "transportadora" TEXT,
  "statusReclamacao" "StatusReclamacao" NOT NULL,
  "dataReclamacao" TIMESTAMP(3) NOT NULL,
  "motivo" "Motivo" NOT NULL,
  "detalhesCliente" TEXT,
  "resolucao" "Resolucao",
  "valorReembolso" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "valorColeta" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "custosTotais" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "statusTicket" "StatusTicket" NOT NULL DEFAULT 'ABERTO',
  "responsavelId" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "criadoPorId" TEXT NOT NULL,
  "atualizadoPorId" TEXT NOT NULL,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "prazoConclusao" TIMESTAMP(3),
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Ticket_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id"),
  CONSTRAINT "Ticket_atualizadoPorId_fkey" FOREIGN KEY ("atualizadoPorId") REFERENCES "Usuario"("id")
);

CREATE TABLE "TicketAuditoria" (
  "id" TEXT PRIMARY KEY,
  "ticketId" TEXT NOT NULL,
  "acao" "AcaoAuditoria" NOT NULL,
  "campo" TEXT NOT NULL,
  "valorAntigo" TEXT,
  "valorNovo" TEXT,
  "usuarioId" TEXT NOT NULL,
  "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketAuditoria_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id"),
  CONSTRAINT "TicketAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id")
);

CREATE INDEX "Ticket_marketplace_empresa_idx" ON "Ticket"("canalMarketplace", "empresa");
CREATE INDEX "Ticket_status_idx" ON "Ticket"("statusTicket", "statusReclamacao");
CREATE INDEX "Ticket_dataReclamacao_idx" ON "Ticket"("dataReclamacao");
CREATE INDEX "Ticket_responsavel_idx" ON "Ticket"("responsavelId");
CREATE INDEX "TicketAuditoria_ticket_data_idx" ON "TicketAuditoria"("ticketId", "dataHora");
CREATE INDEX "TicketAuditoria_usuario_idx" ON "TicketAuditoria"("usuarioId");
