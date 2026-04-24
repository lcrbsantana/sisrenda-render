"use client";

interface Props {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative" | "warning";
}

export function Kpi({ label, value, hint, tone = "default" }: Props) {
  const color =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
      ? "text-red-600"
      : tone === "warning"
      ? "text-amber-600"
      : "text-slate-900";

  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${color}`}>{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
