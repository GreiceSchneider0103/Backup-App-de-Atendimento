"use client";

import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardCharts({ charts }: { charts: Record<string, Array<{ name: string; value: number }>> }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
      <article className="card" style={{ height: 280 }}>
        <h3>Reclamações por empresa</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.porEmpresa ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" /></BarChart>
        </ResponsiveContainer>
      </article>

      <article className="card" style={{ height: 280 }}>
        <h3>Tickets por status</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart><Pie data={charts.porStatus ?? []} dataKey="value" nameKey="name" /><Tooltip /></PieChart>
        </ResponsiveContainer>
      </article>

      <article className="card" style={{ height: 280 }}>
        <h3>Reclamações por motivo</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.porMotivo ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" /></BarChart>
        </ResponsiveContainer>
      </article>

      <article className="card" style={{ height: 280 }}>
        <h3>Reclamações por marketplace</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.porMarketplace ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" /></BarChart>
        </ResponsiveContainer>
      </article>

      <article className="card" style={{ height: 280 }}>
        <h3>Custos por marketplace</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.custosPorMarketplace ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" /></BarChart>
        </ResponsiveContainer>
      </article>

      <article className="card" style={{ height: 280 }}>
        <h3>Custos por produto</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.custosPorProduto ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" /></BarChart>
        </ResponsiveContainer>
      </article>

      <article className="card" style={{ height: 280 }}>
        <h3>Reembolsos por empresa</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.reembolsosPorEmpresa ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" /></BarChart>
        </ResponsiveContainer>
      </article>

      <article className="card" style={{ height: 280 }}>
        <h3>Tickets por mês</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.ticketsPorMes ?? []}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" /></BarChart>
        </ResponsiveContainer>
      </article>
    </div>
  );
}
