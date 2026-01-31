export type Treinamento = {
  id: string;
  data: string; // yyyy-mm-dd
  titulo: string;
  descricao?: string;
};

const KEY = "treinamentos";

export function getTreinamentos(): Treinamento[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Treinamento[];
  } catch {
    return [];
  }
}

export function salvarTreinamentos(lista: Treinamento[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(lista));
}
