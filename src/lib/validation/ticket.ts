import { z } from "zod";
import { CANAIS_MARKETPLACE, EMPRESAS, MOTIVOS, RESOLUCOES, STATUS_RECLAMACAO, STATUS_TICKET } from "@/config/domains";

const isoDateOrDateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Data inválida"
});

export const ticketSchema = z.object({
  nomeCliente: z.string().min(3),
  dataCompra: isoDateOrDateString,
  numeroVenda: z.string().min(3),
  linkPedido: z.string().url().optional().or(z.literal("")),
  uf: z.string().length(2),
  cpf: z.string().min(11).max(14),
  canalMarketplace: z.enum(CANAIS_MARKETPLACE, { message: "Marketplace inválido" }),
  empresa: z.enum(EMPRESAS),
  produto: z.string().min(2),
  sku: z.string().min(2),
  fabricante: z.string().optional().or(z.literal("")),
  transportadora: z.string().optional().or(z.literal("")),
  statusReclamacao: z.enum(STATUS_RECLAMACAO),
  dataReclamacao: isoDateOrDateString,
  motivo: z.enum(MOTIVOS),
  detalhesCliente: z.string().optional().or(z.literal("")),
  resolucao: z.enum(RESOLUCOES).optional().nullable(),
  valorReembolso: z.coerce.number().min(0).default(0),
  valorColeta: z.coerce.number().min(0).default(0),
  statusTicket: z.enum(STATUS_TICKET),
  prazoConclusao: isoDateOrDateString.optional().nullable(),
  responsavelId: z.string().uuid().optional().nullable()
});

export const ticketFormSchema = ticketSchema.extend({
  dataCompra: z.string().min(1, "Data de compra é obrigatória"),
  dataReclamacao: z.string().min(1, "Data da reclamação é obrigatória"),
  prazoConclusao: z.string().optional().nullable(),
  linkPedido: z.string().optional(),
  fabricante: z.string().optional(),
  transportadora: z.string().optional(),
  detalhesCliente: z.string().optional(),
  resolucao: z.enum(RESOLUCOES).or(z.literal("")).optional().nullable(),
  responsavelId: z.string().uuid("Responsável inválido").or(z.literal("")).optional().nullable()
});

export const ticketFiltersSchema = z.object({
  search: z.string().optional(),
  empresa: z.enum(EMPRESAS).optional(),
  canalMarketplace: z.enum(CANAIS_MARKETPLACE).optional(),
  statusTicket: z.enum(STATUS_TICKET).optional(),
  statusReclamacao: z.enum(STATUS_RECLAMACAO).optional(),
  motivo: z.enum(MOTIVOS).optional(),
  responsavelId: z.string().uuid().optional(),
  criadoPorId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(20),
  orderBy: z.enum(["dataReclamacao", "criadoEm", "custosTotais", "prazoConclusao"]).default("criadoEm"),
  orderDir: z.enum(["asc", "desc"]).default("desc")
});

export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketFormInput = z.infer<typeof ticketFormSchema>;
export type TicketFiltersInput = z.infer<typeof ticketFiltersSchema>;
