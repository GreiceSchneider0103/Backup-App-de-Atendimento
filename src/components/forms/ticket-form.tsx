"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TicketForm({ ticketId }: { ticketId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const payload = {
      nomeCliente: String(formData.get("nomeCliente")),
      dataCompra: new Date().toISOString(),
      numeroVenda: String(formData.get("numeroVenda")),
      uf: String(formData.get("uf")),
      cpf: String(formData.get("cpf")),
      canalMarketplace: String(formData.get("canalMarketplace")),
      empresa: String(formData.get("empresa")),
      produto: String(formData.get("produto")),
      sku: String(formData.get("sku")),
      statusReclamacao: String(formData.get("statusReclamacao")),
      dataReclamacao: new Date().toISOString(),
      motivo: String(formData.get("motivo")),
      valorReembolso: Number(formData.get("valorReembolso") ?? 0),
      valorColeta: Number(formData.get("valorColeta") ?? 0),
      statusTicket: String(formData.get("statusTicket"))
    };

    await fetch(ticketId ? `/api/tickets/${ticketId}` : "/api/tickets", {
      method: ticketId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    router.push("/tickets");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid card">
      <input name="nomeCliente" placeholder="Nome do cliente" required />
      <input name="numeroVenda" placeholder="Número da venda" required />
      <input name="uf" placeholder="UF" required maxLength={2} />
      <input name="cpf" placeholder="CPF" required />
      <input name="canalMarketplace" placeholder="Marketplace" required />
      <input name="produto" placeholder="Produto" required />
      <input name="sku" placeholder="SKU" required />
      <select name="empresa" required><option value="LESSUL">LESSUL</option><option value="MS_DECOR">MS DECOR</option></select>
      <select name="statusReclamacao" required><option value="AFETANDO">AFETANDO</option><option value="NAO_AFETANDO">NÃO AFETANDO</option></select>
      <select name="motivo" required><option value="DESISTENCIA">DESISTÊNCIA</option><option value="PROBLEMA">PROBLEMA</option></select>
      <select name="statusTicket" required><option value="ABERTO">ABERTO</option><option value="CONCLUIDO">CONCLUÍDO</option></select>
      <input name="valorReembolso" type="number" step="0.01" placeholder="Valor reembolso" />
      <input name="valorColeta" type="number" step="0.01" placeholder="Valor coleta" />
      <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
