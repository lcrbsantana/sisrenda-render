// Aplicação de cenários (overrides sobre o projeto base)

import type { Projeto, Cenario } from "./types";

function setByPath(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) return;
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

export function aplicarCenario(projeto: Projeto, cenario: Cenario): Projeto {
  const clone: Projeto = JSON.parse(JSON.stringify(projeto));
  for (const [path, val] of Object.entries(cenario.overrides)) {
    setByPath(clone, path, val);
  }
  return clone;
}
