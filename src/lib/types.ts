// Modelo de dados do SisRenda Web

export type Moeda = "BRL" | "USD" | "EUR";

export type TipoEmpreendimento =
  | "residencial-vertical"
  | "residencial-horizontal"
  | "comercial"
  | "misto"
  | "galpao-logistico"
  | "hotel"
  | "shopping"
  | "loteamento";

export type MetodoAvaliacao = "involutivo" | "capitalizacao-renda" | "ambos";

export interface Responsavel {
  nome: string;
  profissao: string;
  registro: string; // CREA/CAU
  email?: string;
}

export interface Terreno {
  endereco: string;
  municipio: string;
  uf: string;
  area: number; // m²
  zoneamento: string;
  coefAproveitamento: number; // CA
  taxaOcupacao: number; // TO (%)
  recuos?: string;
  observacoes?: string;
  valorTerrenoEstimado?: number; // R$ (opcional — para capitalização)
}

export interface Empreendimento {
  tipo: TipoEmpreendimento;
  nome: string;
  prazoObraMeses: number;
  prazoVendasMeses: number;
  inicioProjeto: string; // YYYY-MM
  areaConstruidaTotal: number; // m²
  areaPrivativaVendavel: number; // m²
  numUnidades: number;
  vgvEstimado: number; // R$ (preenchido pelo módulo de vendas)
}

export interface ItemCusto {
  id: string;
  descricao: string;
  grupo: "construcao" | "projetos" | "legal" | "marketing" | "administrativo" | "outros";
  valorTotal: number; // R$
  mesInicio: number; // 1..N
  mesFim: number;   // 1..N
  distribuicao: "linear" | "curvaS" | "customizada";
  pesosCustomizados?: number[]; // quando customizada
}

export interface CronogramaFisico {
  totalMeses: number;
  curvaS: number[]; // percentuais acumulados por mês, soma final = 100
}

export interface UnidadeVenda {
  id: string;
  tipologia: string;
  area: number; // m²
  precoUnitario: number; // R$
  quantidade: number;
}

export interface CurvaVendas {
  prazoMeses: number;
  sinalPct: number; // % do valor da unidade pago no ato
  parcelasObraPct: number; // % distribuído durante a obra
  parcelasPosChavesPct: number; // % após entrega
  chavesPct: number; // % na entrega das chaves
  reajusteAnualPct: number; // reajuste sobre saldo (INCC/IPCA)
  distribuicaoVendas: "linear" | "curvaS" | "customizada";
  pesosVendasCustom?: number[];
}

export interface Despesas {
  corretagem: number; // % sobre VGV
  publicidade: number; // % sobre VGV
  impostoSobreVenda: number; // % sobre VGV (PIS/COFINS/IR/CSLL - RET 4% padrão)
  administracaoObra: number; // % sobre custo de obra
  taxasLegais: number; // R$ fixo
  outrosCustosFixos: number; // R$
}

export interface Financiamento {
  usaFinanciamento: boolean;
  percentualFinanciado: number; // % do custo de obra
  taxaJurosAnual: number; // %
  prazoAmortizacaoMeses: number;
  carenciaMeses: number;
}

export interface ParametrosInvolutivo {
  taxaDescontoAnual: number; // TMA anual (%)
  margemLucro: number; // % desejada do empreendedor
  riscoNegocio: number; // % adicional
  liquidezPct: number; // fator de liquidez (%)
  elasticidade: number; // expoente para ajuste por área (NBR 14.653-2)
}

export interface ParametrosCapitalizacao {
  rendaMensalBruta: number; // R$/mês
  reajusteAluguelAnual: number; // % a.a.
  vacanciaPct: number; // %
  inadimplenciaPct: number; // %
  despesasOperacionaisPct: number; // % sobre receita bruta
  taxaCapitalizacao: number; // cap rate anual (%)
  horizonteAnos: number;
  valorResidualPct: number; // % do último ano
}

export interface ParametrosMonteCarlo {
  simulacoes: number; // n
  variaveis: VariavelMonteCarlo[];
}

export type DistribuicaoTipo = "triangular" | "uniforme" | "normal";

export interface VariavelMonteCarlo {
  id: string;
  nome: string;
  caminho: string; // dot path (ex: "empreendimento.vgvEstimado")
  distribuicao: DistribuicaoTipo;
  min?: number;
  maxValor?: number;
  moda?: number;
  media?: number;
  desvio?: number;
}

export interface Cenario {
  id: string;
  nome: string;
  descricao?: string;
  overrides: Record<string, number | string>; // dot-path -> valor
}

export interface ItemPermuta {
  id: string;
  descricao: string;
  itemCustoId?: string;
  unidadeId?: string;
  valor: number; // R$
}

export interface Projeto {
  id: string;
  nome: string;
  referencia: string; // nº laudo / código interno
  dataAvaliacao: string; // YYYY-MM-DD
  metodo: MetodoAvaliacao;
  finalidade: string; // ex: "garantia", "venda", "compra", "judicial"
  moeda: Moeda;
  responsavel: Responsavel;
  solicitante: string;
  terreno: Terreno;
  empreendimento: Empreendimento;
  custos: ItemCusto[];
  cronograma: CronogramaFisico;
  unidades: UnidadeVenda[];
  curvaVendas: CurvaVendas;
  despesas: Despesas;
  financiamento: Financiamento;
  involutivo: ParametrosInvolutivo;
  capitalizacao: ParametrosCapitalizacao;
  monteCarlo: ParametrosMonteCarlo;
  cenarios: Cenario[];
  permutas: ItemPermuta[];
  criadoEm: string;
  atualizadoEm: string;
}
