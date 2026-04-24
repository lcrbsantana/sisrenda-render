import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Projeto } from "@/lib/types";

export const dynamic = "force-dynamic";

function toProjeto(row: {
  id: string;
  nome: string;
  dados: unknown;
  criadoEm: Date;
  atualizadoEm: Date;
}): Projeto {
  const dados = (row.dados ?? {}) as Partial<Projeto>;
  return {
    ...(dados as Projeto),
    id: row.id,
    nome: row.nome,
    criadoEm: row.criadoEm.toISOString(),
    atualizadoEm: row.atualizadoEm.toISOString(),
  };
}

export async function GET() {
  const rows = await prisma.projeto.findMany({
    orderBy: { atualizadoEm: "desc" },
  });
  return NextResponse.json(rows.map(toProjeto));
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Projeto;
  const created = await prisma.projeto.create({
    data: {
      id: body.id,
      nome: body.nome,
      referencia: body.referencia ?? "",
      dataAvaliacao: body.dataAvaliacao ?? "",
      metodo: body.metodo ?? "involutivo",
      finalidade: body.finalidade ?? "garantia",
      dados: body as unknown as object,
    },
  });
  return NextResponse.json(toProjeto(created), { status: 201 });
}
