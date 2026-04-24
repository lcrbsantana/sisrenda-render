"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { NumField, TextField, SelectField } from "@/components/Fields";
import type { TipoEmpreendimento } from "@/lib/types";

const TIPOS: { v: TipoEmpreendimento; l: string }[] = [
  { v: "residencial-vertical", l: "Residencial Vertical" },
  { v: "residencial-horizontal", l: "Residencial Horizontal" },
  { v: "comercial", l: "Comercial" },
  { v: "misto", l: "Misto" },
  { v: "galpao-logistico", l: "Galpão / Logístico" },
  { v: "hotel", l: "Hotel" },
  { v: "shopping", l: "Shopping" },
  { v: "loteamento", l: "Loteamento" },
];

export default function EmpreendimentoPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;
  const e = projeto.empreendimento;

  return (
    <div>
      <h1 className="h1 mb-4">Empreendimento</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <h3 className="section-title">Dados gerais</h3>
          <TextField label="Nome do empreendimento" value={e.nome} onChange={(v) => atualizar((p) => (p.empreendimento.nome = v))} />
          <SelectField
            label="Tipo"
            value={e.tipo}
            options={TIPOS}
            onChange={(v) => atualizar((p) => (p.empreendimento.tipo = v))}
          />
          <TextField
            label="Início do projeto (AAAA-MM)"
            value={e.inicioProjeto}
            onChange={(v) => atualizar((p) => (p.empreendimento.inicioProjeto = v))}
          />
          <NumField
            label="Nº de unidades"
            step={1}
            value={e.numUnidades}
            onChange={(v) => atualizar((p) => (p.empreendimento.numUnidades = v))}
          />
        </div>

        <div className="card space-y-3">
          <h3 className="section-title">Áreas e prazos</h3>
          <NumField
            label="Área construída total"
            suffix="m²"
            value={e.areaConstruidaTotal}
            onChange={(v) => atualizar((p) => (p.empreendimento.areaConstruidaTotal = v))}
          />
          <NumField
            label="Área privativa vendável"
            suffix="m²"
            value={e.areaPrivativaVendavel}
            onChange={(v) => atualizar((p) => (p.empreendimento.areaPrivativaVendavel = v))}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumField
              label="Prazo de obra"
              suffix="meses"
              step={1}
              value={e.prazoObraMeses}
              onChange={(v) => atualizar((p) => (p.empreendimento.prazoObraMeses = v))}
            />
            <NumField
              label="Prazo de vendas"
              suffix="meses"
              step={1}
              value={e.prazoVendasMeses}
              onChange={(v) => atualizar((p) => (p.empreendimento.prazoVendasMeses = v))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
