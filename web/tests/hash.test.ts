import { expect, test } from 'vitest';
import { lerIdadeDoHash, lerConfiguracaoDoHash, hashDaIdade } from '../src/lib/hash';

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

test('links preservam FIV e gestação múltipla e mantêm os links antigos', () => {
  const hash = hashDaIdade(25, 'doado', 2);
  expect(lerConfiguracaoDoHash(hash)).toEqual({ idade: 25, ovulo: 'doado', bebes: 2 });
  expect(lerConfiguracaoDoHash('#idade=40')).toEqual({ idade: 40, ovulo: 'proprio', bebes: 1 });
});

test.each(['#idade=45&idade=25', '#idade=25&ovulo=desconhecido', '#idade=25&bebes=3', '#idade=25&extra=1', '#idade=99', '#idade=35.5'])(
  'rejeita configuração ambígua ou inválida: %s', (hash) => expect(lerConfiguracaoDoHash(hash)).toBeNull(),
);
