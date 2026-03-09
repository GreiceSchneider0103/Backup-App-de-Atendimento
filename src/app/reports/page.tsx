import Link from "next/link";

export default function ReportsPage() {
  return (
    <section className="grid">
      <h1>Relatórios</h1>
      <div className="card" style={{ display: "flex", gap: 8 }}>
        <Link href="/api/reports/export?format=csv">Exportar CSV</Link>
        <Link href="/api/reports/export?format=xlsx">Exportar XLSX</Link>
      </div>
    </section>
  );
}
