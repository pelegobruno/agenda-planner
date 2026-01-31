export type Treinamento = {
  id: string;
  data: string; // yyyy-mm-dd
  titulo: string;
  descricao?: string;
};

export const treinamentos: Treinamento[] = [
  {
    id: "t1",
    data: "2026-02-10",
    titulo: "CAPACITAÇÃO DA EQUIPE",
    descricao: "Treinamento interno – atendimento suspenso",
  },
];
