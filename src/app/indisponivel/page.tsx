import Link from "next/link";

export const dynamic = "force-dynamic";

export default function IndisponivelPage() {
  return (
    <section className="card" style={{ width: "100%", maxWidth: 720 }}>
      <h1>Banco temporariamente indisponível</h1>
      <p className="muted">
        O aplicativo está no ar, mas a conexão com o banco de dados está indisponível no momento.
        Isso normalmente ocorre por allow-list/rede/SSL do provedor PostgreSQL.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <Link href="/api/health" className="btn btn-secondary">Ver health check</Link>
        <Link href="/login" className="btn btn-primary">Tentar login novamente</Link>
      </div>
    </section>
  );
}
