import { NextResponse } from "next/server";

// Simulação de banco de dados (Substitua pela lógica do seu Banco real)
let treinamentosGerais = []; 

export async function GET() {
  return NextResponse.json(treinamentosGerais);
}

export async function POST(request) {
  const corpo = await request.json();
  // Se for edição (já tem ID), atualiza. Se não, cria novo.
  const index = treinamentosGerais.findIndex(t => t.id === corpo.id);
  
  if (index !== -1) {
    treinamentosGerais[index] = corpo;
  } else {
    treinamentosGerais.push(corpo);
  }
  
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  treinamentosGerais = treinamentosGerais.filter(t => t.id !== id);
  return NextResponse.json({ success: true });
}