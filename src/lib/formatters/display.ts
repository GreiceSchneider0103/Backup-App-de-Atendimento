const LABEL_MAP: Record<string, string> = {
  MERCADO_LIVRE: "Mercado Livre",
  SITE_PROPRIO: "Site próprio",
  AGUARDANDO_CLIENTE: "Aguardando cliente",
  AGUARDANDO_DEVOLUCAO: "Aguardando devolução",
  AGUARDANDO_ASSISTENCIA: "Aguardando assistência",
  AGUARDANDO_MARKETPLACE: "Aguardando marketplace",
  NAO_AFETANDO: "Não afetando",
  DEFEITO_FABRICACAO: "Defeito de fabricação",
  PRODUTO_INCORRETO: "Produto incorreto",
  FALTANDO_ITENS: "Faltando itens",
  PRODUTO_DANIFICADO: "Produto danificado",
  NO_PRAZO: "No prazo",
  PROXIMO_VENCIMENTO: "Próximo do vencimento",
  ATRASADO: "Atrasado",
  ASSISTENCIA: "Assistência",
  DEVOLUCAO: "Devolução",
  REEMBOLSO: "Reembolso",
  RESOLVIDO: "Resolvido",
  CONCLUIDO: "Concluído",
  ABERTO: "Aberto",
  AFETANDO: "Afetando",
  REMOVIDA: "Removida",
  DESISTENCIA: "Desistência",
  PROBLEMA: "Problema",
  LESSUL: "Lessul",
  MS_DECOR: "MS Decor",
  VIVA_VIDA: "Viva Vida",
  MOVELBENTO: "Movelbento",
  MODIFIKA: "Modifika",
  CREATE: "Criação",
  UPDATE: "Atualização",
  STATUS_CHANGE: "Alteração de status",
  SOFT_DELETE: "Exclusão lógica",
  ticket: "Ticket",
  nomeCliente: "Nome do cliente",
  dataCompra: "Data da compra",
  numeroVenda: "Número da venda",
  linkPedido: "Link do pedido",
  uf: "UF",
  cpf: "CPF",
  canalMarketplace: "Canal / Marketplace",
  empresa: "Empresa",
  produto: "Produto",
  sku: "SKU",
  fabricante: "Fabricante",
  transportadora: "Transportadora",
  statusReclamacao: "Status da reclamação",
  dataReclamacao: "Data da reclamação",
  motivo: "Motivo",
  detalhesCliente: "Detalhes do cliente",
  comentarioInterno: "Comentário interno",
  resolucao: "Resolução",
  valorReembolso: "Valor de reembolso",
  valorColeta: "Valor de coleta, envio ou peças",
  custosTotais: "Custos totais",
  statusTicket: "Status do ticket",
  prazoConclusao: "Prazo de conclusão",
  responsavelId: "Responsável",
  slaStatus: "SLA"
};

export function formatEnumLabel(value?: string | null): string {
  if (!value) return "-";
  const key = String(value).trim();
  if (!key) return "-";
  if (LABEL_MAP[key]) return LABEL_MAP[key];
  return key
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/(^|\s)\p{L}/gu, (char) => char.toUpperCase());
}

export function formatDateBR(value?: string | Date | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatDateTimeBR(value?: string | Date | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export function formatCurrencyBR(value?: number | string | null): string {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(amount) ? amount : 0);
}
