"use client";

import { useEffect, useState } from "react";
import { formatarDataBR } from "@/lib/datas";

// Definição do tipo para evitar erros de TS
type Treinamento = {
  id: string;
  data: string;
  titulo: string;
  descricao?: string;
};

export default function TreinamentosPage() {
  const [mounted, setMounted] = useState(false);
  const [lista, setLista] = useState<Treinamento[]>([]);

  const [data, setData] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
       CARREGAR DADOS (GLOBAL)
  ========================= */
  async function carregarDados() {
    setLoading(true);
    try {
      const res = await fetch("/api/treinamentos");
      const dados = await res.json();
      setLista(Array.isArray(dados) ? dados : []);
    } catch (err) {
      console.error("Erro ao carregar treinamentos globais:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    carregarDados();
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
       SALVAR / EDITAR (GLOBAL)
  ========================= */
  async function salvar() {
    if (!data || !titulo) {
      setMensagem("⚠️ Preencha data e título.");
      return;
    }

    const novoTreinamento: Treinamento = {
      id: editandoId || crypto.randomUUID(),
      data,
      titulo: titulo.toUpperCase(),
      descricao,
    };

    try {
      const res = await fetch("/api/treinamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoTreinamento),
      });

      if (res.ok) {
        setMensagem(editandoId ? "✏️ Treinamento atualizado globalmente." : "✅ Treinamento salvo globalmente.");
        carregarDados(); // Recarrega a lista do servidor
        limparFormulario();
      } else {
        setMensagem("❌ Erro ao salvar no servidor.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error); // Usando a variável para evitar erro de ESLint
      setMensagem("❌ Falha na conexão com o servidor.");
    }
  }

  /* =========================
       REMOVER (GLOBAL)
  ========================= */
  async function remover(id: string) {
    if (!confirm("Deseja remover este treinamento globalmente?")) return;

    try {
      const res = await fetch(`/api/treinamentos?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        carregarDados();
      }
    } catch (error) {
      console.error("Erro ao remover:", error); // Usando a variável para evitar erro de ESLint
      alert("Erro ao remover do servidor.");
    }
  }

  function editar(t: Treinamento) {
    setEditandoId(t.id);
    setData(t.data);
    setTitulo(t.titulo);
    setDescricao(t.descricao || "");
    setMensagem(null);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-semibold">
        Cadastro de Treinamentos (Sincronização Global)
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
          <label className="block text-sm font-medium">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={salvar}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
          {loading ? (
            <tr><td colSpan={4} className="p-4 text-center">Sincronizando com o servidor...</td></tr>
          ) : (
            lista.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{formatarDataBR(t.data)}</td>
                <td className="p-2 font-medium">{t.titulo}</td>
                <td className="p-2">{t.descricao}</td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => editar(t)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remover(t.id)}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          )}

          {!loading && lista.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                Nenhum treinamento cadastrado no servidor.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}