// Análise de Pareto (sensibilidade determinística) — variáveis que mais impactam o VPL

import type { Projeto } from "./types";
import { calcularInvolutivo } from "./involutivo";

export interface LinhaPareto {
  variavel: string;
  caminho: string;
  impactoPositivo: number; // Δ valor terreno com +delta
  impactoNegativo: number;
  amplitude: number; // |positivo - negativo|
  percAcumulado?: number;
}

const VARIAVEIS_PADRAO: { nome: string; caminho: string }[] = [
  { nome: "Preço médio da unidade", caminho: "unidades.0.precoUnitario" },
  { nome: "Custo total da obra (item 0)", caminho: "custos.0.valorTotal" },
  { nome: "Prazo de obra", caminho: "empreendimento.prazoObraMeses" },
  { nome: "Prazo de vendas", caminho: "curvaVendas.prazoMeses" },
  { nome: "Corretagem (%)", caminho: "despesas.corretagem" },
  { nome: "Impostos sobre venda (%)", caminho: "despesas.impostoSobreVenda" },
  { nome: "Admin. de obra (%)", caminho: "despesas.administracaoObra" },
  { nome: "Taxa de desconto (TMA)", caminho: "involutivo.taxaDescontoAnual" },
  { nome: "Margem de lucro (%)", caminho: "involutivo.margemLucro" },
  { nome: "Risco de negócio (%)", caminho: "involutivo.riscoNegocio" },
];

function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, p) => (acc == null ? undefined : acc[p]), obj);
}
function setByPath(obj: any, path: string, value: number) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) return;
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

export function rodarPareto(projeto: Projeto, deltaPct = 10): LinhaPareto[] {
  const baseline = calcularInvolutivo(projeto).valorTerrenoFinal;
  const linhas: LinhaPareto[] = [];
  for (const v of VARIAVEIS_PADRAO) {
    const original = getByPath(projeto, v.caminho);
    if (typeof original !== "number" || original === 0) continue;
    const fator = 1 + deltaPct / 100;

    const pos = JSON.parse(JSON.stringify(projeto)) as Projeto;
    setByPath(pos, v.caminho, original * fator);
    const valorPos = calcularInvolutivo(pos).valorTerrenoFinal;

    const neg = JSON.parse(JSON.stringify(projeto)) as Projeto;
    setByPath(neg, v.caminho, original * (2 - fator));
    const valorNeg = calcularInvolutivo(neg).valorTerrenoFinal;

    linhas.push({
      variavel: v.nome,
      caminho: v.caminho,
      impactoPositivo: valorPos - baseline,
      impactoNegativo: valorNeg - baseline,
      amplitude: Math.abs(valorPos - valorNeg),
    });
  }
  linhas.sort((a, b) => b.amplitude - a.amplitude);
  const total = linhas.reduce((s, l) => s + l.amplitude, 0) || 1;
  let acum = 0;
  for (const l of linhas) {
    acum += l.amplitude;
    l.percAcumulado = (acum / total) * 100;
  }
  return linhas;
}
