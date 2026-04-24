"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { ProjetoProvider } from "@/components/ProjetoProvider";
import { obterProjeto } from "@/lib/storage";
import type { Projeto } from "@/lib/types";

export default function ProjetoLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [projeto, setProjeto] = useState<Projeto | null>(null);

  useEffect(() => {
    if (id) obterProjeto(id).then(setProjeto);
  }, [id]);

  if (!id) return null;
  if (!projeto) {
    return (
      <Shell>
        <div className="card text-center py-10">
          <p className="text-slate-500">Projeto não encontrado.</p>
          <Link href="/projetos" className="btn-primary mt-4 inline-block">
            Voltar para projetos
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell projetoId={id} projetoNome={projeto.nome}>
      <ProjetoProvider projetoId={id}>{children}</ProjetoProvider>
    </Shell>
  );
}
