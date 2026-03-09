import { z } from "zod";
import { EMPRESAS, MOTIVOS, RESOLUCOES, STATUS_RECLAMACAO, STATUS_TICKET } from "@/config/domains";

export const ticketSchema = z.object({
  nomeCliente: z.string().min(3),
  dataCompra: z.string().datetime(),
  numeroVenda: z.string().min(3),
  linkPedido: z.string().url().optional().or(z.literal("")),
  uf: z.string().length(2),
  cpf: z.string().min(11).max(14),
  canalMarketplace: z.string().min(2),
  empresa: z.enum(EMPRESAS),
  produto: z.string().min(2),
  sku: z.string().min(2),
  fabricante: z.string().optional(),
  transportadora: z.string().optional(),
  statusReclamacao: z.enum(STATUS_RECLAMACAO),
  dataReclamacao: z.string().datetime(),
  motivo: z.enum(MOTIVOS),
  detalhesCliente: z.string().optional(),
  resolucao: z.enum(RESOLUCOES).optional().nullable(),
  valorReembolso: z.coerce.number().min(0).default(0),
  valorColeta: z.coerce.number().min(0).default(0),
  statusTicket: z.enum(STATUS_TICKET),
  prazoConclusao: z.string().datetime().optional().nullable(),
  responsavelId: z.string().uuid().optional().nullable()
});

export const ticketFiltersSchema = z.object({
  search: z.string().optional(),
  empresa: z.enum(EMPRESAS).optional(),
  canalMarketplace: z.string().optional(),
  statusTicket: z.enum(STATUS_TICKET).optional(),
  statusReclamacao: z.enum(STATUS_RECLAMACAO).optional(),
  motivo: z.enum(MOTIVOS).optional(),
  responsavelId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(20),
  orderBy: z.enum(["dataReclamacao", "criadoEm", "custosTotais", "prazoConclusao"]).default("criadoEm"),
  orderDir: z.enum(["asc", "desc"]).default("desc")
});

export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketFiltersInput = z.infer<typeof ticketFiltersSchema>;
