"use client";

import { useProjeto } from "@/components/ProjetoProvider";
import { gerarFluxoCaixa } from "@/lib/cashflow";
import { calcularInvolutivo } from "@/lib/involutivo";
import { calcularCapitalizacao } from "@/lib/capitalizacao";
import { irr, npv, taxaMensalDeAnual } from "@/lib/finance";
import { brl, pct } from "@/lib/format";
import { exportarJSON } from "@/lib/storage";

export default function RelatoriosPage() {
  const { projeto } = useProjeto();
  if (!projeto) return null;

  const linhas = gerarFluxoCaixa(projeto);
  const invol = tryCalc(() => calcularInvolutivo(projeto));
  const cap = tryCalc(() => calcularCapitalizacao(projeto));
  const tMensal = taxaMensalDeAnual(projeto.involutivo.taxaDescontoAnual / 100);
  const fluxos = linhas.map((l) => l.fluxoLiquido);
  const vpl = npv(tMensal, fluxos);
  const tir = irr(fluxos);
  const tirAnual = tir != null ? Math.pow(1 + tir, 12) - 1 : null;

  const exportJSON = () => {
    const blob = new Blob([exportarJSON(projeto)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laudo_${projeto.nome.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    // Aba 1 — Capa
    const capa = [
      ["LAUDO DE AVALIAÇÃO DE EMPREENDIMENTO"],
      [],
      ["Nome", projeto.nome],
      ["Referência", projeto.referencia],
      ["Data da avaliação", projeto.dataAvaliacao],
      ["Solicitante", projeto.solicitante],
      ["Finalidade", projeto.finalidade],
      ["Método", projeto.metodo],
      [],
      ["Responsável Técnico", projeto.responsavel.nome],
      ["Profissão", projeto.responsavel.profissao],
      ["Registro", projeto.responsavel.registro],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(capa), "Capa");

    // Aba 2 — Terreno e empreendimento
    const ident = [
      ["TERRENO"],
      ["Endereço", projeto.terreno.endereco],
      ["Município/UF", `${projeto.terreno.municipio}/${projeto.terreno.uf}`],
      ["Área (m²)", projeto.terreno.area],
      ["Zoneamento", projeto.terreno.zoneamento],
      ["CA", projeto.terreno.coefAproveitamento],
      ["TO (%)", projeto.terreno.taxaOcupacao],
      [],
      ["EMPREENDIMENTO"],
      ["Tipo", projeto.empreendimento.tipo],
      ["Prazo obra (meses)", projeto.empreendimento.prazoObraMeses],
      ["Prazo vendas (meses)", projeto.empreendimento.prazoVendasMeses],
      ["Área construída (m²)", projeto.empreendimento.areaConstruidaTotal],
      ["Área privativa (m²)", projeto.empreendimento.areaPrivativaVendavel],
      ["Unidades", projeto.empreendimento.numUnidades],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ident), "Identificação");

    // Aba 3 — Custos
    const cust = [["Descrição", "Grupo", "Valor (R$)", "Mês início", "Mês fim", "Distribuição"]];
    projeto.custos.forEach((c) =>
      cust.push([c.descricao, c.grupo, String(c.valorTotal), String(c.mesInicio), String(c.mesFim), c.distribuicao])
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cust), "Custos");

    // Aba 4 — Unidades
    const uni = [["Tipologia", "Área", "Preço unit.", "Qtd", "VGV"]];
    projeto.unidades.forEach((u) =>
      uni.push([u.tipologia, String(u.area), String(u.precoUnitario), String(u.quantidade), String(u.precoUnitario * u.quantidade)])
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(uni), "Unidades");

    // Aba 5 — Fluxo de caixa mensal
    const fl = [
      ["Mês", "Receita", "Custo obra", "Desp. comerciais", "Desp. admin", "Impostos", "Financ +", "Financ -", "Terreno", "Líquido", "Acumulado"],
    ];
    linhas.forEach((l) =>
      fl.push([
        String(l.mes),
        l.receita.toFixed(2),
        l.custoObra.toFixed(2),
        l.despesasComerciais.toFixed(2),
        l.despesasAdministrativas.toFixed(2),
        l.impostos.toFixed(2),
        l.financiamentoIngresso.toFixed(2),
        l.financiamentoSaida.toFixed(2),
        l.terreno.toFixed(2),
        l.fluxoLiquido.toFixed(2),
        l.fluxoAcumulado.toFixed(2),
      ])
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fl), "Fluxo de Caixa");

    // Aba 6 — Indicadores
    const ind = [
      ["Indicador", "Valor"],
      ["VPL", vpl],
      ["TIR a.a.", tirAnual ?? "—"],
      ["TMA (%)", projeto.involutivo.taxaDescontoAnual],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ind), "Indicadores");

    // Aba 7 — Involutivo
    if (invol) {
      const iv = [
        ["Componente", "Valor (R$)"],
        ["VGV", invol.vgv],
        ["Custo total obra", invol.custoTotalObra],
        ["Lucro esperado", invol.lucroEsperado],
        ["VPL empreendimento", invol.vplEmpreendimento],
        ["Valor bruto terreno", invol.valorTerrenoInvolutivo],
        ["Ajuste liquidez", invol.ajusteLiquidez],
        ["Ajuste elasticidade", invol.ajusteElasticidade],
        ["VALOR FINAL DO TERRENO", invol.valorTerrenoFinal],
        ["R$/m²", invol.valorTerrenoPorM2],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(iv), "Involutivo");
    }

    // Aba 8 — Capitalização
    if (cap) {
      const c = [["Ano", "Receita bruta", "Vacância", "Inadimpl.", "Receita líquida", "Desp. oper.", "NOI"]];
      cap.linhas.forEach((l) =>
        c.push([
          String(l.ano),
          l.receitaBruta.toFixed(2),
          l.vacancia.toFixed(2),
          l.inadimplencia.toFixed(2),
          l.receitaLiquida.toFixed(2),
          l.despesasOperacionais.toFixed(2),
          l.noi.toFixed(2),
        ])
      );
      c.push([]);
      c.push(["Valor residual", cap.valorResidual.toFixed(2)]);
      c.push(["Valor presente (R$)", cap.valorPresente.toFixed(2)]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(c), "Capitalização");
    }

    // Aba 9 — Parâmetros
    const par = [
      ["TMA (%)", projeto.involutivo.taxaDescontoAnual],
      ["Margem lucro (%)", projeto.involutivo.margemLucro],
      ["Risco negócio (%)", projeto.involutivo.riscoNegocio],
      ["Liquidez (%)", projeto.involutivo.liquidezPct],
      ["Elasticidade", projeto.involutivo.elasticidade],
      [],
      ["Corretagem (%)", projeto.despesas.corretagem],
      ["Publicidade (%)", projeto.despesas.publicidade],
      ["Imposto venda (%)", projeto.despesas.impostoSobreVenda],
      ["Admin. obra (%)", projeto.despesas.administracaoObra],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(par), "Parâmetros");

    // Aba 10 — Cenários
    const cen = [["Nome", "Descrição", "Overrides (JSON)"]];
    projeto.cenarios.forEach((c) => cen.push([c.nome, c.descricao ?? "", JSON.stringify(c.overrides)]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cen), "Cenários");

    XLSX.writeFile(wb, `laudo_${projeto.nome.replace(/\s+/g, "_")}.xlsx`);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laudo de Avaliação — " + projeto.nome, 14, 18);
    doc.setFontSize(10);
    doc.text(`Referência: ${projeto.referencia || "—"}`, 14, 26);
    doc.text(`Data: ${new Date(projeto.dataAvaliacao).toLocaleDateString("pt-BR")}`, 14, 32);
    doc.text(`Responsável: ${projeto.responsavel.nome} (${projeto.responsavel.registro})`, 14, 38);

    autoTable(doc, {
      startY: 46,
      head: [["Indicador", "Valor"]],
      body: [
        ["VGV", brl(projeto.unidades.reduce((s, u) => s + u.precoUnitario * u.quantidade, 0))],
        ["Custo total obra", brl(projeto.custos.reduce((s, c) => s + c.valorTotal, 0))],
        ["VPL (TMA)", brl(vpl)],
        ["TIR a.a.", tirAnual != null ? pct(tirAnual * 100) : "—"],
        ["Valor terreno (Involutivo)", invol ? brl(invol.valorTerrenoFinal) : "—"],
        ["Valor por Renda (DCF)", cap ? brl(cap.valorPresente) : "—"],
      ],
    });

    doc.save(`laudo_${projeto.nome.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div>
      <h1 className="h1 mb-4">Relatórios</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <h3 className="section-title">PDF resumido</h3>
          <p className="text-sm text-slate-600 mb-3">Síntese de indicadores e conclusão — para anexo ao laudo.</p>
          <button className="btn-primary w-full" onClick={exportPDF}>
            Gerar PDF
          </button>
        </div>
        <div className="card">
          <h3 className="section-title">Excel completo (10 abas)</h3>
          <p className="text-sm text-slate-600 mb-3">Todas as premissas, fluxos, parâmetros e cenários.</p>
          <button className="btn-primary w-full" onClick={exportExcel}>
            Gerar XLSX
          </button>
        </div>
        <div className="card">
          <h3 className="section-title">Backup JSON</h3>
          <p className="text-sm text-slate-600 mb-3">Exportar dados do projeto (reimportável).</p>
          <button className="btn-secondary w-full" onClick={exportJSON}>
            Exportar JSON
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Pré-visualização do resumo</h3>
        <dl className="text-sm grid grid-cols-2 md:grid-cols-3 gap-y-1">
          <dt className="text-slate-500">VPL (TMA {pct(projeto.involutivo.taxaDescontoAnual)})</dt>
          <dd className="md:col-span-2 font-semibold">{brl(vpl)}</dd>
          <dt className="text-slate-500">TIR a.a.</dt>
          <dd className="md:col-span-2">{tirAnual != null ? pct(tirAnual * 100) : "—"}</dd>
          <dt className="text-slate-500">Valor terreno (Involutivo)</dt>
          <dd className="md:col-span-2">{invol ? brl(invol.valorTerrenoFinal) : "—"}</dd>
          <dt className="text-slate-500">Valor por Renda</dt>
          <dd className="md:col-span-2">{cap ? brl(cap.valorPresente) : "—"}</dd>
        </dl>
      </div>
    </div>
  );
}

function tryCalc<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
