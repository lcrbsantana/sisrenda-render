"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { curvaSNormalizada, gerarFluxoCaixa } from "@/lib/cashflow";
import { brl, pct } from "@/lib/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export default function CronogramaPage() {
  const { projeto } = useProjeto();
  if (!projeto) return null;

  const n = projeto.empreendimento.prazoObraMeses;
  const curva = curvaSNormalizada(n);
  let acum = 0;
  const data = curva.map((v, i) => {
    acum += v;
    return { mes: i + 1, mensal: v * 100, acumulado: acum * 100 };
  });

  const fluxo = gerarFluxoCaixa(projeto);
  const fluxoData = fluxo.map((l) => ({
    mes: l.mes,
    receita: l.receita,
    custoObra: l.custoObra,
  }));

  return (
    <div>
      <h1 className="h1 mb-4">Cronograma Físico-Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-title">Curva S padrão ({n} meses)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip formatter={(v: number) => pct(v)} />
                <Legend />
                <Area dataKey="mensal" name="Mensal" stroke="#3b82f6" fill="#93c5fd" />
                <Area dataKey="acumulado" name="Acumulado" stroke="#1d4ed8" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Curva logística aplicada automaticamente aos itens de custo com distribuição &quot;curvaS&quot;.
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Custo de obra vs Receita — mensal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fluxoData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Legend />
                <Line type="monotone" dataKey="custoObra" name="Custo obra" stroke="#ef4444" dot={false} />
                <Line type="monotone" dataKey="receita" name="Receita" stroke="#10b981" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="section-title">Tabela de medição mensal (Curva S)</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Mês</th>
              <th className="text-right">% do mês</th>
              <th className="text-right">% acumulado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.mes}>
                <td>{d.mes}</td>
                <td className="text-right">{pct(d.mensal)}</td>
                <td className="text-right">{pct(d.acumulado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
