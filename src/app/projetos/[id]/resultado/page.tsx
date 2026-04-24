"use client";

import { useMemo, useState } from "react";
import { useProjeto } from "@/components/ProjetoProvider";
import { Kpi } from "@/components/Kpi";
import { NumField } from "@/components/Fields";
import { gerarFluxoCaixa } from "@/lib/cashflow";
import { irr, npv, paybackDescontado, paybackSimples, taxaAnualDeMensal, taxaMensalDeAnual } from "@/lib/finance";
import { brl, pct } from "@/lib/format";

export default function ResultadoPage() {
  const { projeto } = useProjeto();
  const [tmaAnual, setTmaAnual] = useState<number | null>(null);
  if (!projeto) return null;
  const tma = tmaAnual ?? projeto.involutivo.taxaDescontoAnual;

  const linhas = useMemo(() => gerarFluxoCaixa(projeto), [projeto]);
  const fluxos = linhas.map((l) => l.fluxoLiquido);
  const tMensal = taxaMensalDeAnual(tma / 100);
  const vpl = npv(tMensal, fluxos);
  const tirMensal = irr(fluxos);
  const tirAnual = tirMensal != null ? taxaAnualDeMensal(tirMensal) : null;
  const pbSimples = paybackSimples(fluxos);
  const pbDesc = paybackDescontado(tMensal, fluxos);

  return (
    <div>
      <h1 className="h1 mb-4">Indicadores de Viabilidade</h1>

      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <NumField
            label="TMA anual (taxa de desconto)"
            suffix="%"
            value={tma}
            onChange={setTmaAnual}
          />
          <div className="text-xs text-slate-500 md:col-span-2">
            TMA equivalente mensal: <strong>{pct(tMensal * 100, 4)}</strong>
            <br />
            Horizonte do fluxo: <strong>{linhas.length} meses</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Kpi label="VPL" value={brl(vpl)} tone={vpl >= 0 ? "positive" : "negative"} />
        <Kpi label="TIR a.a." value={tirAnual != null ? pct(tirAnual * 100) : "—"} tone="positive" />
        <Kpi label="Payback simples" value={pbSimples != null ? `${pbSimples.toFixed(1)} meses` : "—"} />
        <Kpi label="Payback descontado" value={pbDesc != null ? `${pbDesc.toFixed(1)} meses` : "—"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title">Resumo consolidado</h3>
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <dt className="text-slate-500">Receita bruta total</dt>
            <dd>{brl(linhas.reduce((s, l) => s + l.receita, 0))}</dd>
            <dt className="text-slate-500">Custo total obra</dt>
            <dd>{brl(linhas.reduce((s, l) => s + l.custoObra, 0))}</dd>
            <dt className="text-slate-500">Despesas comerciais</dt>
            <dd>{brl(linhas.reduce((s, l) => s + l.despesasComerciais, 0))}</dd>
            <dt className="text-slate-500">Despesas admin.</dt>
            <dd>{brl(linhas.reduce((s, l) => s + l.despesasAdministrativas, 0))}</dd>
            <dt className="text-slate-500">Impostos</dt>
            <dd>{brl(linhas.reduce((s, l) => s + l.impostos, 0))}</dd>
            <dt className="text-slate-500">Resultado nominal</dt>
            <dd className="font-semibold">{brl(linhas.reduce((s, l) => s + l.fluxoLiquido, 0))}</dd>
          </dl>
        </div>

        <div className="card">
          <h3 className="section-title">Critério de decisão</h3>
          <p className="text-sm text-slate-700">
            {vpl >= 0 ? (
              <>
                <span className="text-emerald-700 font-semibold">✓ Empreendimento VIÁVEL</span> à TMA de{" "}
                {pct(tma)}. VPL positivo indica retorno superior à taxa mínima de atratividade.
              </>
            ) : (
              <>
                <span className="text-red-700 font-semibold">✗ Empreendimento INVIÁVEL</span> à TMA de {pct(tma)}.
                VPL negativo — ajuste preços, custos ou prazos.
              </>
            )}
          </p>
          {tirAnual != null && (
            <p className="text-sm text-slate-700 mt-2">
              TIR ({pct(tirAnual * 100)}) {tirAnual * 100 > tma ? "acima" : "abaixo"} da TMA ({pct(tma)}).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
