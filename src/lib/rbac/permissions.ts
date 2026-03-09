import { Perfil } from "@prisma/client";

export type Permission =
  | "ticket.create"
  | "ticket.update"
  | "ticket.update_sensitive"
  | "ticket.soft_delete"
  | "user.manage"
  | "reports.full"
  | "audit.read";

const matrix: Record<Perfil, Permission[]> = {
  ATENDENTE: ["ticket.create", "ticket.update"],
  SUPERVISOR: ["ticket.create", "ticket.update", "ticket.update_sensitive", "reports.full"],
  ADMIN: [
    "ticket.create",
    "ticket.update",
    "ticket.update_sensitive",
    "ticket.soft_delete",
    "user.manage",
    "reports.full",
    "audit.read"
  ]
};

export function hasPermission(perfil: Perfil, permission: Permission): boolean {
  return matrix[perfil].includes(permission);
}
