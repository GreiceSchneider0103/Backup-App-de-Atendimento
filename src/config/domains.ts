export const EMPRESAS = ["LESSUL", "MS_DECOR", "VIVA_VIDA", "MOVELBENTO", "MODIFIKA"] as const;
export const STATUS_RECLAMACAO = ["AFETANDO", "NAO_AFETANDO", "REMOVIDA"] as const;
export const MOTIVOS = [
  "DESISTENCIA",
  "DEFEITO_FABRICACAO",
  "PRODUTO_INCORRETO",
  "FALTANDO_ITENS",
  "PRODUTO_DANIFICADO",
  "PROBLEMA"
] as const;
export const STATUS_TICKET = [
  "CONCLUIDO",
  "ABERTO",
  "AGUARDANDO_CLIENTE",
  "AGUARDANDO_DEVOLUCAO",
  "AGUARDANDO_ASSISTENCIA",
  "AGUARDANDO_MARKETPLACE"
] as const;
export const RESOLUCOES = ["ASSISTENCIA", "DEVOLUCAO", "REEMBOLSO", "RESOLVIDO"] as const;

export const CANAIS_MARKETPLACE = ["MERCADO_LIVRE", "MAGALU", "AMAZON", "SHOPEE", "SITE_PROPRIO", "OUTRO"] as const;

export type CanalMarketplace = typeof CANAIS_MARKETPLACE[number];

const CANAL_MARKETPLACE_LEGACY_MAP: Record<string, CanalMarketplace> = {
  "MERCADO LIVRE": "MERCADO_LIVRE",
  "MERCADO_LIVRE": "MERCADO_LIVRE",
  MAGALU: "MAGALU",
  AMAZON: "AMAZON",
  SHOPEE: "SHOPEE",
  "SITE PROPRIO": "SITE_PROPRIO",
  SITE_PROPRIO: "SITE_PROPRIO",
  OUTRO: "OUTRO"
};

export function normalizeCanalMarketplace(value?: string | null): CanalMarketplace | undefined {
  if (!value) return undefined;
  const key = value.trim().toUpperCase();
  return CANAL_MARKETPLACE_LEGACY_MAP[key];
}

export function canalMarketplaceLabel(value: string): string {
  return value.replaceAll("_", " ");
}
