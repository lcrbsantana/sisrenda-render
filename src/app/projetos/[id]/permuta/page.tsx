"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { brl } from "@/lib/format";
import type { ItemPermuta } from "@/lib/types";

export default function PermutaPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;

  const totalPermuta = projeto.permutas.reduce((s, p) => s + p.valor, 0);

  const add = () =>
    atualizar((p) =>
      p.permutas.push({
        id: crypto.randomUUID(),
        descricao: "Permuta com proprietário do terreno",
        valor: 0,
      })
    );

  const update = (id: string, k: keyof ItemPermuta, v: any) =>
    atualizar((p) => {
      const it = p.permutas.find((x) => x.id === id);
      if (it) (it as any)[k] = v;
    });

  const remove = (id: string) => atualizar((p) => (p.permutas = p.permutas.filter((x) => x.id !== id)));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="h1">Permuta</h1>
        <button className="btn-primary" onClick={add}>
          + Adicionar permuta
        </button>
      </div>

      <div className="card mb-4">
        <p className="text-sm text-slate-600">
          Módulo de permuta — registre trocas de unidades/custos por itens do empreendimento (ex.: permuta física no
          terreno, dação em pagamento). Os valores são informativos no MVP e podem ser usados como overrides em cenários.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Vincular item de custo</th>
              <th>Vincular unidade</th>
              <th className="text-right">Valor (R$)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projeto.permutas.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-6">
                  Nenhuma permuta cadastrada.
                </td>
              </tr>
            )}
            {projeto.permutas.map((perm) => (
              <tr key={perm.id}>
                <td>
                  <input
                    className="input"
                    value={perm.descricao}
                    onChange={(e) => update(perm.id, "descricao", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={perm.itemCustoId ?? ""}
                    onChange={(e) => update(perm.id, "itemCustoId", e.target.value || undefined)}
                  >
                    <option value="">—</option>
                    {projeto.custos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.descricao}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="input"
                    value={perm.unidadeId ?? ""}
                    onChange={(e) => update(perm.id, "unidadeId", e.target.value || undefined)}
                  >
                    <option value="">—</option>
                    {projeto.unidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.tipologia}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="input text-right"
                    type="number"
                    value={perm.valor}
                    onChange={(e) => update(perm.id, "valor", parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <button className="btn-danger" onClick={() => remove(perm.id)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={3} className="text-right">
                Total:
              </td>
              <td className="text-right">{brl(totalPermuta)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
