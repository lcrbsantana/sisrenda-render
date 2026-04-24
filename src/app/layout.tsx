import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SisRenda Web — Avaliação de Empreendimentos",
  description:
    "Software de avaliação de empreendimentos imobiliários: Método Involutivo, Capitalização da Renda, Fluxo de Caixa, Monte Carlo, Pareto, Cenários e Relatórios.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
