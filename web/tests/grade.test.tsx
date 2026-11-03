// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GradeMilBebes } from '../src/islands/GradeMilBebes';

test('desenha 1.000 bebês com os casos destacados', () => {
  const { container } = render(<GradeMilBebes casos={10} idadeTexto="40 anos" />);
  expect(container.querySelectorAll('circle')).toHaveLength(1000);
  expect(container.querySelectorAll('circle.caso')).toHaveLength(10);
});

test('descreve a grade para leitores de tela', () => {
  render(<GradeMilBebes casos={10} idadeTexto="40 anos" />);
  expect(screen.getByRole('img')).toHaveAccessibleName(
    '10 em cada 1.000 bebês têm síndrome de Down; 990 não têm síndrome de Down. Estimativa ao nascimento, arredondada, para gestação única. Idade da gestante na data prevista do parto: 40 anos. Não representa casos observados.',
  );
});

test('referência de coleta não é apresentada como idade da gestante', () => {
  render(<GradeMilBebes casos={26} idadeTexto="45 anos" contexto="Idade de quem forneceu o óvulo na coleta: 45 anos" />);
  expect(screen.getByRole('img')).toHaveAccessibleName(/26 em cada 1.000.*974.*coleta: 45 anos/);
  expect(screen.getByRole('img')).not.toHaveAccessibleName(/mães|gestante/);
  expect(screen.getByText(/nascimentos hipotéticos/)).toBeInTheDocument();
});
