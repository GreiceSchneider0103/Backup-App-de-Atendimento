import Link from "next/link";
import { calculateSla } from "@/lib/utils/sla";

async function getTickets() {
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/tickets`, { cache: "no-store" });
  return response.json();
}

export default async function TicketsPage() {
  const data = await getTickets();

  return (
    <section className="grid">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Lista de tickets</h1>
        <Link href="/tickets/new">Criar ticket</Link>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Cliente</th><th>Marketplace</th><th>Empresa</th><th>Motivo</th><th>Status</th><th>SLA</th></tr></thead>
          <tbody>
            {data.items.map((item: any) => (
              <tr key={item.id}>
                <td><Link href={`/tickets/${item.id}`}>{item.nomeCliente}</Link></td>
                <td>{item.canalMarketplace}</td>
                <td>{item.empresa}</td>
                <td>{item.motivo}</td>
                <td>{item.statusTicket}</td>
                <td>{calculateSla(item.statusTicket, item.prazoConclusao ? new Date(item.prazoConclusao) : null)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
