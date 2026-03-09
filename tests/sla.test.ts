import { describe, expect, it } from "vitest";
import { calculateSla } from "../src/lib/utils/sla";

describe("calculateSla", () => {
  it("retorna CONCLUIDO quando ticket concluído", () => {
    expect(calculateSla("CONCLUIDO", null)).toBe("CONCLUIDO");
  });
});
