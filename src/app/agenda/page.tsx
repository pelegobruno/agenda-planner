"use client";

import { useEffect, useMemo, useState } from "react";

/* =====================
   TIPOS
===================== */
type Agendamento = {
  data: string; // dd/MM/yyyy
  hora: string; // string do Google
  profissao: string;
  profissional: string;
  paciente: string;
};

/* =====================
   UTILITÁRIOS
===================== */
function horaLimpa(valor: string) {
  const match = valor.match(/(\d{2}:\d{2})/);
  return match ? match[1] : valor;
}

function brParaISO(dataBR: string) {
  const [d, m, y] = dataBR.split("/");
  return `${y}-${m}-${d}`;
}

function mesISO(dataBR: string) {
  const [, m, y] = dataBR.split("/");
  return `${y}-${m}`;
}

/* =====================
   COMPONENTE
===================== */
export default function AgendaGeral() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /* filtros */
  const [filtroMes, setFiltroMes] = useState(""); // yyyy-MM
  const [filtroData, setFiltroData] = useState("");
  const [filtroHora, setFiltroHora] = useState("");
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroProfissao, setFiltroProfissao] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState("");

  /* =====================
     BUSCA API
  ===================== */
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro(null);

      try {
        const res = await fetch("/api/agendamentos", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Erro ao buscar agenda");
        }

        const data = await res.json();

        if (ativo) {
          setAgendamentos(Array.isArray(data) ? data : []);
        }
      } catch {
        if (ativo) {
          setErro("Falha ao carregar agenda do Google Drive");
          setAgendamentos([]);
        }
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  /* =====================
     LISTA FILTRADA
  ===================== */
  const listaFiltrada = useMemo(() => {
    return agendamentos
      .map((a) => ({
        ...a,
        hora: horaLimpa(a.hora),
      }))
      .filter((a) =>
        filtroMes ? mesISO(a.data) === filtroMes : true
      )
      .filter((a) =>
        filtroData ? brParaISO(a.data) === filtroData : true
      )
      .filter((a) =>
        filtroHora ? a.hora.startsWith(filtroHora) : true
      )
      .filter((a) =>
        filtroProfissional
          ? a.profissional
              .toLowerCase()
              .includes(filtroProfissional.toLowerCase())
          : true
      )
      .filter((a) =>
        filtroProfissao
          ? a.profissao
              .toLowerCase()
              .includes(filtroProfissao.toLowerCase())
          : true
      )
      .filter((a) =>
        filtroPaciente
          ? a.paciente
              .toLowerCase()
              .includes(filtroPaciente.toLowerCase())
          : true
      )
      .sort((a, b) =>
        brParaISO(a.data) === brParaISO(b.data)
          ? a.hora.localeCompare(b.hora)
          : brParaISO(a.data).localeCompare(brParaISO(b.data))
      );
  }, [
    agendamentos,
    filtroMes,
    filtroData,
    filtroHora,
    filtroProfissional,
    filtroProfissao,
    filtroPaciente,
  ]);

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        Agenda Geral Completa
      </h2>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-gray-50 p-4 rounded shadow print:hidden">
        {/* MÊS */}
        <input
          type="month"
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
          className="border p-2 rounded"
          title="Filtrar por mês"
        />

        {/* DATA */}
        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="border p-2 rounded"
        />

        {/* HORA */}
        <input
          type="time"
          value={filtroHora}
          onChange={(e) => setFiltroHora(e.target.value)}
          className="border p-2 rounded"
        />

        {/* PROFISSIONAL */}
        <input
          type="text"
          placeholder="Profissional"
          value={filtroProfissional}
          onChange={(e) =>
            setFiltroProfissional(e.target.value)
          }
          className="border p-2 rounded"
        />

        {/* PROFISSÃO */}
        <input
          type="text"
          placeholder="Profissão"
          value={filtroProfissao}
          onChange={(e) =>
            setFiltroProfissao(e.target.value)
          }
          className="border p-2 rounded"
        />

        {/* PACIENTE */}
        <input
          type="text"
          placeholder="Paciente"
          value={filtroPaciente}
          onChange={(e) =>
            setFiltroPaciente(e.target.value)
          }
          className="border p-2 rounded"
        />
      </div>

      {loading && <p>Carregando agenda...</p>}
      {erro && <p className="text-red-600">{erro}</p>}

      {!loading && listaFiltrada.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhum registro encontrado.
        </p>
      )}

      {listaFiltrada.length > 0 && (
        <table className="w-full bg-white border rounded shadow text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Hora</th>
              <th className="p-2 text-left">Profissional</th>
              <th className="p-2 text-left">Profissão</th>
              <th className="p-2 text-left">Paciente</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map((a, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{a.data}</td>
                <td className="p-2 font-semibold">{a.hora}</td>
                <td className="p-2">{a.profissional}</td>
                <td className="p-2">{a.profissao}</td>
                <td className="p-2">{a.paciente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => window.print()}
        className="px-4 py-2 bg-blue-600 text-white rounded print:hidden"
      >
        Imprimir / PDF
      </button>
    </div>
  );
}
