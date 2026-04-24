"use client";

import { useMemo } from "react";
import { useProjeto } from "@/components/ProjetoProvider";
import { gerarFluxoCaixa } from "@/lib/cashflow";
import { brl } from "@/lib/format";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Line,
  Legend,
} from "recharts";

export default function FluxoCaixaPage() {
  const { projeto } = useProjeto();
  if (!projeto) return null;

  const linhas = useMemo(() => gerarFluxoCaixa(projeto), [projeto]);

  const data = linhas.map((l) => ({
    mes: l.mes,
    receita: l.receita,
    saida: -(l.custoObra + l.despesasComerciais + l.despesasAdministrativas + l.impostos + l.financiamentoSaida) + l.terreno,
    liquido: l.fluxoLiquido,
    acumulado: l.fluxoAcumulado,
  }));

  const exportarCSV = () => {
    const header = [
      "Mes",
      "Receita",
      "CustoObra",
      "DespesasComerciais",
      "DespesasAdministrativas",
      "Impostos",
      "FinanciamentoIngresso",
      "FinanciamentoSaida",
      "Terreno",
      "FluxoLiquido",
      "FluxoAcumulado",
    ].join(";");
    const rows = linhas.map((l) =>
      [
        l.mes,
        l.receita.toFixed(2),
        l.custoObra.toFixed(2),
        l.despesasComerciais.toFixed(2),
        l.despesasAdministrativas.toFixed(2),
        l.impostos.toFixed(2),
        l.financiamentoIngresso.toFixed(2),
        l.financiamentoSaida.toFixed(2),
        l.terreno.toFixed(2),
        l.fluxoLiquido.toFixed(2),
        l.fluxoAcumulado.toFixed(2),
      ].join(";")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fluxo_caixa_${projeto.nome}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="h1">Fluxo de Caixa</h1>
        <button className="btn-secondary" onClick={exportarCSV}>
          Exportar CSV
        </button>
      </div>

      <div className="card mb-4">
        <h3 className="section-title">Evolução mensal</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => brl(v)} />
              <Legend />
              <Bar dataKey="receita" name="Receita" fill="#10b981" />
              <Bar dataKey="saida" name="Saídas" fill="#ef4444" />
              <Line type="monotone" dataKey="acumulado" name="Acumulado" stroke="#1d4ed8" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Mês</th>
              <th className="text-right">Receita</th>
              <th className="text-right">Custo obra</th>
              <th className="text-right">Desp. comerciais</th>
              <th className="text-right">Desp. admin</th>
              <th className="text-right">Impostos</th>
              <th className="text-right">Financ. +</th>
              <th className="text-right">Financ. -</th>
              <th className="text-right">Terreno</th>
              <th className="text-right">Líquido</th>
              <th className="text-right">Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.mes}>
                <td>{l.mes}</td>
                <td className="text-right text-emerald-700">{brl(l.receita)}</td>
                <td className="text-right text-red-700">{brl(l.custoObra)}</td>
                <td className="text-right">{brl(l.despesasComerciais)}</td>
                <td className="text-right">{brl(l.despesasAdministrativas)}</td>
                <td className="text-right">{brl(l.impostos)}</td>
                <td className="text-right text-emerald-700">{brl(l.financiamentoIngresso)}</td>
                <td className="text-right text-red-700">{brl(l.financiamentoSaida)}</td>
                <td className="text-right">{brl(l.terreno)}</td>
                <td className={`text-right font-semibold ${l.fluxoLiquido >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {brl(l.fluxoLiquido)}
                </td>
                <td className="text-right">{brl(l.fluxoAcumulado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
