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
type ModoPeriodo = "NORMAL" | "PERIODO";

type LinhaPeriodo = {
  data: string;
  hora: string;
  profissional: string;
  profissao: string;
  paciente: string;
  status: string;
};

type LinhaNormal = Agendamento & {
  status: string;
};

/* =====================
   UTILITÁRIOS
===================== */
function horaLimpa(valor: string) {
  const match = (valor ?? "").match(/(\d{2}:\d{2})/);
  return match ? match[1] : valor ?? "";
}

function brParaISO(dataBR: string) {
  const partes = (dataBR ?? "").split("/");
  if (partes.length !== 3) return dataBR ?? "";

  const [d, m, y] = partes;
  const dd = (d ?? "").padStart(2, "0");
  const mm = (m ?? "").padStart(2, "0");
  const yy = (y ?? "").length === 2 ? `20${y}` : y ?? "";

  return `${yy}-${mm}-${dd}`;
}

function mesISO(dataBR: string) {
  const iso = brParaISO(dataBR);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return iso.slice(0, 7);
}

function norm(valor: string) {
  return (valor ?? "").replace(/\s+/g, " ").trim();
}

function normLower(valor: string) {
  return norm(valor).toLowerCase();
}

function pacienteComContagem(nome: string, n: number) {
  const base = norm(nome);
  if (!base) return `(x${n})`;
  return `${base} (x${n})`;
}

function chaveAgendamento(item: Agendamento) {
  return [
    norm(item.data),
    horaLimpa(norm(item.hora)),
    norm(item.profissional),
    norm(item.profissao),
    norm(item.paciente),
  ].join("||");
}

/* =====================
   COMPONENTE
===================== */
export default function AgendaGeral() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /* faltas */
  const [faltasMap, setFaltasMap] = useState<Record<string, boolean>>({});

  /* filtros */
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroHora, setFiltroHora] = useState("");
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroProfissao, setFiltroProfissao] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState("");

  /* ordenação e modo */
  const [ordemPaciente, setOrdemPaciente] = useState<OrdemPaciente>("CRONO");
  const [modoPeriodo, setModoPeriodo] = useState<ModoPeriodo>("NORMAL");

  /* =====================
     CARREGAR FALTAS SALVAS
  ===================== */
  useEffect(() => {
    try {
      const salvo = localStorage.getItem("agenda-faltas");
      if (salvo) {
        const parsed: unknown = JSON.parse(salvo);
        if (parsed && typeof parsed === "object") {
          setFaltasMap(parsed as Record<string, boolean>);
        }
      }
    } catch {
      setFaltasMap({});
    }
  }, []);

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
     AÇÕES
  ===================== */
  const alternarFalta = (item: Agendamento) => {
    const chave = chaveAgendamento(item);

    setFaltasMap((prev) => {
      const proximo = {
        ...prev,
        [chave]: !prev[chave],
      };

      try {
        localStorage.setItem("agenda-faltas", JSON.stringify(proximo));
      } catch {
        // sem ação
      }

      return proximo;
    });
  };

  const limparFiltros = () => {
    setFiltroMes("");
    setFiltroData("");
    setFiltroHora("");
    setFiltroProfissional("");
    setFiltroProfissao("");
    setFiltroPaciente("");
    setOrdemPaciente("CRONO");
    setModoPeriodo("NORMAL");
  };

  /* =====================
     BASE FILTRADA
  ===================== */
  const baseFiltrada = useMemo(() => {
    const fProf = normLower(filtroProfissional);
    const fProfissao = normLower(filtroProfissao);
    const fPaciente = normLower(filtroPaciente);

    return agendamentos
      .map((a) => ({
        ...a,
        data: norm(a.data),
        hora: horaLimpa(norm(a.hora)),
        profissional: norm(a.profissional),
        profissao: norm(a.profissao),
        paciente: norm(a.paciente),
      }))
      .filter((a) => (filtroMes ? mesISO(a.data) === filtroMes : true))
      .filter((a) => (filtroData ? brParaISO(a.data) === filtroData : true))
      .filter((a) => (filtroHora ? a.hora.startsWith(filtroHora) : true))
      .filter((a) => (fProf ? normLower(a.profissional).includes(fProf) : true))
      .filter((a) => (fProfissao ? normLower(a.profissao).includes(fProfissao) : true))
      .filter((a) => (fPaciente ? normLower(a.paciente).includes(fPaciente) : true));
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
     LISTA EXIBIÇÃO
  ===================== */
  const listaExibicao: (LinhaNormal | LinhaPeriodo)[] = useMemo(() => {
    const copia = [...baseFiltrada];

    copia.sort((a, b) => {
      const dataA = brParaISO(a.data);
      const dataB = brParaISO(b.data);

      if (ordemPaciente === "AZ" || ordemPaciente === "ZA") {
        const dir = ordemPaciente === "AZ" ? 1 : -1;

        const byNome =
          a.paciente.localeCompare(b.paciente, "pt-BR", {
            sensitivity: "base",
            numeric: true,
          }) * dir;

        if (byNome !== 0) return byNome;

        if (dataA !== dataB) return dataA.localeCompare(dataB);
        return a.hora.localeCompare(b.hora);
      }

      if (dataA !== dataB) return dataA.localeCompare(dataB);

      const byHora = a.hora.localeCompare(b.hora);
      if (byHora !== 0) return byHora;

      return a.paciente.localeCompare(b.paciente, "pt-BR", {
        sensitivity: "base",
        numeric: true,
      });
    });

    if (modoPeriodo === "NORMAL") {
      return copia.map((item) => ({
        ...item,
        status: faltasMap[chaveAgendamento(item)] ? "FALTA" : "",
      }));
    }

    const mapa = new Map<
      string,
      {
        paciente: string;
        profissional: string;
        profissao: string;
        count: number;
        faltas: number;
        minDataISO: string;
      }
    >();

    for (const item of copia) {
      const key = [
        normLower(item.paciente),
        normLower(item.profissional),
        normLower(item.profissao),
      ].join("||");

      const dataISO = brParaISO(item.data);
      const teveFalta = faltasMap[chaveAgendamento(item)] ? 1 : 0;

      const atual = mapa.get(key);
      if (!atual) {
        mapa.set(key, {
          paciente: item.paciente,
          profissional: item.profissional,
          profissao: item.profissao,
          count: 1,
          faltas: teveFalta,
          minDataISO: dataISO,
        });
      } else {
        atual.count += 1;
        atual.faltas += teveFalta;
        if (dataISO && dataISO < atual.minDataISO) atual.minDataISO = dataISO;
      }
    }

    const resumo: LinhaPeriodo[] = Array.from(mapa.values()).map((x) => {
      let dataBR = "-";
      if (/^\d{4}-\d{2}-\d{2}$/.test(x.minDataISO)) {
        const [yy, mm, dd] = x.minDataISO.split("-");
        dataBR = `${dd}/${mm}/${yy}`;
      }

      return {
        data: dataBR,
        hora: "-",
        profissional: x.profissional,
        profissao: x.profissao,
        paciente: pacienteComContagem(x.paciente, x.count),
        status: x.faltas > 0 ? `FALTA (${x.faltas})` : "",
      };
    });

    resumo.sort((a, b) => {
      const dataA = brParaISO(a.data);
      const dataB = brParaISO(b.data);

      if (ordemPaciente === "AZ" || ordemPaciente === "ZA") {
        const dir = ordemPaciente === "AZ" ? 1 : -1;

        const byNome =
          a.paciente.localeCompare(b.paciente, "pt-BR", {
            sensitivity: "base",
            numeric: true,
          }) * dir;

        if (byNome !== 0) return byNome;

        if (dataA !== dataB) return dataA.localeCompare(dataB);
        return a.profissional.localeCompare(b.profissional, "pt-BR", {
          sensitivity: "base",
          numeric: true,
        });
      }

      if (dataA !== dataB) return dataA.localeCompare(dataB);

      const byProf = a.profissional.localeCompare(b.profissional, "pt-BR", {
        sensitivity: "base",
        numeric: true,
      });
      if (byProf !== 0) return byProf;

      return a.paciente.localeCompare(b.paciente, "pt-BR", {
        sensitivity: "base",
        numeric: true,
      });
    });

    return resumo;
  }, [baseFiltrada, ordemPaciente, modoPeriodo, faltasMap]);

  /* =====================
     RENDER
  ===================== */
  return (
    <>
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @media print {
          html,
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-area {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            font-size: 11px !important;
          }

          .print-table thead {
            display: table-header-group;
          }

          .print-table tfoot {
            display: table-footer-group;
          }

          .print-table tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #555 !important;
            padding: 6px 8px !important;
            vertical-align: top !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }

          .print-header {
            margin-bottom: 8px !important;
          }

          .print-header h2 {
            font-size: 18px !important;
            margin: 0 0 4px 0 !important;
          }

          .screen-only {
            display: none !important;
          }

          .print-status-falta {
            font-weight: 700 !important;
          }

          .print-row-falta td {
            background: #f8f8f8 !important;
          }
        }
      `}</style>

      <div className="print-area p-6 space-y-6">
        {/* TOPO */}
        <div className="print-header flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">Agenda Geral Completa</h2>

          <div className="screen-only flex flex-wrap gap-2">
            <button
              onClick={() =>
                setModoPeriodo((v) => (v === "NORMAL" ? "PERIODO" : "NORMAL"))
              }
              className={`px-4 py-2 rounded border ${
                modoPeriodo === "PERIODO"
                  ? "bg-purple-600 text-white border-purple-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
              }`}
              title="Período: agrupa por paciente + profissional + profissão e adiciona (xN) no paciente."
            >
              {modoPeriodo === "PERIODO" ? "Período: ON" : "Período: OFF"}
            </button>

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
              disabled={loading || listaExibicao.length === 0}
              title={
                listaExibicao.length === 0
                  ? "Sem registros para imprimir"
                  : "Imprimir / PDF"
              }
            >
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="screen-only grid grid-cols-1 md:grid-cols-6 gap-3 bg-gray-50 p-4 rounded shadow">
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

        {!loading && !erro && listaExibicao.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>
        )}

        {!loading && !erro && listaExibicao.length > 0 && (
          <div className="overflow-x-auto">
            <table className="print-table w-full bg-white border rounded shadow text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left w-[110px]">Data</th>
                  <th className="p-2 text-left w-[80px]">Hora</th>
                  <th className="p-2 text-left">Profissional</th>
                  <th className="p-2 text-left">Profissão</th>
                  <th className="p-2 text-left">Paciente</th>
                  <th className="p-2 text-left w-[120px]">Status</th>
                  <th className="screen-only p-2 text-left w-[110px]">Ação</th>
                </tr>
              </thead>
              <tbody>
                {listaExibicao.map((a, i) => {
                  const isLinhaNormal = modoPeriodo === "NORMAL";
                  const linhaNormal = a as LinhaNormal;
                  const isFalta = a.status.includes("FALTA");

                  return (
                    <tr
                      key={`${a.data}-${a.hora}-${a.paciente}-${i}`}
                      className={`${isFalta ? "print-row-falta" : ""} border-t`}
                    >
                      <td className="p-2">{a.data}</td>
                      <td className="p-2 font-semibold">{a.hora}</td>
                      <td className="p-2">{a.profissional}</td>
                      <td className="p-2">{a.profissao}</td>
                      <td className="p-2">{a.paciente}</td>
                      <td className="p-2">
                        <span className={isFalta ? "print-status-falta" : ""}>
                          {a.status}
                        </span>
                      </td>
                      <td className="screen-only p-2">
                        {isLinhaNormal ? (
                          <button
                            onClick={() => alternarFalta(linhaNormal)}
                            className={`px-3 py-1 rounded text-xs font-medium border ${
                              faltasMap[chaveAgendamento(linhaNormal)]
                                ? "bg-red-600 text-white border-red-700"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                            type="button"
                          >
                            {faltasMap[chaveAgendamento(linhaNormal)]
                              ? "Desmarcar"
                              : "Marcar falta"}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}