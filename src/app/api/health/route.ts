import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function hasRuntimeEnv() {
  return Boolean(process.env.DATABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function GET() {
  const runtimeEnvConfigured = hasRuntimeEnv();

  let databaseReachable = false;
  let databaseError: string | null = null;

  if (runtimeEnvConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseReachable = true;
    } catch (error) {
      databaseError = error instanceof Error ? error.message : "Falha desconhecida ao conectar no banco";
    }
  }

  return NextResponse.json(
    {
      status: databaseReachable || !runtimeEnvConfigured ? "ok" : "degraded",
      service: "lessul-go-atendimento",
      runtimeEnvConfigured,
      directUrlConfigured: Boolean(process.env.DIRECT_URL),
      databaseReachable,
      databaseError,
      timestamp: new Date().toISOString()
    },
    { status: databaseReachable || !runtimeEnvConfigured ? 200 : 503 }
  );
}
