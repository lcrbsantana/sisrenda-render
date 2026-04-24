"use client";

import { useMemo, useState } from "react";
import { useProjeto } from "@/components/ProjetoProvider";
import { rodarPareto } from "@/lib/pareto";
import { brl, pct } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

export default function ParetoPage() {
  const { projeto } = useProjeto();
  const [delta, setDelta] = useState(10);
  if (!projeto) return null;

  const linhas = useMemo(() => rodarPareto(projeto, delta), [projeto, delta]);

  const data = linhas.map((l) => ({
    nome: l.variavel,
    amplitude: l.amplitude,
    positivo: l.impactoPositivo,
    negativo: l.impactoNegativo,
    percAcumulado: l.percAcumulado,
  }));

  return (
    <div>
      <h1 className="h1 mb-4">Análise de Pareto (Sensibilidade)</h1>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl">
        Varia cada variável em ±Δ% e mede o impacto no valor do terreno (Método Involutivo). Identifica as variáveis que
        concentram o maior risco/impacto (regra 80/20).
      </p>

      <div className="card mb-4">
        <div className="flex items-end gap-3">
          <div>
            <label className="label">Δ aplicado (%)</label>
            <input
              className="input w-28"
              type="number"
              value={delta}
              onChange={(e) => setDelta(parseFloat(e.target.value) || 10)}
            />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="section-title">Gráfico de Pareto</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 160 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="nome" width={160} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => brl(v)} />
              <Bar dataKey="amplitude">
                {data.map((_, i) => (
                  <Cell key={i} fill={i < 3 ? "#dc2626" : i < 6 ? "#f59e0b" : "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Variável</th>
              <th className="text-right">+Δ (impacto)</th>
              <th className="text-right">-Δ (impacto)</th>
              <th className="text-right">Amplitude</th>
              <th className="text-right">% acumulado</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.caminho}>
                <td>{l.variavel}</td>
                <td className={`text-right ${l.impactoPositivo >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {brl(l.impactoPositivo)}
                </td>
                <td className={`text-right ${l.impactoNegativo >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {brl(l.impactoNegativo)}
                </td>
                <td className="text-right font-semibold">{brl(l.amplitude)}</td>
                <td className="text-right">{l.percAcumulado != null ? pct(l.percAcumulado) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
