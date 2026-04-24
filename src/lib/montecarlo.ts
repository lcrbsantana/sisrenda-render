// Monte Carlo — análise de sensibilidade estocástica

import type { Projeto, VariavelMonteCarlo } from "./types";
import { calcularInvolutivo } from "./involutivo";

function triangular(min: number, moda: number, max: number): number {
  const u = Math.random();
  const f = (moda - min) / (max - min);
  if (u < f) return min + Math.sqrt(u * (max - min) * (moda - min));
  return max - Math.sqrt((1 - u) * (max - min) * (max - moda));
}

function normal(media: number, desvio: number): number {
  // Box-Muller
  const u1 = Math.max(1e-12, Math.random());
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return media + desvio * z;
}

function uniforme(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function sample(v: VariavelMonteCarlo): number {
  switch (v.distribuicao) {
    case "triangular":
      return triangular(v.min ?? 0, v.moda ?? ((v.min ?? 0) + (v.maxValor ?? 0)) / 2, v.maxValor ?? 0);
    case "normal":
      return normal(v.media ?? 0, v.desvio ?? 0);
    case "uniforme":
      return uniforme(v.min ?? 0, v.maxValor ?? 0);
  }
}

// Aplica dot-path em um objeto (mutável)
function setByPath(obj: any, path: string, value: number) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) return;
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

export interface ResultadoMonteCarlo {
  amostras: number[]; // valor do terreno por simulação
  media: number;
  mediana: number;
  desvio: number;
  p5: number;
  p25: number;
  p75: number;
  p95: number;
  minValor: number;
  maxValor: number;
  histograma: { bin: number; freq: number; rotulo: string }[];
}

function percentil(ordenados: number[], p: number): number {
  if (ordenados.length === 0) return 0;
  const idx = (p / 100) * (ordenados.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return ordenados[lo];
  return ordenados[lo] + (ordenados[hi] - ordenados[lo]) * (idx - lo);
}

export function rodarMonteCarlo(projeto: Projeto): ResultadoMonteCarlo {
  const { simulacoes, variaveis } = projeto.monteCarlo;
  const n = Math.max(50, Math.min(50000, simulacoes));
  const amostras: number[] = [];
  for (let i = 0; i < n; i++) {
    const clone: Projeto = JSON.parse(JSON.stringify(projeto));
    for (const v of variaveis) setByPath(clone, v.caminho, sample(v));
    const r = calcularInvolutivo(clone);
    amostras.push(r.valorTerrenoFinal);
  }
  const ordenados = [...amostras].sort((a, b) => a - b);
  const media = amostras.reduce((s, v) => s + v, 0) / n;
  const variancia = amostras.reduce((s, v) => s + (v - media) ** 2, 0) / n;
  const desvio = Math.sqrt(variancia);

  // Histograma com 20 bins
  const NB = 20;
  const min = ordenados[0];
  const max = ordenados[ordenados.length - 1];
  const passo = (max - min) / NB || 1;
  const hist = Array.from({ length: NB }, (_, i) => ({
    bin: i,
    freq: 0,
    rotulo: `${(min + i * passo).toFixed(0)}`,
  }));
  for (const v of amostras) {
    let idx = Math.floor((v - min) / passo);
    if (idx >= NB) idx = NB - 1;
    if (idx < 0) idx = 0;
    hist[idx].freq += 1;
  }

  return {
    amostras,
    media,
    mediana: percentil(ordenados, 50),
    desvio,
    p5: percentil(ordenados, 5),
    p25: percentil(ordenados, 25),
    p75: percentil(ordenados, 75),
    p95: percentil(ordenados, 95),
    minValor: min,
    maxValor: max,
    histograma: hist,
  };
}
