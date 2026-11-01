import { expect, test } from 'vitest';
import { umEmN, porcentagem, complemento } from '../src/lib/formatar';

test.each([
  [1362, '1 em 1.362'],
  [98, '1 em 98'],
  [352.31, '1 em 352'],
])('umEmN(%s) = %s', (n, esperado) => expect(umEmN(n)).toBe(esperado));

test.each([
  [100 / 1362, '0,07%'],
  [100 / 98, '1,02%'],
  [100 / 38, '2,63%'],
])('porcentagem(%s) = %s', (pct, esperado) => expect(porcentagem(pct)).toBe(esperado));

test.each([
  [100 - 100 / 98, '99,0%'],
  [100 - 100 / 38, '97,4%'],
  [100 - 100 / 1362, '99,9%'],
])('complemento(%s) = %s', (pct, esperado) => expect(complemento(pct)).toBe(esperado));
