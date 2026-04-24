"use client";

import { Sidebar } from "./Sidebar";

interface Props {
  children: React.ReactNode;
  projetoId?: string;
  projetoNome?: string;
}

export function Shell({ children, projetoId, projetoNome }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar projetoId={projetoId} projetoNome={projetoNome} />
      <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
