// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { CurvaRisco } from '../src/islands/CurvaRisco';
import type { Tabela } from '../src/lib/tabela';

test('anota 25, 35, 40 e 45 anos', () => {
  render(<CurvaRisco tabela={t21 as Tabela} />);
  for (const t of ['1 em 1.362', '1 em 403', '1 em 98', '1 em 38']) {
    expect(screen.getAllByText(t).length).toBeGreaterThan(0);
  }
});

test('marca a idade informada', () => {
  const { container } = render(<CurvaRisco tabela={t21 as Tabela} idade={38} />);
  expect(container.querySelector('[data-marcador="38"]')).not.toBeNull();
});

test('tabela equivalente tem 25 linhas', () => {
  render(<CurvaRisco tabela={t21 as Tabela} />);
  expect(screen.getAllByRole('row', { hidden: true })).toHaveLength(26); // cabeçalho + 25
});
