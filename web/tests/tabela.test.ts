import { describe, expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { tabelaSchema } from '../src/lib/tabela';

describe('tabela T21', () => {
  test('passa no schema', () => {
    expect(() => tabelaSchema.parse(t21)).not.toThrow();
  });

  test('schema rejeita N que não diminui com a idade', () => {
    const ruim = { ...t21, valores: { ...t21.valores, '30': 2000 } };
    expect(() => tabelaSchema.parse(ruim)).toThrow(/decrescente/);
  });

  test('schema rejeita N não inteiro', () => {
    const ruim = { ...t21, valores: { ...t21.valores, '30': 994.5 } };
    expect(() => tabelaSchema.parse(ruim)).toThrow();
  });
});
