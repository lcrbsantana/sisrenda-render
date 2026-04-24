import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function projetoDemo() {
  const agora = new Date().toISOString();
  const custoObraId = "00000000-0000-0000-0000-000000000001";
  const custoProjetoId = "00000000-0000-0000-0000-000000000002";
  const uni1 = "00000000-0000-0000-0000-000000000101";
  const uni2 = "00000000-0000-0000-0000-000000000102";

  return {
    nome: "Projeto Demo — Residencial",
    referencia: "DEMO-001",
    dataAvaliacao: new Date().toISOString().slice(0, 10),
    metodo: "involutivo",
    finalidade: "garantia",
    dados: {
      // Projeto completo (schema ProjectoT) no campo JSON
      referencia: "DEMO-001",
      dataAvaliacao: new Date().toISOString().slice(0, 10),
      metodo: "involutivo",
      finalidade: "garantia",
      moeda: "BRL",
      responsavel: {
        nome: "Eng. Exemplo",
        profissao: "Engenheiro Civil",
        registro: "CREA 00000",
      },
      solicitante: "Incorporadora Demo S/A",
      terreno: {
        endereco: "Av. Paulista, 1000",
        municipio: "São Paulo",
        uf: "SP",
        area: 1500,
        zoneamento: "ZM-3",
        coefAproveitamento: 4,
        taxaOcupacao: 70,
        valorTerrenoEstimado: 0,
      },
      empreendimento: {
        tipo: "residencial-vertical",
        nome: "Residencial Demo",
        prazoObraMeses: 30,
        prazoVendasMeses: 36,
        inicioProjeto: new Date().toISOString().slice(0, 7),
        areaConstruidaTotal: 6000,
        areaPrivativaVendavel: 4200,
        numUnidades: 60,
        vgvEstimado: 0,
      },
      custos: [
        {
          id: custoObraId,
          descricao: "Custo de construção",
          grupo: "construcao",
          valorTotal: 12_000_000,
          mesInicio: 1,
          mesFim: 30,
          distribuicao: "curvaS",
        },
        {
          id: custoProjetoId,
          descricao: "Projetos e licenças",
          grupo: "projetos",
          valorTotal: 500_000,
          mesInicio: 1,
          mesFim: 6,
          distribuicao: "linear",
        },
      ],
      cronograma: { totalMeses: 30, curvaS: [] },
      unidades: [
        { id: uni1, tipologia: "2 dorms", area: 55, precoUnitario: 450_000, quantidade: 40 },
        { id: uni2, tipologia: "3 dorms", area: 80, precoUnitario: 700_000, quantidade: 20 },
      ],
      curvaVendas: {
        prazoMeses: 36,
        sinalPct: 10,
        parcelasObraPct: 30,
        parcelasPosChavesPct: 20,
        chavesPct: 40,
        reajusteAnualPct: 7,
        distribuicaoVendas: "curvaS",
      },
      despesas: {
        corretagem: 4,
        publicidade: 2,
        impostoSobreVenda: 4,
        administracaoObra: 3,
        taxasLegais: 0,
        outrosCustosFixos: 0,
      },
      financiamento: {
        usaFinanciamento: false,
        percentualFinanciado: 0,
        taxaJurosAnual: 12,
        prazoAmortizacaoMeses: 120,
        carenciaMeses: 0,
      },
      involutivo: {
        taxaDescontoAnual: 14,
        margemLucro: 17,
        riscoNegocio: 3,
        liquidezPct: 10,
        elasticidade: 0,
      },
      capitalizacao: {
        rendaMensalBruta: 0,
        reajusteAluguelAnual: 6,
        vacanciaPct: 5,
        inadimplenciaPct: 2,
        despesasOperacionaisPct: 10,
        taxaCapitalizacao: 9,
        horizonteAnos: 10,
        valorResidualPct: 100,
      },
      monteCarlo: { simulacoes: 1000, variaveis: [] },
      cenarios: [],
      permutas: [],
      criadoEm: agora,
      atualizadoEm: agora,
    },
  };
}

async function main() {
  const existing = await prisma.projeto.findFirst({ where: { referencia: "DEMO-001" } });
  if (existing) {
    console.log("✓ Projeto demo já existe (referência DEMO-001). Nada a fazer.");
    return;
  }
  const demo = projetoDemo();
  const created = await prisma.projeto.create({ data: demo });
  console.log("✓ Projeto demo criado:", created.id, "—", created.nome);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
