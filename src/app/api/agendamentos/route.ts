import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbziM2fRvfGt2neaHSXGgcX7o5aT452S5ld6vtEetRlh3u1LVTA2eD9BdGpJAicuPvFM/exec";

function extrairHora(valor: string) {
  // Ex: "Sat Dec 30 1899 07:15:00 GMT..."
  const match = valor.match(/(\d{2}:\d{2})/);
  return match ? match[1] : "";
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { cache: "no-store" });
    const raw = await res.json();

    if (!Array.isArray(raw)) return NextResponse.json([]);

    const normalizado = raw.map((item) => ({
      data: item.data,
      hora: extrairHora(item.hora),
      profissao: item.profissao,
      profissional: item.profissional,
      paciente: item.paciente,
    }));

    return NextResponse.json(normalizado);
  } catch {
    return NextResponse.json([]);
  }
}
