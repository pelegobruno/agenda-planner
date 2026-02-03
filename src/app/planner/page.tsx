"use client";

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { formatarDataBR } from "@/lib/datas";
import { getTreinamentos, Treinamento } from "@/lib/treinamentosStorage";

/* =========================
   TIPOS
========================= */
type Agendamento = {
  data: string;
  hora: string;
  profissao: string;
  profissional: string;
  paciente: string;
};

type DiaPlanner = {
  dataISO: string;
  atendimentos: Agendamento[];
  treinamento?: Treinamento;
};

/* =========================
   UTILS
========================= */
function isoParaBR(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function limparNome(n: string) {
  return n.trim().toUpperCase();
}

function contemReuniao(texto: string) {
  return texto.toUpperCase().includes("REUNI");
}

function nomeNoAgendamento(nome: string, campo: string) {
  return campo
    .split("/")
    .map((n) => limparNome(n))
    .includes(limparNome(nome));
}

function pertenceAoMes(dataBR: string, mesISO: string) {
  const [, mes, ano] = dataBR.split("/");
  return `${ano}-${mes}` === mesISO;
}

function mesExtenso(mesISO: string) {
  const [ano, mes] = mesISO.split("-");
  const nomes = [
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro",
  ];
  return `${nomes[Number(mes) - 1]} / ${ano}`;
}

/* =========================
   LÓGICA DO CALENDÁRIO (AJUSTADA)
========================= */
function gerarCalendario(mes: string): DiaPlanner[][] {
  const [ano, mesNum] = mes.split("-").map(Number);
  
  // Pega o dia 1 do mês selecionado
  const cursor = new Date(ano, mesNum - 1, 1);

  // Avança até a primeira SEGUNDA-FEIRA do mês (getDay === 1)
  while (cursor.getDay() !== 1) {
    cursor.setDate(cursor.getDate() + 1);
  }

  const semanas: DiaPlanner[][] = [];

  // Gera exatamente 5 semanas
  for (let s = 0; s < 5; s++) {
    const semana: DiaPlanner[] = [];
    
    // Gera de Segunda a Sexta (5 dias)
    for (let d = 0; d < 5; d++) {
      semana.push({
        dataISO: cursor.toISOString().slice(0, 10),
        atendimentos: [],
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    
    semanas.push(semana);
    
    // Pula Sábado e Domingo para começar na próxima segunda
    cursor.setDate(cursor.getDate() + 2);
  }

  return semanas;
}

/* =========================
   COMPONENTE
========================= */
export default function Planner() {
  const [mes, setMes] = useState("2026-02");
  const [paciente, setPaciente] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [loading, setLoading] = useState(true);

  /* AGENDA (API) */
  useEffect(() => {
    setLoading(true);
    fetch("/api/agendamentos")
      .then((r) => r.json())
      .then((d) => setAgendamentos(Array.isArray(d) ? d : []))
      .catch(() => setAgendamentos([]))
      .finally(() => setLoading(false));
  }, []);

  /* TREINAMENTOS (LocalStorage Sincronizado) */
  useEffect(() => {
    setTreinamentos(getTreinamentos());

    const atualizar = () => {
      setTreinamentos(getTreinamentos());
    };

    window.addEventListener("storage", atualizar);
    return () => window.removeEventListener("storage", atualizar);
  }, []);

  /* PACIENTES ÚNICOS */
  const pacientesUnicos = useMemo(() => {
    const nomes = agendamentos
      .filter((a) => pertenceAoMes(a.data, mes))
      .flatMap((a) =>
        a.paciente
          .split("/")
          .map((n) => limparNome(n))
          .filter((n) => n && !contemReuniao(n))
      );

    return Array.from(new Set(nomes)).sort();
  }, [agendamentos, mes]);

  /* MONTAGEM DO CALENDÁRIO */
  const calendario = useMemo(() => {
    const cal = gerarCalendario(mes);

    cal.forEach((semana) =>
      semana.forEach((dia) => {
        const dataBR = isoParaBR(dia.dataISO);
        const treino = treinamentos.find((t) => t.data === dia.dataISO);
        dia.treinamento = treino;

        if (treino || !paciente) {
          dia.atendimentos = [];
          return;
        }

        dia.atendimentos = agendamentos
          .filter((a) => a.data === dataBR)
          .filter((a) => !contemReuniao(a.paciente))
          .filter((a) => nomeNoAgendamento(paciente, a.paciente))
          .sort((a, b) => a.hora.localeCompare(b.hora));
      })
    );

    return cal;
  }, [mes, paciente, agendamentos, treinamentos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-gray-700 rounded-full mx-auto" />
          <p className="text-sm text-gray-600">Carregando agenda mensal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planner-print p-6 space-y-4">
      {/* TOPO CONTROLES */}
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-xl font-bold uppercase">
          Planner Mensal de Atendimentos
        </h2>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Imprimir / PDF
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-4 print:hidden">
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={paciente}
          onChange={(e) => setPaciente(e.target.value)}
          className="border p-2 rounded w-[360px]"
        >
          <option value="">Selecione um paciente</option>
          {pacientesUnicos.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* CABEÇALHO IMPRESSÃO */}
      <div className="hidden print:flex justify-between items-center mb-2">
        <img src="/logo-esquerda.png" alt="Logo esquerda" style={{ height: 60 }} />

        <div className="text-center">
          <h1 className="font-bold uppercase text-sm">Planner Mensal</h1>
          <p className="text-xs"><strong>Nome:</strong> {paciente}</p>
          <p className="text-xs"><strong>Mês:</strong> {mesExtenso(mes)}</p>
        </div>

        <img src="/logo-direita.png" alt="Logo direita" style={{ height: 60 }} />
      </div>

      {/* GRADE DO PLANNER */}
      <div className="grid grid-cols-5 border border-black text-[10px]">
        {["Seg", "Ter", "Qua", "Qui", "Sex"].map((d) => (
          <div key={d} className="p-1 font-bold text-center bg-gray-100 border border-black uppercase">
            {d}
          </div>
        ))}

        {calendario.flat().map((dia, i) => {
          const bloqueado = Boolean(dia.treinamento);

          return (
            <div
              key={i}
              className={`relative border border-black p-1 min-h-[90px] ${
                bloqueado ? "bg-gray-200" : "bg-white"
              }`}
            >
              <div className="font-bold mb-1 text-black">
                {formatarDataBR(dia.dataISO)}
              </div>

              {bloqueado && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="rotate-[-30deg] text-gray-600 font-extrabold text-[18px] opacity-40 text-center px-2">
                    {dia.treinamento?.titulo}
                  </div>
                </div>
              )}

              {!bloqueado &&
                paciente &&
                dia.atendimentos.map((a, k) => (
                  <div key={k} className="text-black">
                    <strong>{a.hora}</strong> – {a.profissao}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* RODAPÉ IMPRESSÃO */}
      <div className="hidden print:block text-[10px] mt-6 pt-2">
        <p><strong>Telefone:</strong> 3289-8213</p>
        <p><strong>WhatsApp Administrativo:</strong> (51) 99194-1007 – Agendamentos, receitas e laudos</p>
        <p><strong>WhatsApp Agendamento:</strong> (51) 98969-2226 – Faltas e reagendamentos</p>
        <p><strong>WhatsApp Serviço Social:</strong> (51) 99736-6953 – Atendimento e suporte social</p>
      </div>
    </div>
  );
}