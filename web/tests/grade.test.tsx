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
    '10 em cada 1.000 bebês nascidos de mães de 40 anos têm síndrome de Down; 990 não têm',
  );
});
