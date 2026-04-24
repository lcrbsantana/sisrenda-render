"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { rodarChecklist } from "@/lib/checklist";
import clsx from "clsx";

export default function ChecklistPage() {
  const { projeto } = useProjeto();
  if (!projeto) return null;

  const itens = rodarChecklist(projeto);
  const porModulo = itens.reduce((acc, it) => {
    (acc[it.modulo] ||= []).push(it);
    return acc;
  }, {} as Record<string, typeof itens>);

  const total = itens.length;
  const ok = itens.filter((i) => i.ok).length;
  const pct = total > 0 ? Math.round((ok / total) * 100) : 0;
  const criticosPendentes = itens.filter((i) => !i.ok && i.critico).length;

  return (
    <div>
      <h1 className="h1 mb-4">Checklist de Validação</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="card">
          <div className="kpi-label">Completude</div>
          <div className="kpi-value">
            {ok} / {total}
          </div>
          <div className="w-full bg-slate-200 h-2 rounded mt-2">
            <div className="bg-emerald-500 h-2 rounded" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="card">
          <div className="kpi-label">% concluído</div>
          <div className="kpi-value">{pct}%</div>
        </div>
        <div className="card">
          <div className="kpi-label">Críticos pendentes</div>
          <div className={`kpi-value ${criticosPendentes > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {criticosPendentes}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(porModulo).map(([modulo, lista]) => (
          <div key={modulo} className="card">
            <h3 className="section-title">{modulo}</h3>
            <ul className="space-y-1">
              {lista.map((it) => (
                <li key={it.id} className="flex items-start gap-2 text-sm">
                  <span
                    className={clsx(
                      "mt-0.5 w-5 h-5 rounded flex items-center justify-center text-xs font-bold",
                      it.ok
                        ? "bg-emerald-100 text-emerald-700"
                        : it.critico
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {it.ok ? "✓" : it.critico ? "✗" : "!"}
                  </span>
                  <span className={it.ok ? "text-slate-700" : "text-slate-900 font-medium"}>{it.descricao}</span>
                  {!it.critico && <span className="text-xs text-slate-400">(opcional)</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
