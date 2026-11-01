import { expect, test } from 'vitest';
import { lerIdadeDoHash, hashDaIdade } from '../src/lib/hash';

test('lê idade do hash', () => expect(lerIdadeDoHash('#idade=38')).toBe(38));
test('hash vazio ou inválido → null', () => {
  expect(lerIdadeDoHash('')).toBeNull();
  expect(lerIdadeDoHash('#idade=abc')).toBeNull();
});
test('gera hash só com idade inteira', () => {
  expect(hashDaIdade(38)).toBe('#idade=38');
  expect(hashDaIdade(38.4)).toBe('');
  expect(hashDaIdade(Number.NaN)).toBe('');
});
