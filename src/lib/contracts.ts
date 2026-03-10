import { Ticket, Usuario } from "@prisma/client";

export type TicketListResponse = {
  data: Ticket[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
  meta: { orderBy: string; orderDir: string };
};

export type ReportsResponse = {
  items: Ticket[];
  totals: {
    totalTickets: number;
    totalCustos: number;
    totalReembolso: number;
    totalColeta: number;
  };
  meta: {
    limit: number;
    returned: number;
    totalAvailable: number;
    truncated: boolean;
  };
};

export type UsersListResponse = {
  data: Usuario[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
  meta: { resource: "users" };
};
