"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import {
  listarProjetos,
  projetoVazio,
  salvarProjeto,
  removerProjeto,
  duplicarProjeto,
  exportarJSON,
  importarJSON,
} from "@/lib/storage";
import type { Projeto } from "@/lib/types";
import { brl } from "@/lib/format";

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [novoNome, setNovoNome] = useState("");

  const reload = async () => setProjetos(await listarProjetos());
  useEffect(() => {
    reload();
  }, []);

  const criar = async () => {
    const nome = novoNome.trim() || "Novo Empreendimento";
    const p = projetoVazio(nome);
    await salvarProjeto(p);
    setNovoNome("");
    await reload();
  };

  const apagar = async (id: string) => {
    if (confirm("Excluir este projeto?")) {
      await removerProjeto(id);
      await reload();
    }
  };
  const duplicar = async (id: string) => {
    await duplicarProjeto(id);
    await reload();
  };
  const exportar = (p: Projeto) => {
    const blob = new Blob([exportarJSON(p)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.nome.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const p = importarJSON(text);
      p.id = crypto.randomUUID();
      p.nome = `${p.nome} (importado)`;
      await salvarProjeto(p);
      await reload();
    } catch {
      alert("Arquivo inválido");
    }
    e.target.value = "";
  };

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="h1">Projetos</h1>
        <label className="btn-secondary cursor-pointer">
          Importar JSON
          <input type="file" accept="application/json" className="hidden" onChange={importar} />
        </label>
      </div>

      <div className="card mb-6">
        <h2 className="section-title">Criar novo projeto</h2>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Nome do empreendimento"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && criar()}
          />
          <button className="btn-primary" onClick={criar}>
            Criar
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Referência</th>
              <th>Método</th>
              <th>VGV</th>
              <th>Atualizado</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {projetos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-6">
                  Nenhum projeto. Crie um acima.
                </td>
              </tr>
            )}
            {projetos.map((p) => {
              const vgv = p.unidades.reduce((s, u) => s + u.precoUnitario * u.quantidade, 0);
              return (
                <tr key={p.id}>
                  <td>
                    <Link className="text-brand-700 hover:underline font-medium" href={`/projetos/${p.id}`}>
                      {p.nome}
                    </Link>
                  </td>
                  <td>{p.referencia || "—"}</td>
                  <td className="capitalize">{p.metodo.replace("-", " ")}</td>
                  <td>{brl(vgv)}</td>
                  <td>{new Date(p.atualizadoEm).toLocaleString("pt-BR")}</td>
                  <td className="text-right space-x-1">
                    <button className="btn-secondary" onClick={() => duplicar(p.id)}>
                      Duplicar
                    </button>
                    <button className="btn-secondary" onClick={() => exportar(p)}>
                      Exportar
                    </button>
                    <button className="btn-danger" onClick={() => apagar(p.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
