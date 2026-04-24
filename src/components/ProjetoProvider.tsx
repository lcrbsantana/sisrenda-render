"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Projeto } from "@/lib/types";
import { obterProjeto, salvarProjeto } from "@/lib/storage";

interface Ctx {
  projeto: Projeto | null;
  atualizar: (mod: (p: Projeto) => void) => void;
  recarregar: () => void;
}

const ProjetoCtx = createContext<Ctx | null>(null);

export function ProjetoProvider({
  projetoId,
  children,
}: {
  projetoId: string;
  children: React.ReactNode;
}) {
  const [projeto, setProjeto] = useState<Projeto | null>(null);

  useEffect(() => {
    obterProjeto(projetoId).then(setProjeto);
  }, [projetoId]);

  const atualizar = (mod: (p: Projeto) => void) => {
    setProjeto((prev) => {
      if (!prev) return prev;
      const clone = JSON.parse(JSON.stringify(prev)) as Projeto;
      mod(clone);
      salvarProjeto(clone).catch((e) => console.error("salvarProjeto falhou", e));
      return clone;
    });
  };

  const recarregar = () => {
    obterProjeto(projetoId).then(setProjeto);
  };

  const value = useMemo<Ctx>(() => ({ projeto, atualizar, recarregar }), [projeto]);

  return <ProjetoCtx.Provider value={value}>{children}</ProjetoCtx.Provider>;
}

export function useProjeto() {
  const ctx = useContext(ProjetoCtx);
  if (!ctx) throw new Error("useProjeto deve ser usado dentro de ProjetoProvider");
  return ctx;
}
