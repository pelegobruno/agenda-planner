"use client";

import { useEffect, useMemo, useState } from "react";
import { formatarDataBR } from "@/lib/datas";

/* =====================
   TIPOS
===================== */
type Agendamento = {
  data: string; // dd/MM/yyyy (pode vir inconsistente)
  hora: string;
  profissao: string;
  profissional: string;
  paciente: string;
};

/* =====================
   NORMALIZAÇÕES
===================== */
function isoParaBR(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

function normalizarNome(nome: string) {
  return nome.trim().toUpperCase();
}

function normalizarData(data: string) {
  const partes = data.trim().split("/");
  if (partes.length !== 3) return data.trim();

  const d = partes[0].padStart(2, "0");
  const m = partes[1].padStart(2, "0");
  const y = partes[2];

  return `${d}/${m}/${y}`;
}

function contemReuniao(texto: string) {
  return texto.toUpperCase().includes("REUNIÃO");
}

/* =====================
   COMPONENTE
===================== */
export default function ChamadaDoDia() {
  const [dataISO, setDataISO] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);

  /* =====================
     BUSCA API
  ====================== */
  useEffect(() => {
    if (!dataISO) return;

    let ativo = true;

    async function carregar() {
      setLoading(true);
      try {
        const res = await fetch("/api/agendamentos", {
          cache: "no-store",
        });
        const data = await res.json();

        if (ativo) {
          setAgendamentos(Array.isArray(data) ? data : []);
        }
      } catch {
        if (ativo) setAgendamentos([]);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [dataISO]);

  /* =====================
     LISTA FINAL CORRETA
  ====================== */
  const pacientesDoDia = useMemo(() => {
    if (!dataISO) return [];

    const dataBR = isoParaBR(dataISO);
    const nomes = new Set<string>();

    agendamentos.forEach((a) => {
      const dataPlanilha = normalizarData(a.data);

      // ❌ data não bate
      if (dataPlanilha !== dataBR) return;

      // ❌ remove reuniões
      if (contemReuniao(a.paciente)) return;

      // ✅ separa grupos corretamente
      a.paciente
        .split("/")
        .map(normalizarNome)
        .forEach((nome) => {
          if (nome && !contemReuniao(nome)) {
            nomes.add(nome);
          }
        });
    });

    return Array.from(nomes).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [agendamentos, dataISO]);

  const totalCriancas = pacientesDoDia.length;

  /* =====================
     RENDER
  ====================== */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center">
        CHAMADA DO DIA
      </h2>

      {/* FILTRO */}
      <div className="flex justify-between items-end print:hidden">
        <div>
          <label className="block text-sm font-medium mb-1">
            Data
          </label>
          <input
            type="date"
            value={dataISO}
            onChange={(e) => setDataISO(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Imprimir / PDF
        </button>
      </div>

      {dataISO && (
        <div className="bg-white border p-8 print:border-0">
          <p className="text-center font-semibold mb-4">
            OBRIGATÓRIO: Permanecer na recepção enquanto a criança está em atendimento
          </p>

          {/* CONTAGEM NO TOPO */}
          <div className="flex justify-between items-center mb-4 text-sm font-semibold">
            <span>Data: {formatarDataBR(dataISO)}</span>
            <span>
              Total de crianças:{" "}
              <strong>{totalCriancas}</strong>
            </span>
          </div>

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 text-left w-1/2">
                    NOME DO PACIENTE
                  </th>
                  <th className="border p-2 text-left w-1/2">
                    ASSINATURA DO RESPONSÁVEL
                  </th>
                </tr>
              </thead>
              <tbody>
                {pacientesDoDia.map((nome) => (
                  <tr key={nome}>
                    <td className="border p-2 h-10">
                      {nome}
                    </td>
                    <td className="border p-2 h-10"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
