import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { logError } from "@/lib/logger";

export async function withApiHandler<T>(handler: () => Promise<T>) {
  try {
    const result = await handler();
    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Payload inválido", issues: error.issues },
        { status: 422 }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ message: "Serviço temporariamente indisponível", code: "SERVICE_UNAVAILABLE" }, { status: 503 });
    }

    logError("Unhandled API error", { error: String(error) });
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
