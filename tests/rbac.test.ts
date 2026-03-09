import { describe, expect, it } from "vitest";
import { hasPermission } from "../src/lib/rbac/permissions";

describe("rbac", () => {
  it("atendente não pode exportar relatório", () => {
    expect(hasPermission("ATENDENTE", "reports.export")).toBe(false);
  });

  it("supervisor pode editar campos sensíveis", () => {
    expect(hasPermission("SUPERVISOR", "ticket.update_sensitive")).toBe(true);
  });
});
