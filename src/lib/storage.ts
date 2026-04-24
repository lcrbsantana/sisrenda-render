// Persistência via API REST (Postgres no servidor) — versão Render
// As chamadas são assíncronas; cada função retorna Promise.

"use client";

import type { Projeto } from "./types";

const BASE = "/api/projetos";

async function jsonOrThrow<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

export async function listarProjetos(): Promise<Projeto[]> {
  try {
    const r = await fetch(BASE, { cache: "no-store" });
    return await jsonOrThrow<Projeto[]>(r);
  } catch {
    return [];
  }
}

export async function obterProjeto(id: string): Promise<Projeto | null> {
  try {
    const r = await fetch(`${BASE}/${id}`, { cache: "no-store" });
    if (r.status === 404) return null;
    return await jsonOrThrow<Projeto>(r);
  } catch {
    return null;
  }
}

export async function salvarProjeto(projeto: Projeto): Promise<Projeto> {
  projeto.atualizadoEm = new Date().toISOString();
  // tenta PUT; se 404, faz POST
  const put = await fetch(`${BASE}/${projeto.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projeto),
  });
  if (put.ok) return jsonOrThrow<Projeto>(put);
  const post = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projeto),
  });
  return jsonOrThrow<Projeto>(post);
}

export async function removerProjeto(id: string): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: "DELETE" });
}

export async function duplicarProjeto(id: string): Promise<Projeto | null> {
  const p = await obterProjeto(id);
  if (!p) return null;
  const novo: Projeto = {
    ...JSON.parse(JSON.stringify(p)),
    id: crypto.randomUUID(),
    nome: `${p.nome} (cópia)`,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
  return salvarProjeto(novo);
}

export function projetoVazio(nome = "Novo Empreendimento"): Projeto {
  const agora = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    nome,
    referencia: "",
    dataAvaliacao: new Date().toISOString().slice(0, 10),
    metodo: "involutivo",
    finalidade: "garantia",
    moeda: "BRL",
    responsavel: { nome: "", profissao: "Engenheiro", registro: "" },
    solicitante: "",
    terreno: {
      endereco: "",
      municipio: "",
      uf: "",
      area: 0,
      zoneamento: "",
      coefAproveitamento: 0,
      taxaOcupacao: 0,
      valorTerrenoEstimado: 0,
    },
    empreendimento: {
      tipo: "residencial-vertical",
      nome: "",
      prazoObraMeses: 24,
      prazoVendasMeses: 30,
      inicioProjeto: new Date().toISOString().slice(0, 7),
      areaConstruidaTotal: 0,
      areaPrivativaVendavel: 0,
      numUnidades: 0,
      vgvEstimado: 0,
    },
    custos: [],
    cronograma: { totalMeses: 24, curvaS: [] },
    unidades: [],
    curvaVendas: {
      prazoMeses: 30,
      sinalPct: 10,
      parcelasObraPct: 30,
      parcelasPosChavesPct: 20,
      chavesPct: 40,
      reajusteAnualPct: 7,
      distribuicaoVendas: "curvaS",
    },
    despesas: {
      corretagem: 4,
      publicidade: 2,
      impostoSobreVenda: 4,
      administracaoObra: 3,
      taxasLegais: 0,
      outrosCustosFixos: 0,
    },
    financiamento: {
      usaFinanciamento: false,
      percentualFinanciado: 0,
      taxaJurosAnual: 12,
      prazoAmortizacaoMeses: 120,
      carenciaMeses: 0,
    },
    involutivo: {
      taxaDescontoAnual: 14,
      margemLucro: 17,
      riscoNegocio: 3,
      liquidezPct: 10,
      elasticidade: 0,
    },
    capitalizacao: {
      rendaMensalBruta: 0,
      reajusteAluguelAnual: 6,
      vacanciaPct: 5,
      inadimplenciaPct: 2,
      despesasOperacionaisPct: 10,
      taxaCapitalizacao: 9,
      horizonteAnos: 10,
      valorResidualPct: 100,
    },
    monteCarlo: { simulacoes: 1000, variaveis: [] },
    cenarios: [],
    permutas: [],
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

export function exportarJSON(projeto: Projeto): string {
  return JSON.stringify(projeto, null, 2);
}

export function importarJSON(json: string): Projeto {
  return JSON.parse(json) as Projeto;
}
