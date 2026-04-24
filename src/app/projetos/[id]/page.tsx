"use client";

import Link from "next/link";
import { useProjeto } from "@/components/ProjetoProvider";
import { Kpi } from "@/components/Kpi";
import { brl, pct, int } from "@/lib/format";
import { calcularVGV } from "@/lib/cashflow";
import { calcularInvolutivo } from "@/lib/involutivo";
import { calcularCapitalizacao } from "@/lib/capitalizacao";
import { rodarChecklist } from "@/lib/checklist";

export default function VisaoGeralPage() {
  const { projeto } = useProjeto();
  if (!projeto) return null;

  const vgv = calcularVGV(projeto);
  const custoTotal = projeto.custos.reduce((s, c) => s + c.valorTotal, 0);
  const invol = tryCalc(() => calcularInvolutivo(projeto));
  const cap = tryCalc(() => calcularCapitalizacao(projeto));
  const check = rodarChecklist(projeto);
  const pendentes = check.filter((c) => !c.ok && c.critico);

  return (
    <div>
      <div className="mb-6">
        <h1 className="h1">{projeto.nome}</h1>
        <p className="text-sm text-slate-600">
          Visão geral · Ref {projeto.referencia || "—"} · Avaliação{" "}
          {new Date(projeto.dataAvaliacao).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {pendentes.length > 0 && (
        <div className="card mb-4 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-2">
            <div className="text-amber-800 font-semibold">
              {pendentes.length} item(s) crítico(s) pendente(s):
            </div>
            <Link href={`/projetos/${projeto.id}/checklist`} className="text-brand-700 underline">
              Abrir checklist
            </Link>
          </div>
          <ul className="mt-2 text-sm text-amber-900 list-disc ml-5">
            {pendentes.slice(0, 4).map((i) => (
              <li key={i.id}>
                [{i.modulo}] {i.descricao}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Kpi label="VGV estimado" value={brl(vgv)} />
        <Kpi label="Custo total obra" value={brl(custoTotal)} />
        <Kpi
          label="Valor terreno (Involutivo)"
          value={invol ? brl(invol.valorTerrenoFinal) : "—"}
          tone="positive"
        />
        <Kpi
          label="Valor por Renda (DCF)"
          value={cap ? brl(cap.valorPresente) : "—"}
          hint={cap ? `NOI ano 1: ${brl(cap.noiAnoUm)}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="section-title">Terreno</h3>
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <dt className="text-slate-500">Endereço</dt>
            <dd>{projeto.terreno.endereco || "—"}</dd>
            <dt className="text-slate-500">Município/UF</dt>
            <dd>
              {projeto.terreno.municipio}/{projeto.terreno.uf || "—"}
            </dd>
            <dt className="text-slate-500">Área</dt>
            <dd>{int(projeto.terreno.area)} m²</dd>
            <dt className="text-slate-500">Zoneamento</dt>
            <dd>{projeto.terreno.zoneamento || "—"}</dd>
            <dt className="text-slate-500">CA / TO</dt>
            <dd>
              {projeto.terreno.coefAproveitamento} / {pct(projeto.terreno.taxaOcupacao, 0)}
            </dd>
          </dl>
        </div>
        <div className="card">
          <h3 className="section-title">Empreendimento</h3>
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <dt className="text-slate-500">Tipo</dt>
            <dd className="capitalize">{projeto.empreendimento.tipo.replace("-", " ")}</dd>
            <dt className="text-slate-500">Prazo obra</dt>
            <dd>{projeto.empreendimento.prazoObraMeses} meses</dd>
            <dt className="text-slate-500">Prazo vendas</dt>
            <dd>{projeto.empreendimento.prazoVendasMeses} meses</dd>
            <dt className="text-slate-500">Área construída</dt>
            <dd>{int(projeto.empreendimento.areaConstruidaTotal)} m²</dd>
            <dt className="text-slate-500">Área privativa</dt>
            <dd>{int(projeto.empreendimento.areaPrivativaVendavel)} m²</dd>
            <dt className="text-slate-500">Unidades</dt>
            <dd>{int(projeto.empreendimento.numUnidades)}</dd>
          </dl>
        </div>
      </div>

      {invol && (
        <div className="card">
          <h3 className="section-title">Resumo do Método Involutivo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="kpi-label">VPL empreendimento</div>
              <div className="font-semibold">{brl(invol.vplEmpreendimento)}</div>
            </div>
            <div>
              <div className="kpi-label">TIR (a.a.)</div>
              <div className="font-semibold">{invol.tirEmpreendimento != null ? pct(invol.tirEmpreendimento * 100) : "—"}</div>
            </div>
            <div>
              <div className="kpi-label">Lucro esperado</div>
              <div className="font-semibold">{brl(invol.lucroEsperado)}</div>
            </div>
            <div>
              <div className="kpi-label">R$/m² terreno</div>
              <div className="font-semibold">{brl(invol.valorTerrenoPorM2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function tryCalc<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
