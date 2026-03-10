"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrencyBR, formatEnumLabel } from "@/lib/formatters/display";

const palette = ["#2563eb", "#0ea5e9", "#14b8a6", "#84cc16", "#f59e0b", "#f97316", "#8b5cf6", "#ec4899"];

function formatChartData(items: Array<{ name: string; value: number }>) {
  return items.map((item) => ({ ...item, label: formatEnumLabel(item.name) }));
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="card" style={{ minHeight: 320, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      <div style={{ flex: 1, minHeight: 260 }}>{children}</div>
    </article>
  );
}

export function DashboardCharts({ charts }: { charts: Record<string, Array<{ name: string; value: number }>> }) {
  const porEmpresa = formatChartData(charts.porEmpresa ?? []);
  const porStatus = formatChartData(charts.porStatus ?? []);
  const porMotivo = formatChartData(charts.porMotivo ?? []);
  const porMarketplace = formatChartData(charts.porMarketplace ?? []);

  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }}>
      <ChartCard title="Reclamações por empresa">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={porEmpresa} margin={{ top: 8, right: 8, left: -14, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#475569" }} interval={0} angle={-12} height={40} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <Tooltip formatter={(value: number) => [value, "Tickets"]} />
            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tickets por status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={porStatus} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} innerRadius={44} paddingAngle={2}>
              {porStatus.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={palette[index % palette.length]} />)}
            </Pie>
            <Tooltip formatter={(value: number, _name, item) => [value, item?.payload?.label ?? "Status"]} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Reclamações por motivo">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={porMotivo} margin={{ top: 8, right: 8, left: -14, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#475569" }} interval={0} angle={-12} height={44} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <Tooltip formatter={(value: number) => [value, "Tickets"]} />
            <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Reclamações por marketplace">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={porMarketplace} margin={{ top: 8, right: 8, left: -14, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#475569" }} interval={0} angle={-12} height={44} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <Tooltip formatter={(value: number) => [value, "Tickets"]} />
            <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Custos por marketplace">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatChartData(charts.custosPorMarketplace ?? [])} margin={{ top: 8, right: 8, left: -14, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#475569" }} interval={0} angle={-12} height={44} />
            <YAxis tick={{ fontSize: 12, fill: "#475569" }} tickFormatter={(value) => `R$ ${value}`} />
            <Tooltip formatter={(value: number) => [formatCurrencyBR(value), "Custos"]} />
            <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tickets por mês">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.ticketsPorMes ?? []} margin={{ top: 8, right: 8, left: -14, bottom: 14 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <Tooltip formatter={(value: number) => [value, "Tickets"]} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
