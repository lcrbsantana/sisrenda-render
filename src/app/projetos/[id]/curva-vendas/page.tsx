"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { NumField, SelectField } from "@/components/Fields";
import { pct } from "@/lib/format";

export default function CurvaVendasPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;
  const c = projeto.curvaVendas;
  const soma = c.sinalPct + c.parcelasObraPct + c.chavesPct + c.parcelasPosChavesPct;
  const ok = Math.abs(soma - 100) < 0.5;

  return (
    <div>
      <h1 className="h1 mb-4">Curva de Pagamentos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <h3 className="section-title">Percentuais de recebimento</h3>
          <NumField label="Sinal (no ato)" suffix="%" value={c.sinalPct} onChange={(v) => atualizar((p) => (p.curvaVendas.sinalPct = v))} />
          <NumField label="Parcelas durante a obra" suffix="%" value={c.parcelasObraPct} onChange={(v) => atualizar((p) => (p.curvaVendas.parcelasObraPct = v))} />
          <NumField label="Chaves (entrega)" suffix="%" value={c.chavesPct} onChange={(v) => atualizar((p) => (p.curvaVendas.chavesPct = v))} />
          <NumField label="Pós-chaves" suffix="%" value={c.parcelasPosChavesPct} onChange={(v) => atualizar((p) => (p.curvaVendas.parcelasPosChavesPct = v))} />
          <div className={`text-sm ${ok ? "text-emerald-600" : "text-red-600"}`}>
            Soma: {pct(soma)} {ok ? "✓" : "(deve ser 100%)"}
          </div>
        </div>

        <div className="card space-y-3">
          <h3 className="section-title">Parâmetros de venda</h3>
          <NumField label="Prazo de vendas" suffix="meses" step={1} value={c.prazoMeses} onChange={(v) => atualizar((p) => (p.curvaVendas.prazoMeses = v))} />
          <NumField label="Reajuste anual (INCC/IPCA)" suffix="%" value={c.reajusteAnualPct} onChange={(v) => atualizar((p) => (p.curvaVendas.reajusteAnualPct = v))} />
          <SelectField
            label="Distribuição das vendas ao longo do prazo"
            value={c.distribuicaoVendas}
            options={[
              { v: "linear" as const, l: "Linear" },
              { v: "curvaS" as const, l: "Curva S" },
              { v: "customizada" as const, l: "Customizada" },
            ]}
            onChange={(v) => atualizar((p) => (p.curvaVendas.distribuicaoVendas = v))}
          />
          <p className="text-xs text-slate-500">
            A distribuição determina em que mês as unidades são vendidas; a curva de pagamentos determina como cada venda é paga ao longo do tempo.
          </p>
        </div>
      </div>
    </div>
  );
}
