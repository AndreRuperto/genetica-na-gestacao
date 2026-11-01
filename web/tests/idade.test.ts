import { expect, test } from 'vitest';
import { idadePorDatas } from '../src/lib/idade';

test('idade exata no aniversário', () => {
  expect(idadePorDatas('1990-03-10', '2026-03-10')).toBeCloseTo(36, 2);
});

test('meio ano depois do aniversário', () => {
  expect(idadePorDatas('1990-03-10', '2026-09-08')).toBeCloseTo(36.5, 1);
});

test('datas inválidas ou parto antes do nascimento → NaN', () => {
  expect(idadePorDatas('', '2026-01-01')).toBeNaN();
  expect(idadePorDatas('2026-01-01', '1990-01-01')).toBeNaN();
});
