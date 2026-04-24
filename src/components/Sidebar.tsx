"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface Props {
  projetoId?: string;
  projetoNome?: string;
}

const SECOES: { titulo: string; itens: { label: string; slug: string }[] }[] = [
  {
    titulo: "Identificação",
    itens: [
      { label: "Visão Geral", slug: "" },
      { label: "Dados do Projeto", slug: "dados" },
      { label: "Terreno", slug: "terreno" },
      { label: "Empreendimento", slug: "empreendimento" },
    ],
  },
  {
    titulo: "Entradas",
    itens: [
      { label: "Custos de Obra", slug: "custos" },
      { label: "Cronograma Físico-Financeiro", slug: "cronograma" },
      { label: "Unidades / Vendas", slug: "vendas" },
      { label: "Curva de Pagamentos", slug: "curva-vendas" },
      { label: "Despesas", slug: "despesas" },
      { label: "Financiamento", slug: "financiamento" },
      { label: "Permuta", slug: "permuta" },
    ],
  },
  {
    titulo: "Análise",
    itens: [
      { label: "Fluxo de Caixa", slug: "fluxo-caixa" },
      { label: "Indicadores (VPL/TIR)", slug: "resultado" },
      { label: "Método Involutivo", slug: "involutivo" },
      { label: "Capitalização da Renda", slug: "capitalizacao-renda" },
    ],
  },
  {
    titulo: "Avançado",
    itens: [
      { label: "Cenários", slug: "cenarios" },
      { label: "Simulação de Monte Carlo", slug: "monte-carlo" },
      { label: "Análise de Pareto", slug: "pareto" },
      { label: "Checklist de Validação", slug: "checklist" },
      { label: "Relatórios", slug: "relatorios" },
    ],
  },
];

export function Sidebar({ projetoId, projetoNome }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-900 text-slate-200 min-h-screen flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800">
        <Link href="/" className="block">
          <div className="text-brand-400 font-bold text-lg tracking-tight">SisRenda Web</div>
          <div className="text-xs text-slate-400">Avaliação de Empreendimentos</div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <Link
          href="/"
          className={clsx(
            "block px-2 py-1.5 rounded text-sm",
            pathname === "/" ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800"
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/projetos"
          className={clsx(
            "block px-2 py-1.5 mt-1 rounded text-sm",
            pathname?.startsWith("/projetos") && !projetoId
              ? "bg-brand-600 text-white"
              : "text-slate-300 hover:bg-slate-800"
          )}
        >
          Projetos
        </Link>

        {projetoId && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="px-2 py-1">
              <div className="text-xs text-slate-500 uppercase">Projeto ativo</div>
              <div className="text-sm text-brand-300 font-medium truncate">
                {projetoNome || "—"}
              </div>
            </div>
            {SECOES.map((sec) => (
              <div key={sec.titulo} className="mt-3">
                <div className="text-[10px] font-semibold text-slate-500 uppercase px-2 mb-1">
                  {sec.titulo}
                </div>
                {sec.itens.map((it) => {
                  const href = `/projetos/${projetoId}${it.slug ? `/${it.slug}` : ""}`;
                  const ativo = pathname === href;
                  return (
                    <Link
                      key={it.slug || "home"}
                      href={href}
                      className={clsx(
                        "block px-2 py-1 rounded text-sm",
                        ativo
                          ? "bg-brand-600 text-white"
                          : "text-slate-300 hover:bg-slate-800"
                      )}
                    >
                      {it.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </nav>

      <div className="px-5 py-3 border-t border-slate-800 text-[11px] text-slate-500">
        v0.1 · MVP · Render + Postgres
      </div>
    </aside>
  );
}
