import { Perfil, Prisma } from "@prisma/client";
import { ForbiddenError } from "@/lib/errors";

export type Permission =
  | "ticket.create"
  | "ticket.update"
  | "ticket.update_sensitive"
  | "ticket.soft_delete"
  | "user.manage"
  | "reports.full"
  | "reports.export"
  | "audit.read";

const matrix: Record<Perfil, Permission[]> = {
  ATENDENTE: ["ticket.create", "ticket.update"],
  SUPERVISOR: [
    "ticket.create",
    "ticket.update",
    "ticket.update_sensitive",
    "reports.full",
    "reports.export"
  ],
  ADMIN: [
    "ticket.create",
    "ticket.update",
    "ticket.update_sensitive",
    "ticket.soft_delete",
    "user.manage",
    "reports.full",
    "reports.export",
    "audit.read"
  ]
};

export function hasPermission(perfil: Perfil, permission: Permission): boolean {
  return matrix[perfil].includes(permission);
}

export function assertPermission(perfil: Perfil, permission: Permission) {
  if (!hasPermission(perfil, permission)) throw new ForbiddenError();
}

export function getTicketScopeWhere(user: { id: string; perfil: Perfil }): Prisma.TicketWhereInput {
  if (user.perfil === "ATENDENTE") {
    return { OR: [{ criadoPorId: user.id }, { atualizadoPorId: user.id }, { responsavelId: user.id }] };
  }

  return {};
}
