"use client";

import { useMemo } from "react";
import { useProjeto } from "@/components/ProjetoProvider";
import { Kpi } from "@/components/Kpi";
import { NumField } from "@/components/Fields";
import { calcularInvolutivo } from "@/lib/involutivo";
import { brl, pct } from "@/lib/format";

export default function InvolutivoPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;

  const r = useMemo(() => calcularInvolutivo(projeto), [projeto]);
  const i = projeto.involutivo;

  return (
    <div>
      <h1 className="h1 mb-4">Método Involutivo</h1>
      <p className="text-sm text-slate-600 mb-4 max-w-3xl">
        O Método Involutivo (NBR 14.653-2) calcula o valor máximo que o empreendedor pode pagar pelo terreno, considerando o
        empreendimento ideal, receitas, custos, despesas, margem de lucro e risco de negócio, descontados à TMA.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card space-y-3">
          <h3 className="section-title">Parâmetros</h3>
          <NumField
            label="TMA anual (taxa de desconto)"
            suffix="%"
            value={i.taxaDescontoAnual}
            onChange={(v) => atualizar((p) => (p.involutivo.taxaDescontoAnual = v))}
          />
          <NumField
            label="Margem de lucro do empreendedor"
            suffix="%"
            value={i.margemLucro}
            onChange={(v) => atualizar((p) => (p.involutivo.margemLucro = v))}
          />
          <NumField
            label="Risco de negócio"
            suffix="%"
            value={i.riscoNegocio}
            onChange={(v) => atualizar((p) => (p.involutivo.riscoNegocio = v))}
          />
          <NumField
            label="Fator de liquidez (desconto)"
            suffix="%"
            value={i.liquidezPct}
            onChange={(v) => atualizar((p) => (p.involutivo.liquidezPct = v))}
          />
          <NumField
            label="Elasticidade de área (expoente)"
            value={i.elasticidade}
            step={0.01}
            onChange={(v) => atualizar((p) => (p.involutivo.elasticidade = v))}
          />
        </div>

        <div className="card">
          <h3 className="section-title">Resultado</h3>
          <div className="grid grid-cols-2 gap-3">
            <Kpi label="VGV" value={brl(r.vgv)} />
            <Kpi label="Custo total obra" value={brl(r.custoTotalObra)} />
            <Kpi label="Lucro esperado" value={brl(r.lucroEsperado)} />
            <Kpi label="VPL empreend." value={brl(r.vplEmpreendimento)} />
            <Kpi label="TIR a.a." value={r.tirEmpreendimento != null ? pct(r.tirEmpreendimento * 100) : "—"} />
            <Kpi
              label="Valor terreno"
              value={brl(r.valorTerrenoFinal)}
              tone="positive"
              hint={`${brl(r.valorTerrenoPorM2)}/m²`}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Decomposição do valor do terreno</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Componente</th>
              <th className="text-right">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>VPL do empreendimento (sem terreno)</td>
              <td className="text-right">{brl(r.vplEmpreendimento)}</td>
            </tr>
            <tr>
              <td>(-) Lucro esperado do empreendedor</td>
              <td className="text-right text-red-700">- {brl(r.lucroEsperado)}</td>
            </tr>
            <tr>
              <td>(-) Risco de negócio</td>
              <td className="text-right text-red-700">
                - {brl(r.vgv * (projeto.involutivo.riscoNegocio / 100))}
              </td>
            </tr>
            <tr className="font-semibold">
              <td>= Valor bruto do terreno (involutivo)</td>
              <td className="text-right">{brl(r.valorTerrenoInvolutivo)}</td>
            </tr>
            <tr>
              <td>(±) Ajuste de liquidez</td>
              <td className="text-right">{brl(r.ajusteLiquidez)}</td>
            </tr>
            <tr>
              <td>(±) Ajuste por elasticidade de área</td>
              <td className="text-right">{brl(r.ajusteElasticidade)}</td>
            </tr>
            <tr className="font-bold bg-brand-50">
              <td>= Valor final do terreno</td>
              <td className="text-right">{brl(r.valorTerrenoFinal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
