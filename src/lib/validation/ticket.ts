import { z } from "zod";
import { EMPRESAS, MOTIVOS, STATUS_RECLAMACAO, STATUS_TICKET } from "@/config/domains";

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
  valorReembolso: z.coerce.number().min(0).default(0),
  valorColeta: z.coerce.number().min(0).default(0),
  statusTicket: z.enum(STATUS_TICKET),
  prazoConclusao: z.string().datetime().optional().nullable()
});

export type TicketInput = z.infer<typeof ticketSchema>;
