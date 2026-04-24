export const brl = (n: number) =>
  (isFinite(n) ? n : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const pct = (n: number, digits = 2) =>
  `${(isFinite(n) ? n : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;

export const num = (n: number, digits = 2) =>
  (isFinite(n) ? n : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const int = (n: number) =>
  (isFinite(n) ? n : 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
