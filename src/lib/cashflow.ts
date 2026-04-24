// Geração do fluxo de caixa do empreendimento
import type { Projeto } from "./types";
import { tabelaPrice, taxaMensalDeAnual } from "./finance";

export interface LinhaFluxo {
  mes: number;
  receita: number;
  custoObra: number;
  despesasComerciais: number;
  despesasAdministrativas: number;
  impostos: number;
  financiamentoIngresso: number;
  financiamentoSaida: number;
  terreno: number;
  fluxoLiquido: number;
  fluxoAcumulado: number;
}

// Gera curva-S (Gompertz simplificada) normalizada para [0..1] com soma = 1 em N pontos
export function curvaSNormalizada(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [1];
  const pontos: number[] = [];
  // Uso logística ajustada: f(x) = 1/(1+exp(-k*(x-x0)))
  const k = 0.35 * (12 / n + 1); // acentua quando poucos meses
  const x0 = n / 2;
  const acum: number[] = [];
  for (let i = 1; i <= n; i++) acum.push(1 / (1 + Math.exp(-k * (i - x0))));
  // Normaliza para 0..1 em acum
  const min = acum[0];
  const max = acum[n - 1];
  const norm = acum.map((v) => (v - min) / (max - min));
  for (let i = 0; i < n; i++) {
    pontos.push(i === 0 ? norm[0] : norm[i] - norm[i - 1]);
  }
  const soma = pontos.reduce((a, b) => a + b, 0);
  return pontos.map((p) => p / soma);
}

function distribuir(
  total: number,
  nMeses: number,
  modo: "linear" | "curvaS" | "customizada",
  customPesos?: number[]
): number[] {
  if (nMeses <= 0) return [];
  if (modo === "linear") return Array(nMeses).fill(total / nMeses);
  if (modo === "curvaS") return curvaSNormalizada(nMeses).map((p) => p * total);
  if (modo === "customizada" && customPesos && customPesos.length === nMeses) {
    const soma = customPesos.reduce((a, b) => a + b, 0) || 1;
    return customPesos.map((p) => (p / soma) * total);
  }
  return Array(nMeses).fill(total / nMeses);
}

export function calcularVGV(projeto: Projeto): number {
  return projeto.unidades.reduce(
    (s, u) => s + u.precoUnitario * u.quantidade,
    0
  );
}

export function horizonteMeses(projeto: Projeto): number {
  const { empreendimento, curvaVendas } = projeto;
  return Math.max(
    empreendimento.prazoObraMeses + Math.max(0, curvaVendas.prazoMeses - empreendimento.prazoObraMeses),
    empreendimento.prazoObraMeses + empreendimento.prazoVendasMeses
  );
}

export function gerarFluxoCaixa(projeto: Projeto): LinhaFluxo[] {
  const vgv = calcularVGV(projeto);
  const N = horizonteMeses(projeto);
  const linhas: LinhaFluxo[] = Array.from({ length: N }, (_, i) => ({
    mes: i + 1,
    receita: 0,
    custoObra: 0,
    despesasComerciais: 0,
    despesasAdministrativas: 0,
    impostos: 0,
    financiamentoIngresso: 0,
    financiamentoSaida: 0,
    terreno: 0,
    fluxoLiquido: 0,
    fluxoAcumulado: 0,
  }));

  // Custos — cada item no seu intervalo
  for (const item of projeto.custos) {
    const nm = Math.max(1, item.mesFim - item.mesInicio + 1);
    const pesos = distribuir(item.valorTotal, nm, item.distribuicao, item.pesosCustomizados);
    for (let k = 0; k < nm; k++) {
      const m = item.mesInicio - 1 + k;
      if (m >= 0 && m < N) linhas[m].custoObra += pesos[k];
    }
  }

  // Aquisição do terreno no mês 1 (custo capitalizado à parte — contabilizado no terreno)
  if (projeto.terreno.valorTerrenoEstimado && projeto.terreno.valorTerrenoEstimado > 0) {
    linhas[0].terreno = -projeto.terreno.valorTerrenoEstimado;
  }

  // Receitas de vendas
  const { curvaVendas } = projeto;
  const prazoVendas = Math.max(1, curvaVendas.prazoMeses);
  const obra = projeto.empreendimento.prazoObraMeses;
  const pesosVenda = distribuir(
    1,
    prazoVendas,
    curvaVendas.distribuicaoVendas,
    curvaVendas.pesosVendasCustom
  );

  // Para cada "venda" disparada no mês mv, o cliente paga sinal, parcelas durante obra, chaves e pós.
  for (let mv = 0; mv < prazoVendas; mv++) {
    const pctMv = pesosVenda[mv];
    const vgvLote = vgv * pctMv; // fração do VGV vendida nesse mês
    // 1) Sinal (no ato da venda)
    if (mv < N) linhas[mv].receita += vgvLote * (curvaVendas.sinalPct / 100);
    // 2) Parcelas durante a obra (do mês da venda até a entrega — mês `obra`)
    const mesesParcelas = Math.max(1, obra - mv);
    const vParc = vgvLote * (curvaVendas.parcelasObraPct / 100);
    for (let k = 0; k < mesesParcelas; k++) {
      const idx = mv + k;
      if (idx < N) linhas[idx].receita += vParc / mesesParcelas;
    }
    // 3) Chaves (no mês da entrega)
    if (obra - 1 < N) linhas[obra - 1].receita += vgvLote * (curvaVendas.chavesPct / 100);
    // 4) Pós-chaves (distribuídos após a entrega, até N)
    const posInicio = obra;
    const nPos = Math.max(0, N - posInicio);
    if (nPos > 0) {
      const vPos = vgvLote * (curvaVendas.parcelasPosChavesPct / 100);
      for (let k = 0; k < nPos; k++) {
        const idx = posInicio + k;
        if (idx < N) linhas[idx].receita += vPos / nPos;
      }
    }
  }

  // Despesas comerciais, administrativas e impostos (sobre receita/custo)
  const totalCusto = linhas.reduce((s, l) => s + l.custoObra, 0);
  for (let m = 0; m < N; m++) {
    const rec = linhas[m].receita;
    linhas[m].despesasComerciais =
      rec * (projeto.despesas.corretagem + projeto.despesas.publicidade) / 100;
    linhas[m].impostos = rec * (projeto.despesas.impostoSobreVenda / 100);
    // Admin da obra proporcional ao custo do mês
    const pctMes = totalCusto > 0 ? linhas[m].custoObra / totalCusto : 0;
    linhas[m].despesasAdministrativas =
      pctMes * totalCusto * (projeto.despesas.administracaoObra / 100);
  }
  // Taxas legais e outros custos fixos — distribuídos no mês 1
  if (projeto.despesas.taxasLegais) linhas[0].despesasAdministrativas += projeto.despesas.taxasLegais;
  if (projeto.despesas.outrosCustosFixos) linhas[0].despesasAdministrativas += projeto.despesas.outrosCustosFixos;

  // Financiamento à produção (opcional)
  if (projeto.financiamento.usaFinanciamento && projeto.financiamento.percentualFinanciado > 0) {
    const totalObra = totalCusto;
    const valorFinanciado = totalObra * (projeto.financiamento.percentualFinanciado / 100);
    // Ingressos proporcionais ao custo da obra (geralmente liberado conforme medição)
    for (let m = 0; m < N; m++) {
      const pct = totalObra > 0 ? linhas[m].custoObra / totalObra : 0;
      linhas[m].financiamentoIngresso += pct * valorFinanciado;
    }
    const tMensal = taxaMensalDeAnual(projeto.financiamento.taxaJurosAnual / 100);
    const price = tabelaPrice(
      valorFinanciado,
      tMensal,
      projeto.financiamento.prazoAmortizacaoMeses,
      projeto.financiamento.carenciaMeses
    );
    // Saídas iniciam após a obra
    for (let i = 0; i < price.length; i++) {
      const idx = projeto.empreendimento.prazoObraMeses - 1 + i;
      if (idx >= 0 && idx < N) linhas[idx].financiamentoSaida += price[i].parcela;
    }
  }

  // Fluxo líquido e acumulado
  let acum = 0;
  for (const l of linhas) {
    l.fluxoLiquido =
      l.receita -
      l.custoObra -
      l.despesasComerciais -
      l.despesasAdministrativas -
      l.impostos +
      l.financiamentoIngresso -
      l.financiamentoSaida +
      l.terreno;
    acum += l.fluxoLiquido;
    l.fluxoAcumulado = acum;
  }
  return linhas;
}
