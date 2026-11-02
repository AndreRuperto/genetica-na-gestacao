// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { AvisoEstimativa } from '../src/components/AvisoEstimativa';

test('aviso cita estimativa populacional e exames', () => {
  render(<AvisoEstimativa />);
  expect(screen.getByRole('note')).toHaveTextContent(/estimativa populacional/);
  expect(screen.getByRole('note')).toHaveTextContent(/NIPT/);
  expect(screen.queryByRole('button')).toBeNull(); // não fechável
});
