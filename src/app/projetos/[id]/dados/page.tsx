"use client";

import { useProjeto } from "@/components/ProjetoProvider";

export default function DadosPage() {
  const { projeto, atualizar } = useProjeto();
  if (!projeto) return null;

  return (
    <div>
      <h1 className="h1 mb-4">Dados do Projeto</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <h3 className="section-title">Identificação</h3>
          <Field label="Nome do projeto" value={projeto.nome} onChange={(v) => atualizar((p) => (p.nome = v))} />
          <Field
            label="Referência / nº do laudo"
            value={projeto.referencia}
            onChange={(v) => atualizar((p) => (p.referencia = v))}
          />
          <Field
            label="Data da avaliação"
            type="date"
            value={projeto.dataAvaliacao}
            onChange={(v) => atualizar((p) => (p.dataAvaliacao = v))}
          />
          <Field
            label="Solicitante"
            value={projeto.solicitante}
            onChange={(v) => atualizar((p) => (p.solicitante = v))}
          />
          <SelectField
            label="Finalidade"
            value={projeto.finalidade}
            options={["garantia", "venda", "compra", "judicial", "contábil", "outro"]}
            onChange={(v) => atualizar((p) => (p.finalidade = v))}
          />
          <SelectField
            label="Método"
            value={projeto.metodo}
            options={[
              { v: "involutivo", l: "Involutivo" },
              { v: "capitalizacao-renda", l: "Capitalização da Renda" },
              { v: "ambos", l: "Ambos" },
            ]}
            onChange={(v) => atualizar((p) => (p.metodo = v as any))}
          />
        </div>

        <div className="card space-y-3">
          <h3 className="section-title">Responsável Técnico</h3>
          <Field
            label="Nome"
            value={projeto.responsavel.nome}
            onChange={(v) => atualizar((p) => (p.responsavel.nome = v))}
          />
          <Field
            label="Profissão"
            value={projeto.responsavel.profissao}
            onChange={(v) => atualizar((p) => (p.responsavel.profissao = v))}
          />
          <Field
            label="Registro (CREA/CAU)"
            value={projeto.responsavel.registro}
            onChange={(v) => atualizar((p) => (p.responsavel.registro = v))}
          />
          <Field
            label="E-mail"
            value={projeto.responsavel.email ?? ""}
            onChange={(v) => atualizar((p) => (p.responsavel.email = v))}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: (string | { v: string; l: string })[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.v;
          const l = typeof o === "string" ? o : o.l;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </div>
  );
}
