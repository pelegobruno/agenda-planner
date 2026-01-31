/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  Treinamento,
  getTreinamentos,
  salvarTreinamentos,
} from "@/lib/treinamentosStorage";
import { formatarDataBR } from "@/lib/datas";

export default function TreinamentosPage() {
  const [mounted, setMounted] = useState(false);
  const [lista, setLista] = useState<Treinamento[]>([]);

  const [data, setData] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  /* =========================
     LOAD INICIAL
  ========================= */
  useEffect(() => {
    setMounted(true);
    setLista(getTreinamentos());
  }, []);

  if (!mounted) return null;

  /* =========================
     RESET FORM
  ========================= */
  function limparFormulario() {
    setData("");
    setTitulo("");
    setDescricao("");
    setEditandoId(null);
  }

  /* =========================
     SALVAR / EDITAR
  ========================= */
  function salvar() {
    if (!data || !titulo) {
      setMensagem("⚠️ Preencha data e título.");
      return;
    }

    let atualizada: Treinamento[];

    if (editandoId) {
      // ✏️ EDITAR
      atualizada = lista.map((t) =>
        t.id === editandoId
          ? {
              ...t,
              data,
              titulo: titulo.toUpperCase(),
              descricao,
            }
          : t
      );
      setMensagem("✏️ Treinamento atualizado com sucesso.");
    } else {
      // ➕ NOVO
      const novo: Treinamento = {
        id: crypto.randomUUID(),
        data,
        titulo: titulo.toUpperCase(),
        descricao,
      };
      atualizada = [...lista, novo];
      setMensagem("✅ Treinamento salvo com sucesso.");
    }

    setLista(atualizada);
    salvarTreinamentos(atualizada);

    // 🔔 avisa Planner
    window.dispatchEvent(new Event("storage"));

    limparFormulario();
  }

  /* =========================
     EDITAR CLICK
  ========================= */
  function editar(t: Treinamento) {
    setEditandoId(t.id);
    setData(t.data);
    setTitulo(t.titulo);
    setDescricao(t.descricao || "");
    setMensagem(null);
  }

  /* =========================
     REMOVER
  ========================= */
  function remover(id: string) {
    if (!confirm("Deseja remover este treinamento?")) return;

    const atualizada = lista.filter((t) => t.id !== id);
    setLista(atualizada);
    salvarTreinamentos(atualizada);
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-semibold">
        Cadastro de Treinamentos
      </h2>

      {mensagem && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded">
          {mensagem}
        </div>
      )}

      {/* FORMULÁRIO */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Título
          </label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={salvar}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {editandoId ? "Salvar alterações" : "Salvar treinamento"}
          </button>

          {editandoId && (
            <button
              onClick={limparFormulario}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* LISTA */}
      <table className="w-full bg-white border rounded shadow text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Data</th>
            <th className="p-2 text-left">Título</th>
            <th className="p-2 text-left">Descrição</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-2">{formatarDataBR(t.data)}</td>
              <td className="p-2 font-medium">{t.titulo}</td>
              <td className="p-2">{t.descricao}</td>
              <td className="p-2 text-center space-x-2">
                <button
                  onClick={() => editar(t)}
                  className="text-blue-600 font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => remover(t.id)}
                  className="text-red-600 font-semibold"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {lista.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                Nenhum treinamento cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
