import { requireCurrentUser } from "@/lib/auth/require-user";
import { assertPermission } from "@/lib/rbac/permissions";

function PlaceholderNotice({ text }: { text: string }) {
  return <p className="muted" style={{ marginTop: 8 }}>{text}</p>;
}

export default async function AdminPage() {
  const user = await requireCurrentUser();
  assertPermission(user.perfil, "user.manage");

  return (
    <section className="page">
      <div className="page-header">
        <h1>Administração</h1>
        <p className="muted">Configure parâmetros globais e integrações do sistema.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div className="grid">
          <article className="panel">
            <h2 style={{ marginTop: 0 }}>Configurações Gerais</h2>
            <div className="form-grid">
              <label>Nome da Empresa<input defaultValue="Tech Store Brasil" /></label>
              <label>E-mail de Suporte<input defaultValue="suporte@techstore.com.br" /></label>
              <label>Fuso Horário
                <select defaultValue="America/Sao_Paulo">
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/Manaus">Manaus (GMT-4)</option>
                </select>
              </label>
              <button className="btn btn-primary" type="button">Salvar Configurações</button>
            </div>
            <PlaceholderNotice text="Placeholder visual: endpoint de configuração global ainda não existe no backend." />
          </article>

          <article className="panel">
            <h2 style={{ marginTop: 0 }}>Parâmetros de SLA</h2>
            <div className="form-grid cols-4">
              <label>Prazo padrão (dias)<input type="number" defaultValue={7} /></label>
              <label>Alerta de SLA próximo (dias)<input type="number" defaultValue={2} /></label>
              <label>Tipo de prazo
                <select defaultValue="uteis"><option value="uteis">Dias úteis</option><option value="corridos">Dias corridos</option></select>
              </label>
            </div>
            <button className="btn btn-primary" type="button" style={{ marginTop: 10 }}>Salvar SLA</button>
            <PlaceholderNotice text="Placeholder visual: persistência de SLA ainda não implementada no backend." />
          </article>
        </div>

        <div className="grid">
          <article className="panel">
            <h3 style={{ marginTop: 0 }}>Informações do Sistema</h3>
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Ambiente:</strong> {process.env.NODE_ENV ?? "desconhecido"}</p>
          </article>

          <article className="panel">
            <h3 style={{ marginTop: 0 }}>Ações Rápidas</h3>
            <div className="grid">
              <button className="btn btn-secondary" type="button">Backup de Dados</button>
              <button className="btn btn-secondary" type="button">Logs de Auditoria</button>
              <button className="btn btn-secondary" type="button">Teste de E-mail</button>
            </div>
            <PlaceholderNotice text="Placeholders visuais seguros até criação de rotas dedicadas para essas ações." />
          </article>
        </div>
      </div>
    </section>
  );
}
