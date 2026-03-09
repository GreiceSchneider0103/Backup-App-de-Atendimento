import { StatusTicket } from "@prisma/client";

export type SLAStatus = "CONCLUIDO" | "ATRASADO" | "NO_PRAZO";

export function calculateSla(statusTicket: StatusTicket, prazoConclusao?: Date | null): SLAStatus {
  if (statusTicket === "CONCLUIDO") return "CONCLUIDO";
  if (prazoConclusao && new Date() > prazoConclusao) return "ATRASADO";
  return "NO_PRAZO";
}
