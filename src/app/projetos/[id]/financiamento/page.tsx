"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { NumField } from "@/components/Fields";
import { tabelaPrice, taxaMensalDeAnual } from "@/lib/finance";
import { brl } from "@/lib/format";

export default function FinanciamentoPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;
  const f = projeto.financiamento;
  const custoTotal = projeto.custos.reduce((s, c) => s + c.valorTotal, 0);
  const valorFin = custoTotal * (f.percentualFinanciado / 100);
  const tabela = f.usaFinanciamento
    ? tabelaPrice(valorFin, taxaMensalDeAnual(f.taxaJurosAnual / 100), f.prazoAmortizacaoMeses, f.carenciaMeses)
    : [];

  return (
    <div>
      <h1 className="h1 mb-4">Financiamento à Produção</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card space-y-3">
          <h3 className="section-title">Parâmetros</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.usaFinanciamento}
              onChange={(e) => atualizar((p) => (p.financiamento.usaFinanciamento = e.target.checked))}
            />
            Utilizar financiamento à produção
          </label>
          <NumField
            label="% do custo financiado"
            suffix="%"
            value={f.percentualFinanciado}
            onChange={(v) => atualizar((p) => (p.financiamento.percentualFinanciado = v))}
          />
          <NumField
            label="Taxa de juros"
            suffix="% a.a."
            value={f.taxaJurosAnual}
            onChange={(v) => atualizar((p) => (p.financiamento.taxaJurosAnual = v))}
          />
          <NumField
            label="Prazo de amortização"
            suffix="meses"
            step={1}
            value={f.prazoAmortizacaoMeses}
            onChange={(v) => atualizar((p) => (p.financiamento.prazoAmortizacaoMeses = v))}
          />
          <NumField
            label="Carência"
            suffix="meses"
            step={1}
            value={f.carenciaMeses}
            onChange={(v) => atualizar((p) => (p.financiamento.carenciaMeses = v))}
          />
        </div>

        <div className="card">
          <h3 className="section-title">Resumo</h3>
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <dt className="text-slate-500">Custo total de obra</dt>
            <dd>{brl(custoTotal)}</dd>
            <dt className="text-slate-500">Valor financiado</dt>
            <dd>{brl(valorFin)}</dd>
            <dt className="text-slate-500">Parcela (Price)</dt>
            <dd>{brl(tabela[tabela.length - 1]?.parcela ?? 0)}</dd>
            <dt className="text-slate-500">Total a pagar</dt>
            <dd>{brl(tabela.reduce((s, l) => s + l.parcela, 0))}</dd>
            <dt className="text-slate-500">Total juros</dt>
            <dd>{brl(tabela.reduce((s, l) => s + l.juros, 0))}</dd>
          </dl>
        </div>
      </div>

      {f.usaFinanciamento && (
        <div className="card overflow-x-auto">
          <h3 className="section-title">Tabela de amortização (Price)</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Mês</th>
                <th className="text-right">Parcela</th>
                <th className="text-right">Juros</th>
                <th className="text-right">Amortização</th>
                <th className="text-right">Saldo devedor</th>
              </tr>
            </thead>
            <tbody>
              {tabela.map((l) => (
                <tr key={l.mes}>
                  <td>{l.mes}</td>
                  <td className="text-right">{brl(l.parcela)}</td>
                  <td className="text-right">{brl(l.juros)}</td>
                  <td className="text-right">{brl(l.amort)}</td>
                  <td className="text-right">{brl(l.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
