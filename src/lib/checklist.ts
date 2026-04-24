// Checklist — valida se o projeto tem todos os dados necessários

import type { Projeto } from "./types";

export interface ItemChecklist {
  id: string;
  modulo: string;
  descricao: string;
  ok: boolean;
  critico: boolean;
}

export function rodarChecklist(p: Projeto): ItemChecklist[] {
  const itens: ItemChecklist[] = [];
  const add = (id: string, modulo: string, descricao: string, ok: boolean, critico = true) =>
    itens.push({ id, modulo, descricao, ok, critico });

  // Identificação
  add("id-nome", "Identificação", "Nome do projeto informado", !!p.nome);
  add("id-ref", "Identificação", "Referência / nº do laudo", !!p.referencia, false);
  add("id-data", "Identificação", "Data de avaliação", !!p.dataAvaliacao);
  add("id-resp", "Identificação", "Responsável técnico (CREA/CAU)", !!p.responsavel?.registro);

  // Terreno
  add("terr-area", "Terreno", "Área do terreno (m²) > 0", p.terreno.area > 0);
  add("terr-endereco", "Terreno", "Endereço do terreno", !!p.terreno.endereco);
  add("terr-ca", "Terreno", "Coef. de aproveitamento > 0", p.terreno.coefAproveitamento > 0, false);

  // Empreendimento
  add("emp-prazo", "Empreendimento", "Prazo de obra > 0", p.empreendimento.prazoObraMeses > 0);
  add("emp-vendas", "Empreendimento", "Prazo de vendas > 0", p.empreendimento.prazoVendasMeses > 0);
  add("emp-uni", "Empreendimento", "Número de unidades > 0", p.empreendimento.numUnidades > 0, false);

  // Custos
  const totalCusto = p.custos.reduce((s, c) => s + c.valorTotal, 0);
  add("cust-total", "Custos", "Custos cadastrados (> 0)", totalCusto > 0);
  add("cust-construcao", "Custos", "Ao menos 1 item do grupo 'construção'", p.custos.some((c) => c.grupo === "construcao"));

  // Vendas
  add("und-qtd", "Vendas", "Ao menos 1 unidade cadastrada", p.unidades.length > 0);
  const vgv = p.unidades.reduce((s, u) => s + u.precoUnitario * u.quantidade, 0);
  add("und-vgv", "Vendas", "VGV > 0", vgv > 0);
  const somaPct =
    p.curvaVendas.sinalPct +
    p.curvaVendas.parcelasObraPct +
    p.curvaVendas.chavesPct +
    p.curvaVendas.parcelasPosChavesPct;
  add("cv-soma", "Vendas", `Soma da curva de pagamento = 100% (atual: ${somaPct.toFixed(1)}%)`, Math.abs(somaPct - 100) < 0.5);

  // Despesas
  add("desp-imp", "Despesas", "Imposto sobre venda informado", p.despesas.impostoSobreVenda > 0, false);

  // Parâmetros
  add("inv-tma", "Parâmetros", "TMA do Método Involutivo > 0", p.involutivo.taxaDescontoAnual > 0);
  add("inv-margem", "Parâmetros", "Margem de lucro do empreendedor", p.involutivo.margemLucro > 0, false);

  return itens;
}
