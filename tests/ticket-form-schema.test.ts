import { describe, expect, it } from "vitest";
import { ticketFormSchema, ticketSchema } from "@/lib/validation/ticket";

const basePayload = {
  nomeCliente: "Cliente Teste",
  dataCompra: "2026-01-10",
  numeroVenda: "VENDA-123",
  linkPedido: "",
  uf: "RS",
  cpf: "12345678901",
  canalMarketplace: "MERCADO_LIVRE",
  empresa: "LESSUL",
  produto: "Produto",
  sku: "SKU-1",
  fabricante: "",
  transportadora: "",
  statusReclamacao: "AFETANDO",
  dataReclamacao: "2026-01-11",
  motivo: "DESISTENCIA",
  detalhesCliente: "",
  valorReembolso: 0,
  valorColeta: 0,
  statusTicket: "CONCLUIDO",
  prazoConclusao: null,
  responsavelId: ""
} as const;

describe("ticketFormSchema", () => {
  it("accepts empty resolucao from select", () => {
    const result = ticketFormSchema.safeParse({ ...basePayload, resolucao: "" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid responsavelId", () => {
    const result = ticketFormSchema.safeParse({ ...basePayload, resolucao: null, responsavelId: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("ticketSchema", () => {
  it("normalizes legacy marketplace labels", () => {
    const result = ticketSchema.safeParse({ ...basePayload, canalMarketplace: "Mercado Livre", responsavelId: null, resolucao: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.canalMarketplace).toBe("MERCADO_LIVRE");
    }
  });
});
