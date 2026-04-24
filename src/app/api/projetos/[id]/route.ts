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

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const row = await prisma.projeto.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(toProjeto(row));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as Projeto;
  const updated = await prisma.projeto.update({
    where: { id: params.id },
    data: {
      nome: body.nome,
      referencia: body.referencia ?? "",
      dataAvaliacao: body.dataAvaliacao ?? "",
      metodo: body.metodo ?? "involutivo",
      finalidade: body.finalidade ?? "garantia",
      dados: body as unknown as object,
    },
  });
  return NextResponse.json(toProjeto(updated));
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.projeto.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
