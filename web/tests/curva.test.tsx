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

test('gráfico e tabela identificam a referência de idade usada na FIV', () => {
  render(<CurvaRisco tabela={t21 as Tabela} idade={25} referenciaIdade="Idade de quem forneceu o óvulo na coleta" />);
  expect(screen.getByRole('img')).toHaveAccessibleName(/coleta/);
  expect(screen.getByRole('img')).not.toHaveAccessibleName(/idade materna/);
  expect(screen.getByText(/distâncias iguais representam multiplicações/)).toBeInTheDocument();
  expect(screen.getByText('Idade de quem forneceu o óvulo na coleta · estimativa ao nascimento')).toBeInTheDocument();
});
