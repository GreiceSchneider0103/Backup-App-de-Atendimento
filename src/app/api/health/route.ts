import { NextResponse } from "next/server";

function hasRuntimeEnv() {
  return Boolean(process.env.DATABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "lessul-go-atendimento",
      runtimeEnvConfigured: hasRuntimeEnv(),
      directUrlConfigured: Boolean(process.env.DIRECT_URL),
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
