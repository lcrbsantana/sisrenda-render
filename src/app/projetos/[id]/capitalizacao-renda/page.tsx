"use client";

import { useMemo } from "react";
import { useProjeto } from "@/components/ProjetoProvider";
import { Kpi } from "@/components/Kpi";
import { NumField } from "@/components/Fields";
import { calcularCapitalizacao } from "@/lib/capitalizacao";
import { brl, pct } from "@/lib/format";

export default function CapitalizacaoPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;

  const r = useMemo(() => calcularCapitalizacao(projeto), [projeto]);
  const c = projeto.capitalizacao;

  return (
    <div>
      <h1 className="h1 mb-4">Método da Capitalização da Renda</h1>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl">
        NBR 14.653-4. Valor do imóvel = valor presente do fluxo de rendas (aluguéis) líquidas de vacância, inadimplência e
        despesas operacionais, descontado à taxa de capitalização, acrescido de valor residual.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card space-y-3">
          <h3 className="section-title">Parâmetros</h3>
          <NumField
            label="Renda mensal bruta (aluguel)"
            suffix="R$/mês"
            value={c.rendaMensalBruta}
            onChange={(v) => atualizar((p) => (p.capitalizacao.rendaMensalBruta = v))}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumField
              label="Reajuste aluguel"
              suffix="% a.a."
              value={c.reajusteAluguelAnual}
              onChange={(v) => atualizar((p) => (p.capitalizacao.reajusteAluguelAnual = v))}
            />
            <NumField
              label="Horizonte"
              suffix="anos"
              step={1}
              value={c.horizonteAnos}
              onChange={(v) => atualizar((p) => (p.capitalizacao.horizonteAnos = v))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField
              label="Vacância"
              suffix="%"
              value={c.vacanciaPct}
              onChange={(v) => atualizar((p) => (p.capitalizacao.vacanciaPct = v))}
            />
            <NumField
              label="Inadimplência"
              suffix="%"
              value={c.inadimplenciaPct}
              onChange={(v) => atualizar((p) => (p.capitalizacao.inadimplenciaPct = v))}
            />
          </div>
          <NumField
            label="Despesas operacionais"
            suffix="% sobre receita"
            value={c.despesasOperacionaisPct}
            onChange={(v) => atualizar((p) => (p.capitalizacao.despesasOperacionaisPct = v))}
          />
          <NumField
            label="Cap rate (taxa de capitalização)"
            suffix="% a.a."
            value={c.taxaCapitalizacao}
            onChange={(v) => atualizar((p) => (p.capitalizacao.taxaCapitalizacao = v))}
          />
          <NumField
            label="Valor residual (% do residual calculado)"
            suffix="%"
            value={c.valorResidualPct}
            onChange={(v) => atualizar((p) => (p.capitalizacao.valorResidualPct = v))}
          />
        </div>

        <div className="card">
          <h3 className="section-title">Resultado</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Kpi label="NOI ano 1" value={brl(r.noiAnoUm)} />
            <Kpi label="Cap rate" value={pct(r.capRate)} />
            <Kpi label="Valor residual" value={brl(r.valorResidual)} />
            <Kpi label="Valor presente" value={brl(r.valorPresente)} tone="positive" />
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="section-title">Fluxo anual projetado</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Ano</th>
              <th className="text-right">Receita bruta</th>
              <th className="text-right">Vacância</th>
              <th className="text-right">Inadimplência</th>
              <th className="text-right">Receita líquida</th>
              <th className="text-right">Desp. operacionais</th>
              <th className="text-right">NOI</th>
            </tr>
          </thead>
          <tbody>
            {r.linhas.map((l) => (
              <tr key={l.ano}>
                <td>{l.ano}</td>
                <td className="text-right">{brl(l.receitaBruta)}</td>
                <td className="text-right text-red-700">- {brl(l.vacancia)}</td>
                <td className="text-right text-red-700">- {brl(l.inadimplencia)}</td>
                <td className="text-right">{brl(l.receitaLiquida)}</td>
                <td className="text-right text-red-700">- {brl(l.despesasOperacionais)}</td>
                <td className="text-right font-semibold text-emerald-700">{brl(l.noi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
