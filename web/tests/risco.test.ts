import { describe, expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { risco, casosEmMil, IDADE_MIN, IDADE_MAX } from '../src/lib/risco';
import type { Tabela } from '../src/lib/tabela';

const tabela = t21 as Tabela;

describe('risco T21', () => {
  test('toda idade inteira de 21 a 45 bate com a tabela', () => {
    for (let idade = 21; idade <= 45; idade++) {
      const r = risco(tabela, { idade });
      expect(r.tipo).toBe('ok');
      if (r.tipo === 'ok') {
        expect(r.n).toBe(tabela.valores[String(idade)]);
        expect(r.interpolado).toBe(false);
      }
    }
  });

  test.each([
    [25, 1362, 0.0734],
    [35, 403, 0.2481],
    [40, 98, 1.0204],
    [45, 38, 2.6316],
  ])('%i anos → 1 em %i', (idade, n, pct) => {
    const r = risco(tabela, { idade });
    if (r.tipo !== 'ok') throw new Error('esperado ok');
    expect(r.n).toBe(n);
    expect(r.pct).toBeCloseTo(pct, 4);
    expect(r.complementoPct).toBeCloseTo(100 - pct, 4);
    expect(r.prob).toBeCloseTo(1 / n, 10);
  });

  test('interpola em log entre idades vizinhas', () => {
    const r = risco(tabela, { idade: 35.5 });
    if (r.tipo !== 'ok') throw new Error('esperado ok');
    expect(r.interpolado).toBe(true);
    expect(r.n).toBeCloseTo(Math.sqrt(403 * 308), 6);
  });

  test('risco cresce de forma monotônica com a idade', () => {
    let anterior = 0;
    for (let idade = 21; idade <= 45; idade += 0.1) {
      const r = risco(tabela, { idade });
      if (r.tipo !== 'ok') throw new Error(`esperado ok em ${idade}`);
      expect(r.pct).toBeGreaterThanOrEqual(anterior);
      anterior = r.pct;
    }
  });

  test.each([18, 20.9, 45.1, 50])('%s anos → fora da tabela, sem número', (idade) => {
    expect(risco(tabela, { idade })).toEqual({ tipo: 'fora-da-tabela', min: 21, max: 45 });
  });

  test.each([17.9, 51, Number.NaN])('%s → inválido', (idade) => {
    expect(risco(tabela, { idade }).tipo).toBe('invalido');
  });

  test('gêmeos → aviso, nunca número', () => {
    expect(risco(tabela, { idade: 35, bebes: 2 })).toEqual({ tipo: 'gemeos' });
  });

  test('faixa aceita é 18 a 50', () => {
    expect([IDADE_MIN, IDADE_MAX]).toEqual([18, 50]);
  });
});

test.each([
  [25, 1], [35, 2], [40, 10], [45, 26],
])('grade de 1.000 aos %i anos destaca %i', (idade, casos) => {
  expect(casosEmMil(tabela.valores[String(idade)])).toBe(casos);
});

test('grade nunca fica vazia nem passa de 1.000 na faixa da tabela', () => {
  for (const n of Object.values(tabela.valores)) {
    const c = casosEmMil(n);
    expect(c).toBeGreaterThanOrEqual(1);
    expect(c).toBeLessThan(1000);
  }
});
