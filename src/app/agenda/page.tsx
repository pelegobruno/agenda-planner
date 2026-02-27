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

type OrdemPaciente = "CRONO" | "AZ" | "ZA";

/* =====================
   UTILITÁRIOS
===================== */
function horaLimpa(valor: string) {
  const match = valor.match(/(\d{2}:\d{2})/);
  return match ? match[1] : valor;
}

function brParaISO(dataBR: string) {
  const partes = dataBR.split("/");
  if (partes.length !== 3) return dataBR;

  const [d, m, y] = partes;
  const dd = (d ?? "").padStart(2, "0");
  const mm = (m ?? "").padStart(2, "0");
  const yy = (y ?? "").length === 2 ? `20${y}` : (y ?? "");

  return `${yy}-${mm}-${dd}`;
}

function mesISO(dataBR: string) {
  const iso = brParaISO(dataBR);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return iso.slice(0, 7);
}

function normLower(valor: string) {
  return (valor ?? "").trim().toLowerCase();
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
  const [filtroData, setFiltroData] = useState(""); // yyyy-MM-dd
  const [filtroHora, setFiltroHora] = useState(""); // HH:mm
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroProfissao, setFiltroProfissao] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState("");

  /* ordenação */
  const [ordemPaciente, setOrdemPaciente] = useState<OrdemPaciente>("CRONO");

  /* =====================
     BUSCA API
  ===================== */
  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      setLoading(true);
      setErro(null);

      try {
        const res = await fetch("/api/agendamentos", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Erro ao buscar agenda");

        const data: unknown = await res.json();
        setAgendamentos(Array.isArray(data) ? (data as Agendamento[]) : []);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setErro("Falha ao carregar agenda do Google Drive");
        setAgendamentos([]);
      } finally {
        setLoading(false);
      }
    }

    carregar();
    return () => controller.abort();
  }, []);

  /* =====================
     LISTA FILTRADA + ORDENADA
     (sem variáveis "não usadas")
  ===================== */
  const listaFiltrada = useMemo(() => {
    const fProf = normLower(filtroProfissional);
    const fProfissao = normLower(filtroProfissao);
    const fPaciente = normLower(filtroPaciente);

    const lista = agendamentos
      .map((a) => ({
        ...a,
        hora: horaLimpa(a.hora),
      }))
      .filter((a) => (filtroMes ? mesISO(a.data) === filtroMes : true))
      .filter((a) => (filtroData ? brParaISO(a.data) === filtroData : true))
      .filter((a) => (filtroHora ? a.hora.startsWith(filtroHora) : true))
      .filter((a) =>
        fProf ? normLower(a.profissional).includes(fProf) : true
      )
      .filter((a) =>
        fProfissao ? normLower(a.profissao).includes(fProfissao) : true
      )
      .filter((a) =>
        fPaciente ? normLower(a.paciente).includes(fPaciente) : true
      );

    const copia = [...lista];

    copia.sort((a, b) => {
      // Ordenação por paciente (A-Z / Z-A)
      if (ordemPaciente === "AZ" || ordemPaciente === "ZA") {
        const dir = ordemPaciente === "AZ" ? 1 : -1;

        const byNome =
          a.paciente.trim().localeCompare(b.paciente.trim(), "pt-BR", {
            sensitivity: "base",
            numeric: true,
          }) * dir;

        if (byNome !== 0) return byNome;

        // desempate: data/hora
        const dataA = brParaISO(a.data);
        const dataB = brParaISO(b.data);
        if (dataA !== dataB) return dataA.localeCompare(dataB);
        return a.hora.localeCompare(b.hora);
      }

      // Ordenação cronológica: data -> hora -> paciente
      const dataA = brParaISO(a.data);
      const dataB = brParaISO(b.data);

      if (dataA !== dataB) return dataA.localeCompare(dataB);

      const byHora = a.hora.localeCompare(b.hora);
      if (byHora !== 0) return byHora;

      return a.paciente.trim().localeCompare(b.paciente.trim(), "pt-BR", {
        sensitivity: "base",
        numeric: true,
      });
    });

    return copia;
  }, [
    agendamentos,
    filtroMes,
    filtroData,
    filtroHora,
    filtroProfissional,
    filtroProfissao,
    filtroPaciente,
    ordemPaciente,
  ]);

  const limparFiltros = () => {
    setFiltroMes("");
    setFiltroData("");
    setFiltroHora("");
    setFiltroProfissional("");
    setFiltroProfissao("");
    setFiltroPaciente("");
    setOrdemPaciente("CRONO");
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="p-6 space-y-6">
      {/* TOPO: TÍTULO + AÇÕES (IMPRIMIR NO TOPO) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">Agenda Geral Completa</h2>

        <div className="flex flex-wrap gap-2 print:hidden">
          <select
            value={ordemPaciente}
            onChange={(e) => setOrdemPaciente(e.target.value as OrdemPaciente)}
            className="border p-2 rounded bg-white"
            title="Ordenação"
          >
            <option value="CRONO">📅 Cronológica</option>
            <option value="AZ">🔤 Paciente A–Z</option>
            <option value="ZA">🔤 Paciente Z–A</option>
          </select>

          <button
            onClick={limparFiltros}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Limpar
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || listaFiltrada.length === 0}
            title={listaFiltrada.length === 0 ? "Sem registros para imprimir" : "Imprimir / PDF"}
          >
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-gray-50 p-4 rounded shadow print:hidden">
        <input
          type="month"
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
          className="border p-2 rounded"
          title="Filtrar por mês"
        />

        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="border p-2 rounded"
          title="Filtrar por data"
        />

        <input
          type="time"
          value={filtroHora}
          onChange={(e) => setFiltroHora(e.target.value)}
          className="border p-2 rounded"
          title="Filtrar por hora"
        />

        <input
          type="text"
          placeholder="Profissional"
          value={filtroProfissional}
          onChange={(e) => setFiltroProfissional(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Profissão"
          value={filtroProfissao}
          onChange={(e) => setFiltroProfissao(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Paciente"
          value={filtroPaciente}
          onChange={(e) => setFiltroPaciente(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {loading && <p>Carregando agenda...</p>}
      {erro && <p className="text-red-600">{erro}</p>}

      {!loading && listaFiltrada.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>
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
              <tr
                key={`${a.data}-${a.hora}-${a.paciente}-${i}`}
                className="border-t"
              >
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
    </div>
  );
}