"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { brl, int } from "@/lib/format";
import type { UnidadeVenda } from "@/lib/types";

export default function VendasPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;

  const vgv = projeto.unidades.reduce((s, u) => s + u.precoUnitario * u.quantidade, 0);
  const areaTotal = projeto.unidades.reduce((s, u) => s + u.area * u.quantidade, 0);
  const qtd = projeto.unidades.reduce((s, u) => s + u.quantidade, 0);

  const add = () =>
    atualizar((p) =>
      p.unidades.push({
        id: crypto.randomUUID(),
        tipologia: "Tipo A",
        area: 50,
        precoUnitario: 0,
        quantidade: 1,
      })
    );
  const remove = (id: string) => atualizar((p) => (p.unidades = p.unidades.filter((u) => u.id !== id)));
  const update = (id: string, k: keyof UnidadeVenda, v: any) =>
    atualizar((p) => {
      const u = p.unidades.find((x) => x.id === id);
      if (u) (u as any)[k] = v;
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="h1">Unidades / Vendas</h1>
        <button className="btn-primary" onClick={add}>
          + Adicionar tipologia
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="card">
          <div className="kpi-label">VGV</div>
          <div className="kpi-value">{brl(vgv)}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Unidades</div>
          <div className="kpi-value">{int(qtd)}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Área privativa total</div>
          <div className="kpi-value">{int(areaTotal)} m²</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Tipologia</th>
              <th className="text-right">Área (m²)</th>
              <th className="text-right">Preço unit. (R$)</th>
              <th className="text-right">Qtd</th>
              <th className="text-right">VGV tipologia</th>
              <th className="text-right">R$/m²</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projeto.unidades.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-slate-500 py-6">
                  Nenhuma tipologia cadastrada.
                </td>
              </tr>
            )}
            {projeto.unidades.map((u) => {
              const vgvLote = u.precoUnitario * u.quantidade;
              const rm2 = u.area > 0 ? u.precoUnitario / u.area : 0;
              return (
                <tr key={u.id}>
                  <td>
                    <input className="input" value={u.tipologia} onChange={(e) => update(u.id, "tipologia", e.target.value)} />
                  </td>
                  <td>
                    <input
                      className="input text-right"
                      type="number"
                      value={u.area}
                      onChange={(e) => update(u.id, "area", parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      className="input text-right"
                      type="number"
                      value={u.precoUnitario}
                      onChange={(e) => update(u.id, "precoUnitario", parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      className="input text-right"
                      type="number"
                      value={u.quantidade}
                      onChange={(e) => update(u.id, "quantidade", parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className="text-right">{brl(vgvLote)}</td>
                  <td className="text-right">{brl(rm2)}</td>
                  <td>
                    <button className="btn-danger" onClick={() => remove(u.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
