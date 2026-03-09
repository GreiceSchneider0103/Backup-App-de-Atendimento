import { describe, expect, it } from "vitest";
import { normalizeDatabaseUrl } from "@/lib/db/prisma";

describe("normalizeDatabaseUrl", () => {
  it("adds supabase pooler params when missing", () => {
    const url = "postgresql://user:pass@aws-1-us-east-1.pooler.supabase.com:5432/postgres";
    const normalized = normalizeDatabaseUrl(url);

    expect(normalized).toContain("pgbouncer=true");
    expect(normalized).toContain("connection_limit=1");
    expect(normalized).toContain("sslmode=require");
  });

  it("keeps non-pooler urls unchanged", () => {
    const url = "postgresql://user:pass@db.project.supabase.co:5432/postgres?sslmode=require";
    expect(normalizeDatabaseUrl(url)).toBe(url);
  });
});
