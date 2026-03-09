"use client";

import Link from "next/link";
import { useState } from "react";
import { STATUS_TICKET } from "@/config/domains";
import { StatusBadge } from "@/components/ui/status-badge";

const toneByStatus: Record<string, string> = {
  ABERTO: "#3b82f6",
  AGUARDANDO_CLIENTE: "#eab308",
  AGUARDANDO_DEVOLUCAO: "#f97316",
  AGUARDANDO_ASSISTENCIA: "#a855f7",
  AGUARDANDO_MARKETPLACE: "#ec4899",
  CONCLUIDO: "#16a34a"
};

export function KanbanBoard({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(Array.isArray(initialItems) ? initialItems : []);
  const [error, setError] = useState<string | null>(null);

  async function move(ticketId: string, statusTicket: string) {
    setError(null);
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusTicket })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.message ?? "Falha ao atualizar ticket no kanban");
      return;
    }

    setItems((prev) => prev.map((item) => (item.id === ticketId ? { ...item, statusTicket } : item)));
  }

  return (
    <div className="grid">
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", gap: 12, minWidth: 1260 }}>
          {STATUS_TICKET.map((status) => {
            const columnItems = items.filter((ticket: any) => ticket.statusTicket === status);
            return (
              <div key={status} style={{ width: 300, background: "#f8fafc", borderRadius: 12 }}>
                <div style={{ background: toneByStatus[status] ?? "#64748b", color: "#fff", padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                  <strong>{status}</strong>
                  <div style={{ opacity: 0.9, marginTop: 4 }}>{columnItems.length} tickets</div>
                </div>

                <div style={{ padding: 12, minHeight: 420, display: "grid", gap: 10 }}>
                  {columnItems.length === 0 ? <div className="empty-state">Nenhum ticket nesta coluna</div> : null}
                  {columnItems.map((ticket: any) => (
                    <article key={ticket.id} className="card" style={{ margin: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>{ticket.id.slice(0, 8)}</strong>
                        <Link href={`/tickets/${ticket.id}`}>Ver</Link>
                      </div>
                      <p style={{ margin: "8px 0", fontWeight: 600 }}>{ticket.nomeCliente}</p>
                      <p className="muted">{ticket.canalMarketplace}</p>
                      <p className="muted">{ticket.empresa}</p>
                      <p style={{ marginTop: 8 }}><StatusBadge value={ticket.slaStatus ?? "NO_PRAZO"} /></p>
                      <p style={{ marginTop: 8, fontWeight: 700 }}>R$ {Number(ticket.custosTotais).toFixed(2)}</p>
                      <select defaultValue={ticket.statusTicket} onChange={(e) => move(ticket.id, e.target.value)}>
                        {STATUS_TICKET.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
