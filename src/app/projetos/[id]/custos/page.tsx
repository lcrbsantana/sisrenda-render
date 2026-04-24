"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { brl } from "@/lib/format";
import type { ItemCusto } from "@/lib/types";

const GRUPOS: { v: ItemCusto["grupo"]; l: string }[] = [
  { v: "construcao", l: "Construção" },
  { v: "projetos", l: "Projetos" },
  { v: "legal", l: "Legal/Cartório" },
  { v: "marketing", l: "Marketing" },
  { v: "administrativo", l: "Administrativo" },
  { v: "outros", l: "Outros" },
];

export default function CustosPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;
  const total = projeto.custos.reduce((s, c) => s + c.valorTotal, 0);

  const add = () =>
    atualizar((p) =>
      p.custos.push({
        id: crypto.randomUUID(),
        descricao: "Novo item",
        grupo: "construcao",
        valorTotal: 0,
        mesInicio: 1,
        mesFim: p.empreendimento.prazoObraMeses,
        distribuicao: "curvaS",
      })
    );
  const remove = (id: string) => atualizar((p) => (p.custos = p.custos.filter((c) => c.id !== id)));
  const update = (id: string, k: keyof ItemCusto, v: any) =>
    atualizar((p) => {
      const c = p.custos.find((x) => x.id === id);
      if (c) (c as any)[k] = v;
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="h1">Custos de Obra</h1>
        <button className="btn-primary" onClick={add}>
          + Adicionar item
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Grupo</th>
              <th className="text-right">Valor total (R$)</th>
              <th>Mês início</th>
              <th>Mês fim</th>
              <th>Distribuição</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projeto.custos.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-slate-500 py-6">
                  Nenhum item de custo. Clique em &quot;+ Adicionar item&quot;.
                </td>
              </tr>
            )}
            {projeto.custos.map((c) => (
              <tr key={c.id}>
                <td>
                  <input
                    className="input"
                    value={c.descricao}
                    onChange={(e) => update(c.id, "descricao", e.target.value)}
                  />
                </td>
                <td>
                  <select className="input" value={c.grupo} onChange={(e) => update(c.id, "grupo", e.target.value)}>
                    {GRUPOS.map((g) => (
                      <option key={g.v} value={g.v}>
                        {g.l}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="input text-right"
                    type="number"
                    value={c.valorTotal}
                    onChange={(e) => update(c.id, "valorTotal", parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="w-24">
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={c.mesInicio}
                    onChange={(e) => update(c.id, "mesInicio", parseInt(e.target.value) || 1)}
                  />
                </td>
                <td className="w-24">
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={c.mesFim}
                    onChange={(e) => update(c.id, "mesFim", parseInt(e.target.value) || 1)}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={c.distribuicao}
                    onChange={(e) => update(c.id, "distribuicao", e.target.value)}
                  >
                    <option value="linear">Linear</option>
                    <option value="curvaS">Curva S</option>
                    <option value="customizada">Customizada</option>
                  </select>
                </td>
                <td>
                  <button className="btn-danger" onClick={() => remove(c.id)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={2} className="text-right">
                Total:
              </td>
              <td className="text-right">{brl(total)}</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
