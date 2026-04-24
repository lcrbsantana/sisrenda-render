"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Kpi } from "@/components/Kpi";
import { listarProjetos, projetoVazio, salvarProjeto } from "@/lib/storage";
import type { Projeto } from "@/lib/types";
import { calcularInvolutivo } from "@/lib/involutivo";
import { brl } from "@/lib/format";

export default function DashboardPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  useEffect(() => {
    listarProjetos().then(setProjetos);
  }, []);

  const totalProjetos = projetos.length;
  const totalVGV = projetos.reduce(
    (s, p) => s + p.unidades.reduce((u, x) => u + x.precoUnitario * x.quantidade, 0),
    0
  );
  const terrenoMedio =
    projetos.length > 0
      ? projetos.reduce((s, p) => {
          try {
            return s + calcularInvolutivo(p).valorTerrenoFinal;
          } catch {
            return s;
          }
        }, 0) / projetos.length
      : 0;

  const criarDemo = async () => {
    const p = projetoVazio("Projeto Demo — Residencial");
    p.responsavel = { nome: "Eng. Exemplo", profissao: "Engenheiro Civil", registro: "CREA 00000" };
    p.solicitante = "Incorporadora Demo S/A";
    p.terreno = {
      endereco: "Av. Paulista, 1000",
      municipio: "São Paulo",
      uf: "SP",
      area: 1500,
      zoneamento: "ZM-3",
      coefAproveitamento: 4,
      taxaOcupacao: 70,
      valorTerrenoEstimado: 0,
    };
    p.empreendimento.prazoObraMeses = 30;
    p.empreendimento.prazoVendasMeses = 36;
    p.empreendimento.areaConstruidaTotal = 6000;
    p.empreendimento.areaPrivativaVendavel = 4200;
    p.empreendimento.numUnidades = 60;

    p.custos = [
      {
        id: crypto.randomUUID(),
        descricao: "Custo de construção",
        grupo: "construcao",
        valorTotal: 12_000_000,
        mesInicio: 1,
        mesFim: 30,
        distribuicao: "curvaS",
      },
      {
        id: crypto.randomUUID(),
        descricao: "Projetos e licenças",
        grupo: "projetos",
        valorTotal: 500_000,
        mesInicio: 1,
        mesFim: 6,
        distribuicao: "linear",
      },
    ];
    p.unidades = [
      { id: crypto.randomUUID(), tipologia: "2 dorms", area: 55, precoUnitario: 450_000, quantidade: 40 },
      { id: crypto.randomUUID(), tipologia: "3 dorms", area: 80, precoUnitario: 700_000, quantidade: 20 },
    ];
    await salvarProjeto(p);
    setProjetos(await listarProjetos());
  };

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="h1">Dashboard</h1>
          <p className="text-sm text-slate-600">
            SisRenda Web — avaliação de empreendimentos imobiliários
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={criarDemo}>
            + Projeto Demo
          </button>
          <Link href="/projetos" className="btn-primary">
            Ver projetos
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Kpi label="Projetos cadastrados" value={String(totalProjetos)} />
        <Kpi label="VGV total da carteira" value={brl(totalVGV)} />
        <Kpi
          label="Valor médio terreno (involutivo)"
          value={brl(terrenoMedio)}
          tone="positive"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="h2">Projetos recentes</h2>
          <Link href="/projetos" className="text-sm text-brand-600 hover:underline">
            Todos →
          </Link>
        </div>
        {projetos.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">
            Nenhum projeto cadastrado. Clique em &quot;+ Projeto Demo&quot; ou crie um novo em Projetos.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Referência</th>
                <th>Método</th>
                <th>Finalidade</th>
                <th>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {projetos
                .slice()
                .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
                .slice(0, 8)
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link className="text-brand-700 hover:underline font-medium" href={`/projetos/${p.id}`}>
                        {p.nome}
                      </Link>
                    </td>
                    <td>{p.referencia || "—"}</td>
                    <td className="capitalize">{p.metodo.replace("-", " ")}</td>
                    <td>{p.finalidade}</td>
                    <td>{new Date(p.atualizadoEm).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title">Métodos suportados</h3>
          <ul className="text-sm text-slate-700 space-y-1 list-disc ml-5">
            <li>Método Involutivo (NBR 14.653-2)</li>
            <li>Método da Capitalização da Renda (NBR 14.653-4)</li>
            <li>Fluxo de caixa dinâmico mensal</li>
            <li>VPL, TIR, Payback simples e descontado</li>
            <li>Simulação de Monte Carlo</li>
            <li>Análise de sensibilidade (Pareto)</li>
            <li>Múltiplos cenários com overrides</li>
            <li>Permuta física e financeira</li>
          </ul>
        </div>
        <div className="card">
          <h3 className="section-title">Workflow recomendado</h3>
          <ol className="text-sm text-slate-700 space-y-1 list-decimal ml-5">
            <li>Criar projeto e preencher identificação</li>
            <li>Cadastrar terreno e empreendimento</li>
            <li>Lançar custos e cronograma físico-financeiro</li>
            <li>Cadastrar unidades e curva de pagamentos</li>
            <li>Configurar despesas, financiamento e permuta</li>
            <li>Rodar análises (fluxo, involutivo, capitalização)</li>
            <li>Avaliar riscos (Monte Carlo e Pareto)</li>
            <li>Gerar relatórios</li>
          </ol>
        </div>
      </div>
    </Shell>
  );
}
