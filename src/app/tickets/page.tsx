import Link from "next/link";
import { calculateSla } from "@/lib/utils/sla";

async function getTickets(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => value && params.set(key, value));
  const response = await fetch(`${process.env.APP_BASE_URL ?? "http://localhost:3000"}/api/tickets?${params.toString()}`, {
    cache: "no-store"
  });
  return response.json();
}

export default async function TicketsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const data = await getTickets(query);

  return (
    <section className="grid">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Lista de tickets</h1>
        <Link href="/tickets/new">Criar ticket</Link>
      </div>

      <form className="card" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8 }}>
        <input name="search" placeholder="Busca" defaultValue={query.search} />
        <input name="canalMarketplace" placeholder="Marketplace" defaultValue={query.canalMarketplace} />
        <input name="responsavelId" placeholder="Responsável (id)" defaultValue={query.responsavelId} />
        <select name="orderBy" defaultValue={query.orderBy ?? "criadoEm"}>
          <option value="criadoEm">Criado em</option>
          <option value="dataReclamacao">Data reclamação</option>
          <option value="custosTotais">Custos</option>
          <option value="prazoConclusao">Prazo</option>
        </select>
        <button type="submit">Aplicar filtros</button>
      </form>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr><th>Cliente</th><th>Marketplace</th><th>Empresa</th><th>Motivo</th><th>Status</th><th>Prazo</th><th>SLA</th><th>Custo</th></tr>
          </thead>
          <tbody>
            {data.items?.map((item: any) => (
              <tr key={item.id}>
                <td><Link href={`/tickets/${item.id}`}>{item.nomeCliente}</Link></td>
                <td>{item.canalMarketplace}</td>
                <td>{item.empresa}</td>
                <td>{item.motivo}</td>
                <td>{item.statusTicket}</td>
                <td>{item.prazoConclusao ? new Date(item.prazoConclusao).toLocaleDateString("pt-BR") : "-"}</td>
                <td>{calculateSla(item.statusTicket, item.prazoConclusao ? new Date(item.prazoConclusao) : null)}</td>
                <td>{Number(item.custosTotais).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
