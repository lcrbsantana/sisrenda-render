"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { NumField, TextField } from "@/components/Fields";

export default function TerrenoPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;
  const t = projeto.terreno;

  return (
    <div>
      <h1 className="h1 mb-4">Terreno</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <h3 className="section-title">Localização</h3>
          <TextField label="Endereço" value={t.endereco} onChange={(v) => atualizar((p) => (p.terreno.endereco = v))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Município" value={t.municipio} onChange={(v) => atualizar((p) => (p.terreno.municipio = v))} />
            <TextField label="UF" value={t.uf} onChange={(v) => atualizar((p) => (p.terreno.uf = v.toUpperCase()))} />
          </div>
          <NumField
            label="Área do terreno"
            suffix="m²"
            value={t.area}
            onChange={(v) => atualizar((p) => (p.terreno.area = v))}
          />
          <TextField
            label="Zoneamento"
            value={t.zoneamento}
            onChange={(v) => atualizar((p) => (p.terreno.zoneamento = v))}
          />
        </div>

        <div className="card space-y-3">
          <h3 className="section-title">Parâmetros urbanísticos</h3>
          <NumField
            label="Coeficiente de aproveitamento"
            value={t.coefAproveitamento}
            onChange={(v) => atualizar((p) => (p.terreno.coefAproveitamento = v))}
            step={0.1}
          />
          <NumField
            label="Taxa de ocupação"
            suffix="%"
            value={t.taxaOcupacao}
            onChange={(v) => atualizar((p) => (p.terreno.taxaOcupacao = v))}
          />
          <TextField
            label="Recuos"
            value={t.recuos ?? ""}
            onChange={(v) => atualizar((p) => (p.terreno.recuos = v))}
          />
          <NumField
            label="Valor do terreno (quando conhecido)"
            suffix="R$"
            value={t.valorTerrenoEstimado ?? 0}
            onChange={(v) => atualizar((p) => (p.terreno.valorTerrenoEstimado = v))}
          />
          <div>
            <label className="label">Observações</label>
            <textarea
              className="input"
              rows={3}
              value={t.observacoes ?? ""}
              onChange={(e) => atualizar((p) => (p.terreno.observacoes = e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
