import { expect, test } from 'vitest';
import { idadePorDatas } from '../src/lib/idade';

test('data de aniversário é contada em anos completos', () => {
  expect(idadePorDatas('1990-03-10', '2026-03-10')).toBe(36);
  expect(idadePorDatas('1990-03-10', '2026-03-09')).toBe(35);
});

test('datas entre aniversários não interpolam estimativas', () => {
  expect(idadePorDatas('1990-03-10', '2026-09-08')).toBe(36);
  expect(idadePorDatas('2000-02-29', '2026-02-28')).toBe(25);
  expect(idadePorDatas('2000-02-29', '2026-03-01')).toBe(26);
});

test('datas inválidas ou parto anterior ao nascimento não geram idade', () => {
  for (const [nascimento, parto] of [
    ['', '2026-01-01'],
    ['2026-01-01', '1990-01-01'],
    ['1990-02-29', '2026-09-08'],
    ['1990-01-01', '2026-02-30'],
    ['1990-01-01', '1990-01-01'],
  ]) {
    expect(idadePorDatas(nascimento, parto)).toBeNaN();
  }
});
