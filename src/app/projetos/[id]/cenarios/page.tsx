"use client";

import { useMemo, useState } from "react";
import { useProjeto } from "@/components/ProjetoProvider";
import { aplicarCenario } from "@/lib/cenarios";
import { calcularInvolutivo } from "@/lib/involutivo";
import { brl, pct } from "@/lib/format";
import type { Cenario } from "@/lib/types";

const CAMINHOS: { path: string; label: string }[] = [
  { path: "empreendimento.prazoObraMeses", label: "Prazo de obra (meses)" },
  { path: "curvaVendas.prazoMeses", label: "Prazo de vendas (meses)" },
  { path: "despesas.corretagem", label: "Corretagem (%)" },
  { path: "despesas.impostoSobreVenda", label: "Imposto sobre venda (%)" },
  { path: "despesas.administracaoObra", label: "Admin. de obra (%)" },
  { path: "involutivo.taxaDescontoAnual", label: "TMA (%)" },
  { path: "involutivo.margemLucro", label: "Margem de lucro (%)" },
  { path: "involutivo.riscoNegocio", label: "Risco de negócio (%)" },
  { path: "involutivo.liquidezPct", label: "Liquidez (%)" },
];

export default function CenariosPage() {
  const { projeto, atualizar } = useProjeto();
  const [aberto, setAberto] = useState<string | null>(null);
  if (!projeto) return null;

  const baseline = useMemo(() => calcularInvolutivo(projeto).valorTerrenoFinal, [projeto]);

  const addCenario = () =>
    atualizar((p) =>
      p.cenarios.push({
        id: crypto.randomUUID(),
        nome: `Cenário ${p.cenarios.length + 1}`,
        descricao: "",
        overrides: {},
      })
    );
  const remove = (id: string) => atualizar((p) => (p.cenarios = p.cenarios.filter((c) => c.id !== id)));
  const updateCen = (id: string, fn: (c: Cenario) => void) =>
    atualizar((p) => {
      const c = p.cenarios.find((x) => x.id === id);
      if (c) fn(c);
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="h1">Cenários</h1>
        <button className="btn-primary" onClick={addCenario}>
          + Novo cenário
        </button>
      </div>

      <div className="card mb-4">
        <div className="flex gap-6 items-baseline">
          <div>
            <div className="kpi-label">Baseline — valor terreno</div>
            <div className="kpi-value">{brl(baseline)}</div>
          </div>
          <p className="text-sm text-slate-600">
            Os cenários aplicam overrides sobre o projeto base e recalculam o valor do terreno pelo Método Involutivo.
          </p>
        </div>
      </div>

      {projeto.cenarios.length === 0 && (
        <div className="card text-center text-slate-500 py-8">Nenhum cenário criado.</div>
      )}

      <div className="space-y-3">
        {projeto.cenarios.map((cen) => {
          const aplicado = aplicarCenario(projeto, cen);
          const res = calcularInvolutivo(aplicado);
          const delta = res.valorTerrenoFinal - baseline;
          const open = aberto === cen.id;
          return (
            <div key={cen.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <input
                    className="input font-semibold"
                    value={cen.nome}
                    onChange={(e) => updateCen(cen.id, (c) => (c.nome = e.target.value))}
                  />
                </div>
                <div className="flex gap-6 ml-4 items-center">
                  <div>
                    <div className="kpi-label">Valor terreno</div>
                    <div className="font-semibold">{brl(res.valorTerrenoFinal)}</div>
                  </div>
                  <div>
                    <div className="kpi-label">Δ vs baseline</div>
                    <div className={`font-semibold ${delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {delta >= 0 ? "+" : ""}
                      {brl(delta)}
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => setAberto(open ? null : cen.id)}>
                    {open ? "Fechar" : "Editar"}
                  </button>
                  <button className="btn-danger" onClick={() => remove(cen.id)}>
                    Excluir
                  </button>
                </div>
              </div>

              {open && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <input
                    className="input mb-3"
                    placeholder="Descrição do cenário"
                    value={cen.descricao ?? ""}
                    onChange={(e) => updateCen(cen.id, (c) => (c.descricao = e.target.value))}
                  />
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Variável</th>
                        <th>Baseline</th>
                        <th>Override</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CAMINHOS.map((v) => {
                        const baseVal = getByPath(projeto, v.path);
                        const atual = cen.overrides[v.path];
                        return (
                          <tr key={v.path}>
                            <td>{v.label}</td>
                            <td>{typeof baseVal === "number" ? baseVal : String(baseVal)}</td>
                            <td className="w-48">
                              <input
                                className="input"
                                type="number"
                                value={atual != null ? Number(atual) : ""}
                                placeholder="usar baseline"
                                onChange={(e) =>
                                  updateCen(cen.id, (c) => {
                                    const val = e.target.value;
                                    if (val === "") delete c.overrides[v.path];
                                    else c.overrides[v.path] = parseFloat(val);
                                  })
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getByPath(obj: any, path: string) {
  return path.split(".").reduce((acc, p) => (acc == null ? undefined : acc[p]), obj);
}
