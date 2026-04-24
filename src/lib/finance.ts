// Funções financeiras puras

export function npv(taxaPeriodo: number, fluxos: number[]): number {
  let total = 0;
  for (let t = 0; t < fluxos.length; t++) {
    total += fluxos[t] / Math.pow(1 + taxaPeriodo, t);
  }
  return total;
}

// TIR por Newton-Raphson com fallback bisseção
export function irr(fluxos: number[], guess = 0.01): number | null {
  if (fluxos.length < 2) return null;
  const hasPos = fluxos.some((v) => v > 0);
  const hasNeg = fluxos.some((v) => v < 0);
  if (!hasPos || !hasNeg) return null;

  // Newton-Raphson
  let r = guess;
  for (let i = 0; i < 100; i++) {
    let f = 0;
    let df = 0;
    for (let t = 0; t < fluxos.length; t++) {
      const d = Math.pow(1 + r, t);
      f += fluxos[t] / d;
      if (t > 0) df -= (t * fluxos[t]) / (d * (1 + r));
    }
    if (Math.abs(f) < 1e-8) return r;
    if (Math.abs(df) < 1e-12) break;
    const rn = r - f / df;
    if (!Number.isFinite(rn)) break;
    if (Math.abs(rn - r) < 1e-9) return rn;
    r = rn;
    if (r <= -0.9999) r = -0.9999;
  }

  // Fallback bisseção
  let lo = -0.99;
  let hi = 10;
  const f = (x: number) => fluxos.reduce((s, v, t) => s + v / Math.pow(1 + x, t), 0);
  let flo = f(lo);
  let fhi = f(hi);
  if (flo * fhi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-8) return mid;
    if (flo * fm < 0) {
      hi = mid;
      fhi = fm;
    } else {
      lo = mid;
      flo = fm;
    }
  }
  return (lo + hi) / 2;
}

export function taxaMensalDeAnual(taxaAnual: number): number {
  return Math.pow(1 + taxaAnual, 1 / 12) - 1;
}

export function taxaAnualDeMensal(taxaMensal: number): number {
  return Math.pow(1 + taxaMensal, 12) - 1;
}

export function paybackSimples(fluxos: number[]): number | null {
  let acum = 0;
  for (let t = 0; t < fluxos.length; t++) {
    acum += fluxos[t];
    if (acum >= 0) {
      const ant = acum - fluxos[t];
      if (fluxos[t] === 0) return t;
      return t - 1 + -ant / fluxos[t];
    }
  }
  return null;
}

export function paybackDescontado(taxaPeriodo: number, fluxos: number[]): number | null {
  let acum = 0;
  for (let t = 0; t < fluxos.length; t++) {
    const vp = fluxos[t] / Math.pow(1 + taxaPeriodo, t);
    acum += vp;
    if (acum >= 0) {
      const ant = acum - vp;
      if (vp === 0) return t;
      return t - 1 + -ant / vp;
    }
  }
  return null;
}

export function pmt(taxa: number, n: number, pv: number): number {
  if (taxa === 0) return pv / n;
  return (pv * taxa) / (1 - Math.pow(1 + taxa, -n));
}

// Retorna saldo devedor mês a mês (Price / SAC simplificado — usamos Price)
export function tabelaPrice(pv: number, taxa: number, n: number, carencia = 0) {
  const parcela = pmt(taxa, n, pv);
  const linhas: { mes: number; parcela: number; juros: number; amort: number; saldo: number }[] = [];
  let saldo = pv;
  for (let m = 1; m <= n + carencia; m++) {
    if (m <= carencia) {
      const juros = saldo * taxa;
      saldo += juros;
      linhas.push({ mes: m, parcela: 0, juros, amort: 0, saldo });
    } else {
      const juros = saldo * taxa;
      const amort = parcela - juros;
      saldo -= amort;
      linhas.push({ mes: m, parcela, juros, amort, saldo: Math.max(0, saldo) });
    }
  }
  return linhas;
}
