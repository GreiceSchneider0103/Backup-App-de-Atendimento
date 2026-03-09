"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EMPRESAS, MOTIVOS, RESOLUCOES, STATUS_RECLAMACAO, STATUS_TICKET } from "@/config/domains";
import { TicketFormInput, ticketFormSchema } from "@/lib/validation/ticket";

type TicketFormProps = {
  ticketId?: string;
  initialValues?: Partial<TicketFormInput>;
  canEditSensitive?: boolean;
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function TicketForm({ ticketId, initialValues, canEditSensitive = true }: TicketFormProps) {
  const router = useRouter();
  const [requestError, setRequestError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TicketFormInput>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      nomeCliente: initialValues?.nomeCliente ?? "",
      dataCompra: toDateInput(initialValues?.dataCompra),
      numeroVenda: initialValues?.numeroVenda ?? "",
      linkPedido: initialValues?.linkPedido ?? "",
      uf: initialValues?.uf ?? "",
      cpf: initialValues?.cpf ?? "",
      canalMarketplace: initialValues?.canalMarketplace ?? "",
      empresa: initialValues?.empresa ?? "LESSUL",
      produto: initialValues?.produto ?? "",
      sku: initialValues?.sku ?? "",
      fabricante: initialValues?.fabricante ?? "",
      transportadora: initialValues?.transportadora ?? "",
      statusReclamacao: initialValues?.statusReclamacao ?? "AFETANDO",
      dataReclamacao: toDateInput(initialValues?.dataReclamacao),
      motivo: initialValues?.motivo ?? "DESISTENCIA",
      detalhesCliente: initialValues?.detalhesCliente ?? "",
      resolucao: initialValues?.resolucao ?? null,
      valorReembolso: Number(initialValues?.valorReembolso ?? 0),
      valorColeta: Number(initialValues?.valorColeta ?? 0),
      statusTicket: initialValues?.statusTicket ?? "ABERTO",
      prazoConclusao: toDateInput(initialValues?.prazoConclusao),
      responsavelId: initialValues?.responsavelId ?? null
    }
  });

  async function onSubmit(values: TicketFormInput) {
    setRequestError(null);

    const payload = {
      ...values,
      uf: values.uf.toUpperCase(),
      dataCompra: new Date(values.dataCompra).toISOString(),
      dataReclamacao: new Date(values.dataReclamacao).toISOString(),
      prazoConclusao: values.prazoConclusao ? new Date(values.prazoConclusao).toISOString() : null,
      linkPedido: values.linkPedido || "",
      fabricante: values.fabricante || "",
      transportadora: values.transportadora || "",
      detalhesCliente: values.detalhesCliente || "",
      responsavelId: values.responsavelId || null,
      resolucao: values.resolucao || null
    };

    const url = ticketId ? `/api/tickets/${ticketId}` : "/api/tickets";
    const method = ticketId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: "Erro desconhecido" }));
      setRequestError(body.message ?? "Falha ao salvar ticket");
      return;
    }

    router.push("/tickets");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="panel form-grid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
      <input {...register("nomeCliente")} placeholder="Nome do cliente" />
      <input {...register("numeroVenda")} placeholder="Número da venda" />
      <input {...register("dataCompra")} type="date" />
      <input {...register("dataReclamacao")} type="date" />
      <input {...register("uf")} placeholder="UF" maxLength={2} />
      <input {...register("cpf")} placeholder="CPF" />
      <input {...register("canalMarketplace")} placeholder="Marketplace" />
      <select {...register("empresa")}>{EMPRESAS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <input {...register("produto")} placeholder="Produto" />
      <input {...register("sku")} placeholder="SKU" />
      <input {...register("fabricante")} placeholder="Fabricante" />
      <input {...register("transportadora")} placeholder="Transportadora" />
      <input {...register("linkPedido")} placeholder="Link do pedido" />
      <input {...register("responsavelId")} placeholder="ID do responsável" />
      <select {...register("statusReclamacao")}>{STATUS_RECLAMACAO.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select {...register("motivo")}>{MOTIVOS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select {...register("resolucao")} disabled={!canEditSensitive}>
        <option value="">Sem resolução</option>
        {RESOLUCOES.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <select {...register("statusTicket")}>{STATUS_TICKET.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <input {...register("prazoConclusao")} type="date" disabled={!canEditSensitive} />
      <textarea {...register("detalhesCliente")} placeholder="Detalhes do cliente" />
      <input {...register("valorReembolso", { valueAsNumber: true })} type="number" step="0.01" placeholder="Valor reembolso" disabled={!canEditSensitive} />
      <input {...register("valorColeta", { valueAsNumber: true })} type="number" step="0.01" placeholder="Valor coleta" disabled={!canEditSensitive} />

      {!canEditSensitive ? <p className="muted" style={{ gridColumn: "1 / -1" }}>Seu perfil não pode editar campos sensíveis (reembolso, coleta, prazo e resolução).</p> : null}

      {(Object.keys(errors).length > 0 || requestError) ? (
        <p style={{ color: "#b91c1c", gridColumn: "1 / -1" }}>
          {requestError ?? "Verifique os campos obrigatórios e tente novamente."}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ gridColumn: "1 / -1" }}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
