"use client";

import { useState } from "react";
import { STATUS_TICKET } from "@/config/domains";

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
        {STATUS_TICKET.map((status) => (
          <div className="card" key={status}>
            <h3>{status}</h3>
            {items
              .filter((ticket: any) => ticket.statusTicket === status)
              .map((ticket: any) => (
                <article key={ticket.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 8, marginBottom: 8 }}>
                  <strong>{ticket.nomeCliente}</strong>
                  <p>{ticket.canalMarketplace} • {ticket.empresa}</p>
                  <select defaultValue={ticket.statusTicket} onChange={(e) => move(ticket.id, e.target.value)}>
                    {STATUS_TICKET.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </article>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
