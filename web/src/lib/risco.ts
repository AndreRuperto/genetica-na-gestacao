import type { Tabela } from './tabela';

export const IDADE_MIN = 18;
export const IDADE_MAX = 50;

export type Entrada = { idade: number; bebes?: number };

export type Resultado =
  | {
      tipo: 'ok';
      n: number;
      prob: number;
      pct: number;
      complementoPct: number;
      fonte: string;
      interpolado: boolean;
    }
  | { tipo: 'fora-da-tabela'; min: number; max: number }
  | { tipo: 'gemeos' }
  | { tipo: 'invalido' };

export function faixaDaTabela(tabela: Tabela): [number, number] {
  const idades = Object.keys(tabela.valores).map(Number);
  return [Math.min(...idades), Math.max(...idades)];
}

export function risco(tabela: Tabela, { idade, bebes = 1 }: Entrada): Resultado {
  if (!Number.isFinite(idade) || idade < IDADE_MIN || idade > IDADE_MAX) {
    return { tipo: 'invalido' };
  }
  if (bebes > 1) return { tipo: 'gemeos' };

  const [min, max] = faixaDaTabela(tabela);
  if (idade < min || idade > max) return { tipo: 'fora-da-tabela', min, max };

  const baixo = Math.floor(idade);
  const nBaixo = tabela.valores[String(baixo)];
  const fracao = idade - baixo;

  let n = nBaixo;
  if (fracao > 0) {
    // A curva é aproximadamente exponencial: interpola no logaritmo.
    const nAlto = tabela.valores[String(baixo + 1)];
    n = Math.exp(Math.log(nBaixo) + fracao * (Math.log(nAlto) - Math.log(nBaixo)));
  }

  const pct = 100 / n;
  return {
    tipo: 'ok',
    n,
    prob: 1 / n,
    pct,
    complementoPct: 100 - pct,
    fonte: tabela.fonte,
    interpolado: fracao > 0,
  };
}

export function casosEmMil(n: number): number {
  return Math.round(1000 / n);
}
