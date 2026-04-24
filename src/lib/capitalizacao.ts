// Método da Capitalização da Renda (NBR 14.653-4)

import { npv } from "./finance";
import type { Projeto } from "./types";

export interface LinhaCapitalizacao {
  ano: number;
  receitaBruta: number;
  vacancia: number;
  inadimplencia: number;
  receitaLiquida: number;
  despesasOperacionais: number;
  noi: number; // Net Operating Income
}

export interface ResultadoCapitalizacao {
  linhas: LinhaCapitalizacao[];
  valorResidual: number;
  valorPresente: number;
  capRate: number;
  noiAnoUm: number;
}

export function calcularCapitalizacao(projeto: Projeto): ResultadoCapitalizacao {
  const p = projeto.capitalizacao;
  const linhas: LinhaCapitalizacao[] = [];
  for (let ano = 1; ano <= p.horizonteAnos; ano++) {
    const receitaBruta =
      p.rendaMensalBruta * 12 * Math.pow(1 + p.reajusteAluguelAnual / 100, ano - 1);
    const vacancia = receitaBruta * (p.vacanciaPct / 100);
    const inadimplencia = receitaBruta * (p.inadimplenciaPct / 100);
    const receitaLiquida = receitaBruta - vacancia - inadimplencia;
    const despesasOperacionais = receitaLiquida * (p.despesasOperacionaisPct / 100);
    const noi = receitaLiquida - despesasOperacionais;
    linhas.push({
      ano,
      receitaBruta,
      vacancia,
      inadimplencia,
      receitaLiquida,
      despesasOperacionais,
      noi,
    });
  }

  // Valor residual = NOI do último ano / cap rate OU % especificado
  const noiUltimoAno = linhas[linhas.length - 1]?.noi ?? 0;
  const valorResidualPorCap =
    p.taxaCapitalizacao > 0 ? noiUltimoAno / (p.taxaCapitalizacao / 100) : 0;
  const valorResidualPct =
    p.valorResidualPct > 0 ? (valorResidualPorCap * p.valorResidualPct) / 100 : valorResidualPorCap;

  // Fluxo anual + valor residual no último ano
  const fluxos: number[] = [0]; // t=0
  for (let i = 0; i < linhas.length; i++) {
    const add = i === linhas.length - 1 ? valorResidualPct : 0;
    fluxos.push(linhas[i].noi + add);
  }
  const vp = npv(p.taxaCapitalizacao / 100, fluxos);

  return {
    linhas,
    valorResidual: valorResidualPct,
    valorPresente: vp,
    capRate: p.taxaCapitalizacao,
    noiAnoUm: linhas[0]?.noi ?? 0,
  };
}
