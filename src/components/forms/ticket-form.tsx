"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CANAIS_MARKETPLACE, EMPRESAS, MOTIVOS, RESOLUCOES, STATUS_RECLAMACAO, STATUS_TICKET } from "@/config/domains";
import { formatEnumLabel } from "@/lib/formatters/display";
import { TicketFormInput, ticketFormSchema } from "@/lib/validation/ticket";

type AssignableUser = { id: string; nome: string };

type TicketFormProps = {
  ticketId?: string;
  initialValues?: Partial<TicketFormInput>;
  canEditSensitive?: boolean;
  assignableUsers?: AssignableUser[];
  cancelHref?: "/tickets" | `/tickets/${string}`;
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function fieldError(errors: Record<string, { message?: string }>, key: string) {
  return errors[key]?.message;
}

export function TicketForm({ ticketId, initialValues, canEditSensitive = true, assignableUsers = [], cancelHref }: TicketFormProps) {
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
      canalMarketplace: initialValues?.canalMarketplace ?? "MERCADO_LIVRE",
      empresa: initialValues?.empresa ?? "LESSUL",
      produto: initialValues?.produto ?? "",
      sku: initialValues?.sku ?? "",
      fabricante: initialValues?.fabricante ?? "",
      transportadora: initialValues?.transportadora ?? "",
      statusReclamacao: initialValues?.statusReclamacao ?? "AFETANDO",
      dataReclamacao: toDateInput(initialValues?.dataReclamacao),
      motivo: initialValues?.motivo ?? "DESISTENCIA",
      detalhesCliente: initialValues?.detalhesCliente ?? "",
      comentarioInterno: initialValues?.comentarioInterno ?? "",
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
      comentarioInterno: values.comentarioInterno || "",
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
      const issueMessage = Array.isArray(body?.issues)
        ? body.issues.map((issue: { path?: string[]; message?: string }) => `${issue.path?.join(".") ?? "campo"}: ${issue.message ?? "inválido"}`).join(" | ")
        : null;

      setRequestError(issueMessage ?? body.message ?? "Falha ao salvar ticket");
      return;
    }

    router.push("/tickets");
    router.refresh();
  }

  const typedErrors = errors as unknown as Record<string, { message?: string }>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="panel form-grid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
      <label>
        Nome do cliente
        <input {...register("nomeCliente")} placeholder="Nome do cliente" />
      </label>

      <label>
        Número da venda
        <input {...register("numeroVenda")} placeholder="Número da venda" />
      </label>

      <label>
        Data da compra
        <input {...register("dataCompra")} type="date" />
      </label>

      <label>
        Data da reclamação
        <input {...register("dataReclamacao")} type="date" />
      </label>

      <label>
        Prazo de conclusão
        <input {...register("prazoConclusao")} type="date" disabled={!canEditSensitive} />
      </label>

      <label>
        UF
        <input {...register("uf")} placeholder="UF" maxLength={2} />
      </label>

      <label>
        CPF
        <input {...register("cpf")} placeholder="CPF" />
      </label>

      <label>
        Canal / Marketplace
        <select {...register("canalMarketplace")}>
          {CANAIS_MARKETPLACE.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}
        </select>
      </label>

      <label>
        Empresa
        <select {...register("empresa")}>{EMPRESAS.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}</select>
      </label>

      <label>
        Produto
        <input {...register("produto")} placeholder="Produto" />
      </label>

      <label>
        SKU
        <input {...register("sku")} placeholder="SKU" />
      </label>

      <label>
        Fabricante
        <input {...register("fabricante")} placeholder="Fabricante" />
      </label>

      <label>
        Transportadora
        <input {...register("transportadora")} placeholder="Transportadora" />
      </label>

      <label>
        Link do pedido
        <input {...register("linkPedido")} placeholder="https://..." />
      </label>

      <label>
        Responsável
        <select {...register("responsavelId")}>
          <option value="">Não atribuído</option>
          {assignableUsers.map((user) => <option key={user.id} value={user.id}>{user.nome}</option>)}
        </select>
      </label>

      <label>
        Status da reclamação
        <select {...register("statusReclamacao")}>{STATUS_RECLAMACAO.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}</select>
      </label>

      <label>
        Motivo
        <select {...register("motivo")}>{MOTIVOS.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}</select>
      </label>

      <label>
        Resolução
        <select {...register("resolucao")} disabled={!canEditSensitive}>
          <option value="">Sem resolução</option>
          {RESOLUCOES.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}
        </select>
      </label>

      <label>
        Status do ticket
        <select {...register("statusTicket")}>{STATUS_TICKET.map((item) => <option key={item} value={item}>{formatEnumLabel(item)}</option>)}</select>
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        Detalhes do cliente
        <textarea {...register("detalhesCliente")} placeholder="Detalhes do cliente" />
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        Comentário interno
        <textarea {...register("comentarioInterno")} placeholder="Observações internas para acompanhamento do ticket" />
      </label>

      <label>
        Valor de reembolso
        <input {...register("valorReembolso", { valueAsNumber: true })} type="number" step="0.01" placeholder="Valor reembolso" disabled={!canEditSensitive} />
      </label>

      <label>
        Valor de coleta, envio ou peças
        <input {...register("valorColeta", { valueAsNumber: true })} type="number" step="0.01" placeholder="Valor coleta, envio ou peças" disabled={!canEditSensitive} />
      </label>

      {!canEditSensitive ? <p className="muted" style={{ gridColumn: "1 / -1" }}>Seu perfil não pode editar campos sensíveis (reembolso, coleta, prazo e resolução).</p> : null}

      {Object.keys(errors).length > 0 ? (
        <p style={{ color: "#b91c1c", gridColumn: "1 / -1" }}>
          {Object.keys(typedErrors).map((key) => fieldError(typedErrors, key)).filter(Boolean).join(" | ")}
        </p>
      ) : null}

      {requestError ? (
        <p style={{ color: "#b91c1c", gridColumn: "1 / -1" }}>{requestError}</p>
      ) : null}

      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {cancelHref ? <button type="button" className="btn btn-secondary" onClick={() => router.push(cancelHref)}>Cancelar</button> : null}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
