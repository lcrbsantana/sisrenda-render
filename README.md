# SisRenda Web (Render) — Avaliação de Empreendimentos Imobiliários

Esta é a **cópia do sisrenda-app preparada para deploy no Render.com**. A diferença em relação à versão local é que a persistência foi migrada de `localStorage` para **PostgreSQL via Prisma**, servida por um conjunto de API routes internas do Next.

> A versão local (para uso desktop, sem backend) continua em `../sisrenda-app`.

## Módulos implementados

### Identificação
- Dashboard com carteira de projetos
- Cadastro de projetos (nome, referência, responsável técnico, solicitante, finalidade, método)
- Terreno (endereço, área, zoneamento, CA/TO, valor quando conhecido)
- Empreendimento (tipo, prazos de obra e vendas, áreas, unidades)

### Entradas
- **Custos de Obra** — múltiplos itens com grupo, distribuição linear/curva-S/customizada
- **Cronograma Físico-Financeiro** — curva S automática, gráfico e tabela de medição
- **Unidades / Vendas** — múltiplas tipologias, cálculo automático de VGV e R$/m²
- **Curva de Pagamentos** — sinal, parcelas-obra, chaves, pós-chaves, reajuste anual
- **Despesas** — corretagem, publicidade, RET/impostos, admin da obra, taxas legais
- **Financiamento à Produção** — Price, carência, tabela de amortização mês a mês
- **Permuta** — física e financeira

### Análise
- **Fluxo de Caixa dinâmico** mensal (gráfico + tabela) com exportação CSV
- **Indicadores de Viabilidade** — VPL, TIR, Payback simples e descontado
- **Método Involutivo** (NBR 14.653-2) — decomposição do valor do terreno
- **Método da Capitalização da Renda** (NBR 14.653-4) — DCF anual, cap rate, NOI

### Avançado
- **Cenários** — múltiplos cenários com overrides + comparação ao baseline
- **Simulação de Monte Carlo** — distribuições triangular/uniforme/normal, histograma, percentis
- **Análise de Pareto** — sensibilidade das variáveis-chave (regra 80/20)
- **Checklist de Validação** — completude do laudo por módulo
- **Relatórios** — PDF resumido, Excel com 10 abas, backup JSON

## Stack técnica

- Next.js 14 (App Router) + React 18 + TypeScript
- TailwindCSS para UI
- Recharts para gráficos
- jsPDF + xlsx para exportação
- **Prisma 5 + PostgreSQL** para persistência (Render Postgres)
- API routes Next (`/api/projetos` e `/api/projetos/[id]`) como camada HTTP

## Deploy no Render (em 5 passos)

1. **Suba este diretório para um repositório GitHub** (público ou privado, tanto faz).
2. Acesse https://dashboard.render.com → **New +** → **Blueprint**.
3. Selecione o repositório. O Render detecta o arquivo `render.yaml` deste projeto e propõe criar automaticamente:
   - 1× **Web Service** (`sisrenda-web`, Node, plan `free`).
   - 1× **PostgreSQL Database** (`sisrenda-db`, plan `free`, retenção de 90 dias).
   - Variável `DATABASE_URL` já conectada ao banco via `fromDatabase`.
4. Clique **Apply**. O `buildCommand` do blueprint executa, em ordem:
   ```
   npm ci --include=dev              # inclui tsx, prisma (necessários no build)
   npx prisma db push --accept-data-loss   # aplica o schema no Postgres
   npm run build                      # prisma generate + next build
   npm run db:seed                    # cria o Projeto Demo (idempotente)
   ```
5. Após o deploy, acesse a URL pública do serviço `sisrenda-web`. O **Projeto Demo — Residencial** já aparece no Dashboard.

### Observações sobre o plano Free

- O Postgres Free expira após **90 dias** — depois é preciso subir para o plano pago ou recriar o banco (o seed recria o demo automaticamente).
- O Web Service Free **dorme após 15 min de inatividade**; a primeira requisição após o sono demora ~30 s.
- O plano Free não roda migrações como job separado, por isso `prisma db push` e o seed estão no `buildCommand`. Em produção séria, troque por `prisma migrate deploy` e versione as migrações em `prisma/migrations/`.

## Desenvolvimento local

Requer um Postgres (local, Neon, Supabase, ou o próprio banco do Render):

```bash
cp .env.example .env
# edite .env e aponte DATABASE_URL para seu banco

npm install
npx prisma db push              # primeira vez — cria as tabelas
npm run db:seed                 # opcional — cria o Projeto Demo
npm run dev                     # http://localhost:3200
```

## Arquivos-chave do deploy

- `render.yaml` — blueprint do Render (web + db + env vars)
- `prisma/schema.prisma` — modelo `Projeto` com o payload inteiro em coluna `Json`
- `prisma/seed.ts` — insere o Projeto Demo se ainda não existir
- `src/lib/prisma.ts` — singleton do Prisma Client
- `src/app/api/projetos/route.ts` — `GET /api/projetos`, `POST /api/projetos`
- `src/app/api/projetos/[id]/route.ts` — `GET`, `PUT`, `DELETE`
- `src/lib/storage.ts` — cliente `fetch()` para as rotas acima (substitui localStorage)

## Diferenças em relação ao `sisrenda-app` (versão local)

| Aspecto | sisrenda-app (local) | sisrenda-render (deploy) |
|--|--|--|
| Persistência | `localStorage` (navegador) | PostgreSQL via Prisma |
| Multi-usuário | Não (1 device = 1 dataset) | Sim (dataset compartilhado) |
| Storage API | síncrona | `async/await` |
| Seed do demo | Botão no Dashboard | Seed automático no build |
| Deploy | `npm run dev` | Render Blueprint |
