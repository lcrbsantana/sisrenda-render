"use client";

import { useState } from "react";
import { useProjeto } from "@/components/ProjetoProvider";
import { Kpi } from "@/components/Kpi";
import { NumField, SelectField } from "@/components/Fields";
import { rodarMonteCarlo, type ResultadoMonteCarlo } from "@/lib/montecarlo";
import { brl } from "@/lib/format";
import type { VariavelMonteCarlo } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const CAMINHOS = [
  "unidades.0.precoUnitario",
  "custos.0.valorTotal",
  "empreendimento.prazoObraMeses",
  "curvaVendas.prazoMeses",
  "despesas.corretagem",
  "despesas.impostoSobreVenda",
  "involutivo.taxaDescontoAnual",
  "involutivo.margemLucro",
];

export default function MonteCarloPage() {
  const { projeto, atualizar } = useProjeto();
  const [resultado, setResultado] = useState<ResultadoMonteCarlo | null>(null);
  const [rodando, setRodando] = useState(false);

  if (!projeto) return null;

  const add = () =>
    atualizar((p) =>
      p.monteCarlo.variaveis.push({
        id: crypto.randomUUID(),
        nome: "Nova variável",
        caminho: CAMINHOS[0],
        distribuicao: "triangular",
        min: 0,
        moda: 0,
        maxValor: 0,
      })
    );

  const remove = (id: string) =>
    atualizar((p) => (p.monteCarlo.variaveis = p.monteCarlo.variaveis.filter((v) => v.id !== id)));

  const update = (id: string, k: keyof VariavelMonteCarlo, v: any) =>
    atualizar((p) => {
      const it = p.monteCarlo.variaveis.find((x) => x.id === id);
      if (it) (it as any)[k] = v;
    });

  const rodar = () => {
    setRodando(true);
    setTimeout(() => {
      const r = rodarMonteCarlo(projeto);
      setResultado(r);
      setRodando(false);
    }, 30);
  };

  return (
    <div>
      <h1 className="h1 mb-4">Simulação de Monte Carlo</h1>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl">
        Análise estocástica de risco. Define-se uma distribuição de probabilidade para variáveis-chave e simula-se o valor
        do terreno <em>n</em> vezes, gerando um histograma e percentis de confiança.
      </p>

      <div className="card mb-4">
        <div className="flex items-end gap-3">
          <NumField
            label="Nº de simulações"
            step={100}
            value={projeto.monteCarlo.simulacoes}
            onChange={(v) => atualizar((p) => (p.monteCarlo.simulacoes = v))}
          />
          <button className="btn-primary" onClick={rodar} disabled={rodando}>
            {rodando ? "Rodando..." : "Rodar simulação"}
          </button>
          <button className="btn-secondary" onClick={add}>
            + Variável
          </button>
        </div>
      </div>

      <div className="card mb-4 overflow-x-auto">
        <h3 className="section-title">Variáveis estocásticas</h3>
        {projeto.monteCarlo.variaveis.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma variável — adicione ao menos uma.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Variável</th>
                <th>Distribuição</th>
                <th className="text-right">Min</th>
                <th className="text-right">Moda/Média</th>
                <th className="text-right">Max/Desvio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projeto.monteCarlo.variaveis.map((v) => (
                <tr key={v.id}>
                  <td>
                    <input className="input" value={v.nome} onChange={(e) => update(v.id, "nome", e.target.value)} />
                  </td>
                  <td>
                    <select className="input" value={v.caminho} onChange={(e) => update(v.id, "caminho", e.target.value)}>
                      {CAMINHOS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="input"
                      value={v.distribuicao}
                      onChange={(e) => update(v.id, "distribuicao", e.target.value)}
                    >
                      <option value="triangular">Triangular</option>
                      <option value="uniforme">Uniforme</option>
                      <option value="normal">Normal</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="input text-right"
                      type="number"
                      value={v.min ?? 0}
                      onChange={(e) => update(v.id, "min", parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      className="input text-right"
                      type="number"
                      value={v.distribuicao === "normal" ? v.media ?? 0 : v.moda ?? 0}
                      onChange={(e) =>
                        update(
                          v.id,
                          v.distribuicao === "normal" ? "media" : "moda",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="input text-right"
                      type="number"
                      value={v.distribuicao === "normal" ? v.desvio ?? 0 : v.maxValor ?? 0}
                      onChange={(e) =>
                        update(
                          v.id,
                          v.distribuicao === "normal" ? "desvio" : "maxValor",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td>
                    <button className="btn-danger" onClick={() => remove(v.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {resultado && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Kpi label="Média" value={brl(resultado.media)} />
            <Kpi label="Mediana" value={brl(resultado.mediana)} />
            <Kpi label="Desvio padrão" value={brl(resultado.desvio)} />
            <Kpi label="P5 — P95" value={`${brl(resultado.p5)} / ${brl(resultado.p95)}`} />
          </div>

          <div className="card mb-4">
            <h3 className="section-title">Distribuição do valor do terreno</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultado.histograma} margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rotulo" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="freq" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Percentis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="kpi-label">P5</div>
                <div>{brl(resultado.p5)}</div>
              </div>
              <div>
                <div className="kpi-label">P25</div>
                <div>{brl(resultado.p25)}</div>
              </div>
              <div>
                <div className="kpi-label">P75</div>
                <div>{brl(resultado.p75)}</div>
              </div>
              <div>
                <div className="kpi-label">P95</div>
                <div>{brl(resultado.p95)}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
