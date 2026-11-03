// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
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

test('controles de idade atualizam a estimativa e respeitam os limites', async () => {
  render(<Calculadora tabela={tabela} />);
  const campo = screen.getByLabelText(/idade da mãe na data prevista do parto/i);
  const menos = screen.getByRole('button', { name: /diminuir idade/i });
  const mais = screen.getByRole('button', { name: /aumentar idade/i });
  expect(menos).toBeDisabled();
  expect(mais).toBeDisabled();
  await userEvent.type(campo, '39');
  await userEvent.click(mais);
  expect(campo).toHaveValue(40);
  expect(resultado().getByText('1 em 98')).toBeInTheDocument();
  await userEvent.click(menos);
  expect(campo).toHaveValue(39);
  fireEvent.change(campo, { target: { value: '18' } });
  expect(menos).toBeDisabled();
  fireEvent.change(campo, { target: { value: '50' } });
  expect(mais).toBeDisabled();
});

test('alternar para datas calcula a idade e preserva a idade digitada ao voltar', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe na data prevista do parto/i), '40');
  const alternar = screen.getByRole('checkbox', { name: /calcular pelas datas/i });
  await userEvent.click(alternar);
  expect(screen.queryByRole('spinbutton')).toBeNull();
  fireEvent.change(screen.getByLabelText(/data de nascimento da mãe/i), { target: { value: '1990-03-10' } });
  fireEvent.change(screen.getByLabelText(/^data prevista do parto/i), { target: { value: '2026-09-08' } });
  expect(resultado().getByText(/valor interpolado/i)).toBeInTheDocument();
  expect(location.hash).toBe('');
  await userEvent.click(alternar);
  expect(screen.getByRole('spinbutton')).toHaveValue(40);
  expect(resultado().getByText('1 em 98')).toBeInTheDocument();
  expect(location.hash).toBe('#idade=40');
});

test('trocar a origem não reaproveita idade da gestante como idade na coleta', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.type(screen.getByRole('spinbutton'), '45');
  expect(resultado().getByText('1 em 38')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('radio', { name: /doado/i }));
  expect(screen.getByRole('spinbutton')).toHaveValue(null);
  expect(resultado().queryByText('1 em 38')).toBeNull();
  await userEvent.type(screen.getByRole('spinbutton'), '25');
  expect(resultado().getByText('1 em 1.362')).toBeInTheDocument();
  expect(resultado().getByText(/^Idade de quem forneceu o óvulo na coleta: 25 anos\.$/, { selector: 'strong' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /1 em cada 1.000/ })).toHaveAccessibleName(/coleta: 25 anos/);
  expect(location.hash).toBe('#idade=25&ovulo=doado');
});

test('abrir link FIV restaura a origem e não apresenta idade materna no gráfico', () => {
  history.replaceState(null, '', '/calculadora#idade=45&ovulo=doado');
  render(<Calculadora tabela={tabela} />);
  expect(screen.getByRole('radio', { name: /doado/i })).toBeChecked();
  expect(resultado().getByText('1 em 38')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /26 em cada 1.000/ })).toHaveAccessibleName(/974.*coleta: 45 anos/);
  expect(screen.getByRole('img', { name: /Curva do risco/ })).not.toHaveAccessibleName(/idade materna/);
});

test('link de gêmeos não volta a mostrar estimativa para gestação única', () => {
  history.replaceState(null, '', '/calculadora#idade=35&ovulo=doado&bebes=2');
  render(<Calculadora tabela={tabela} />);
  expect(screen.getByRole('radio', { name: /dois ou mais/i })).toBeChecked();
  expect(resultado().queryByText('1 em 403')).toBeNull();
  expect(resultado().getByText(/gestação única/i)).toBeInTheDocument();
  expect(screen.queryByRole('img', { name: /Curva do risco/ })).toBeNull();
});

test('expõe conferência pendente e rejeita idade manual com fração', () => {
  render(<Calculadora tabela={tabela} />);
  expect(screen.getByText('Dados em conferência.')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '35.5' } });
  expect(resultado().getByText(/idade inteira/)).toBeInTheDocument();
  expect(resultado().queryByRole('img')).toBeNull();
  expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
});

test('trocar só o fragmento do link atualiza origem e sai do modo por datas', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.click(screen.getByRole('checkbox', { name: /calcular pelas datas/i }));
  history.replaceState(null, '', '/calculadora#idade=25&ovulo=doado');
  fireEvent(window, new Event('hashchange'));
  expect(screen.getByRole('radio', { name: /doado/i })).toBeChecked();
  expect(screen.getByRole('spinbutton')).toHaveValue(25);
  expect(resultado().getByText('1 em 1.362')).toBeInTheDocument();
});
