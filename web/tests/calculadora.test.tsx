// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { Calculadora } from '../src/islands/Calculadora';
import type { Tabela } from '../src/lib/tabela';

const tabela = t21 as Tabela;
beforeEach(() => history.replaceState(null, '', '/calculadora'));
// A curva (com anotações e tabela) também mostra "1 em N": as checagens do resultado ficam na região dele.
const resultado = () => within(screen.getByRole('region', { name: 'Resultado' }));

test('idade → cartão, grade, aviso e hash', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe na data prevista do parto/i), '40');
  expect(resultado().getByText('1 em 98')).toBeInTheDocument();
  expect(resultado().getByText('1,02%')).toBeInTheDocument();
  expect(resultado().getByText(/99,0%/)).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /10 em cada 1\.000/ })).toBeInTheDocument();
  expect(screen.getByRole('note')).toHaveTextContent(/estimativa populacional/);
  expect(location.hash).toBe('#idade=40');
});

test('aviso fixo aparece mesmo sem idade', () => {
  render(<Calculadora tabela={tabela} />);
  expect(screen.getByRole('note')).toBeInTheDocument();
});

test('lê a idade do hash ao abrir', () => {
  history.replaceState(null, '', '/calculadora#idade=35');
  render(<Calculadora tabela={tabela} />);
  expect(resultado().getByText('1 em 403')).toBeInTheDocument();
});

test('gêmeos → aviso, sem número', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe/i), '35');
  await userEvent.click(screen.getByLabelText(/dois ou mais/i));
  expect(resultado().queryByText('1 em 403')).toBeNull();
  expect(resultado().getByText(/gestação única/i)).toBeInTheDocument();
});

test('óvulo doado troca o rótulo e usa a idade da coleta', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.click(screen.getByLabelText(/doado/i));
  await userEvent.type(screen.getByLabelText(/idade na data da coleta do óvulo/i), '25');
  expect(resultado().getByText('1 em 1.362')).toBeInTheDocument();
});

test('fora da tabela → aviso, sem número', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe/i), '47');
  expect(resultado().getByText(/entre 21 e 45 anos/)).toBeInTheDocument();
  expect(resultado().queryByText(/^1 em /)).toBeNull();
});
