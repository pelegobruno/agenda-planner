import { NextResponse } from "next/server";

/**
 * Rota de teste da agenda
 * Corrige erro: "route.ts não é um módulo"
 */
export async function GET() {
  return NextResponse.json([]);
}
