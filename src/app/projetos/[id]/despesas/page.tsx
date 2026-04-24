"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { NumField } from "@/components/Fields";

export default function DespesasPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;
  const d = projeto.despesas;

  return (
    <div>
      <h1 className="h1 mb-4">Despesas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <h3 className="section-title">Comerciais (% sobre VGV)</h3>
          <NumField label="Corretagem" suffix="%" value={d.corretagem} onChange={(v) => atualizar((p) => (p.despesas.corretagem = v))} />
          <NumField label="Publicidade" suffix="%" value={d.publicidade} onChange={(v) => atualizar((p) => (p.despesas.publicidade = v))} />
          <NumField label="Imposto sobre venda (RET/PIS/COFINS/IR/CSLL)" suffix="%" value={d.impostoSobreVenda} onChange={(v) => atualizar((p) => (p.despesas.impostoSobreVenda = v))} />
        </div>
        <div className="card space-y-3">
          <h3 className="section-title">Administrativas</h3>
          <NumField
            label="Administração da obra (% sobre custo)"
            suffix="%"
            value={d.administracaoObra}
            onChange={(v) => atualizar((p) => (p.despesas.administracaoObra = v))}
          />
          <NumField
            label="Taxas legais / Cartório (valor fixo)"
            suffix="R$"
            value={d.taxasLegais}
            onChange={(v) => atualizar((p) => (p.despesas.taxasLegais = v))}
          />
          <NumField
            label="Outros custos fixos"
            suffix="R$"
            value={d.outrosCustosFixos}
            onChange={(v) => atualizar((p) => (p.despesas.outrosCustosFixos = v))}
          />
        </div>
      </div>
    </div>
  );
}
