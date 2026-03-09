"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EMPRESAS, MOTIVOS, RESOLUCOES, STATUS_RECLAMACAO, STATUS_TICKET } from "@/config/domains";

type TicketFormProps = {
  ticketId?: string;
  initialValues?: Record<string, string | number | null>;
};

export function TicketForm({ ticketId, initialValues }: TicketFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = {
      nomeCliente: String(formData.get("nomeCliente")),
      dataCompra: new Date(String(formData.get("dataCompra"))).toISOString(),
      numeroVenda: String(formData.get("numeroVenda")),
      linkPedido: String(formData.get("linkPedido") || ""),
      uf: String(formData.get("uf")).toUpperCase(),
      cpf: String(formData.get("cpf")),
      canalMarketplace: String(formData.get("canalMarketplace")),
      empresa: String(formData.get("empresa")),
      produto: String(formData.get("produto")),
      sku: String(formData.get("sku")),
      fabricante: String(formData.get("fabricante") || ""),
      transportadora: String(formData.get("transportadora") || ""),
      statusReclamacao: String(formData.get("statusReclamacao")),
      dataReclamacao: new Date(String(formData.get("dataReclamacao"))).toISOString(),
      motivo: String(formData.get("motivo")),
      detalhesCliente: String(formData.get("detalhesCliente") || ""),
      resolucao: formData.get("resolucao") ? String(formData.get("resolucao")) : null,
      valorReembolso: Number(formData.get("valorReembolso") ?? 0),
      valorColeta: Number(formData.get("valorColeta") ?? 0),
      statusTicket: String(formData.get("statusTicket")),
      prazoConclusao: formData.get("prazoConclusao")
        ? new Date(String(formData.get("prazoConclusao"))).toISOString()
        : null,
      responsavelId: formData.get("responsavelId") ? String(formData.get("responsavelId")) : null
    };

    const response = await fetch(ticketId ? `/api/tickets/${ticketId}` : "/api/tickets", {
      method: ticketId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: "Erro desconhecido" }));
      setError(body.message ?? "Falha ao salvar ticket");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/tickets");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid card" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
      <input name="nomeCliente" defaultValue={String(initialValues?.nomeCliente ?? "")} placeholder="Nome do cliente" required />
      <input name="numeroVenda" defaultValue={String(initialValues?.numeroVenda ?? "")} placeholder="Número da venda" required />
      <input name="dataCompra" type="date" required />
      <input name="dataReclamacao" type="date" required />
      <input name="uf" placeholder="UF" required maxLength={2} defaultValue={String(initialValues?.uf ?? "")} />
      <input name="cpf" placeholder="CPF" required defaultValue={String(initialValues?.cpf ?? "")} />
      <input name="canalMarketplace" placeholder="Marketplace" required defaultValue={String(initialValues?.canalMarketplace ?? "")} />
      <select name="empresa" required>{EMPRESAS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <input name="produto" placeholder="Produto" required defaultValue={String(initialValues?.produto ?? "")} />
      <input name="sku" placeholder="SKU" required defaultValue={String(initialValues?.sku ?? "")} />
      <input name="fabricante" placeholder="Fabricante" defaultValue={String(initialValues?.fabricante ?? "")} />
      <input name="transportadora" placeholder="Transportadora" defaultValue={String(initialValues?.transportadora ?? "")} />
      <input name="linkPedido" placeholder="Link do pedido" defaultValue={String(initialValues?.linkPedido ?? "")} />
      <input name="responsavelId" placeholder="ID do responsável" defaultValue={String(initialValues?.responsavelId ?? "")} />
      <select name="statusReclamacao" required>{STATUS_RECLAMACAO.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select name="motivo" required>{MOTIVOS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select name="resolucao"><option value="">Sem resolução</option>{RESOLUCOES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select name="statusTicket" required>{STATUS_TICKET.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <input name="prazoConclusao" type="date" />
      <textarea name="detalhesCliente" placeholder="Detalhes do cliente" defaultValue={String(initialValues?.detalhesCliente ?? "")} />
      <input name="valorReembolso" type="number" step="0.01" placeholder="Valor reembolso" defaultValue={String(initialValues?.valorReembolso ?? 0)} />
      <input name="valorColeta" type="number" step="0.01" placeholder="Valor coleta" defaultValue={String(initialValues?.valorColeta ?? 0)} />
      {error ? <p style={{ color: "#b91c1c", gridColumn: "1 / -1" }}>{error}</p> : null}
      <button type="submit" disabled={loading} style={{ gridColumn: "1 / -1" }}>{loading ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
