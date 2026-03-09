import clsx from "clsx";

function getTone(value: string) {
  const normalized = value.toUpperCase();
  if (["CONCLUIDO", "SYNCED", "NO_PRAZO", "ADMIN"].includes(normalized)) return "success";
  if (["FAILED", "ATRASADO", "INATIVO"].includes(normalized)) return "danger";
  if (["PENDING", "AGUARDANDO_CLIENTE", "AGUARDANDO_DEVOLUCAO", "AGUARDANDO_ASSISTENCIA", "AGUARDANDO_MARKETPLACE"].includes(normalized)) return "warning";
  return "info";
}

export function StatusBadge({ value }: { value: string }) {
  const tone = getTone(value);
  return <span className={clsx("badge", `badge-${tone}`)}>{value}</span>;
}
