// Método Involutivo (NBR 14.653-2) — valor do terreno a partir do empreendimento ideal

import { gerarFluxoCaixa, calcularVGV } from "./cashflow";
import { npv, irr, taxaMensalDeAnual } from "./finance";
import type { Projeto } from "./types";

export interface ResultadoInvolutivo {
  vgv: number;
  custoTotalObra: number;
  despesasTotais: number;
  lucroEsperado: number;
  vplEmpreendimento: number; // VPL sem terreno
  tirEmpreendimento: number | null;
  valorTerrenoInvolutivo: number;
  valorTerrenoPorM2: number;
  ajusteLiquidez: number;
  ajusteElasticidade: number;
  valorTerrenoFinal: number;
  fluxoSemTerreno: number[];
}

// Calcula o valor do terreno: VPL do empreendimento (sem considerar terreno) descontado por TMA,
// ajustado pela margem/risco, liquidez e elasticidade (área).
export function calcularInvolutivo(projeto: Projeto): ResultadoInvolutivo {
  // Clona projeto zerando o terreno para obter o VPL puro do empreendimento
  const proj: Projeto = {
    ...projeto,
    terreno: { ...projeto.terreno, valorTerrenoEstimado: 0 },
  };
  const linhas = gerarFluxoCaixa(proj);
  const fluxos = linhas.map((l) => l.fluxoLiquido);

  const tmaAnual = projeto.involutivo.taxaDescontoAnual / 100;
  const tmaMensal = taxaMensalDeAnual(tmaAnual);
  const vplSemTerreno = npv(tmaMensal, fluxos);
  const tirMensal = irr(fluxos);
  const tirAnual = tirMensal != null ? Math.pow(1 + tirMensal, 12) - 1 : null;

  const vgv = calcularVGV(projeto);
  const custoTotalObra = projeto.custos.reduce((s, c) => s + c.valorTotal, 0);
  const despesasTotais =
    vgv *
      ((projeto.despesas.corretagem +
        projeto.despesas.publicidade +
        projeto.despesas.impostoSobreVenda) /
        100) +
    custoTotalObra * (projeto.despesas.administracaoObra / 100) +
    projeto.despesas.taxasLegais +
    projeto.despesas.outrosCustosFixos;

  const lucroEsperado = vgv * (projeto.involutivo.margemLucro / 100);

  // Valor do terreno = VPL do empreendimento - lucro - risco
  const riscoValor = vgv * (projeto.involutivo.riscoNegocio / 100);
  const bruto = vplSemTerreno - lucroEsperado - riscoValor;

  // Ajuste de liquidez (desconto sobre valor bruto)
  const fatorLiquidez = 1 - projeto.involutivo.liquidezPct / 100;
  const valorComLiquidez = bruto * fatorLiquidez;

  // Ajuste por elasticidade de área (fator de fonte)
  // Assume área padrão 1000 m² como referência
  const areaRef = 1000;
  const fatorElasticidade = Math.pow(areaRef / Math.max(1, projeto.terreno.area), projeto.involutivo.elasticidade);
  const valorFinal = valorComLiquidez * fatorElasticidade;

  return {
    vgv,
    custoTotalObra,
    despesasTotais,
    lucroEsperado,
    vplEmpreendimento: vplSemTerreno,
    tirEmpreendimento: tirAnual,
    valorTerrenoInvolutivo: bruto,
    valorTerrenoPorM2: valorFinal / Math.max(1, projeto.terreno.area),
    ajusteLiquidez: valorComLiquidez - bruto,
    ajusteElasticidade: valorFinal - valorComLiquidez,
    valorTerrenoFinal: valorFinal,
    fluxoSemTerreno: fluxos,
  };
}
