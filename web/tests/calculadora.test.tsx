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
  render(<Calculadora tabelas={[tabela]} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe na data prevista do parto/i), '40');
  expect(resultado().getByText('1 em 98')).toBeInTheDocument();
  expect(resultado().getByText('1,02%')).toBeInTheDocument();
  expect(resultado().getByText(/99,0%/)).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /10 em cada 1\.000/ })).toBeInTheDocument();
  expect(screen.getByRole('note')).toHaveTextContent(/estimativa populacional/);
  expect(location.hash).toBe('#idade=40');
});

test('aviso fixo aparece mesmo sem idade', () => {
  render(<Calculadora tabelas={[tabela]} />);
  expect(screen.getByRole('note')).toBeInTheDocument();
});

test('lê a idade do hash ao abrir', () => {
  history.replaceState(null, '', '/calculadora#idade=35');
  render(<Calculadora tabelas={[tabela]} />);
  expect(resultado().getByText('1 em 403')).toBeInTheDocument();
});

test('gêmeos → aviso, sem número', async () => {
  render(<Calculadora tabelas={[tabela]} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe/i), '35');
  await userEvent.click(screen.getByLabelText(/dois ou mais/i));
  expect(resultado().queryByText('1 em 403')).toBeNull();
  expect(resultado().getByText(/gestação única/i)).toBeInTheDocument();
});

test('FIV não mostra estimativa nem solicita idade da doadora', async () => {
  render(<Calculadora tabelas={[tabela]} />);
  await userEvent.click(screen.getByRole('radio', { name: /FIV: próprio ou doado/i }));
  expect(screen.queryByRole('spinbutton')).toBeNull();
  expect(resultado().getByText(/não apresenta uma estimativa numérica/i)).toBeInTheDocument();
  expect(resultado().queryByText(/^1 em /)).toBeNull();
  expect(screen.queryByRole('img', { name: /Curva do risco/ })).toBeNull();
  expect(location.hash).toBe('');
});

test('fora da tabela → aviso, sem número', async () => {
  render(<Calculadora tabelas={[tabela]} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe/i), '47');
  expect(resultado().getByText(/entre 21 e 45 anos/)).toBeInTheDocument();
  expect(resultado().queryByText(/^1 em /)).toBeNull();
});

test('controles de idade atualizam a estimativa e respeitam os limites', async () => {
  render(<Calculadora tabelas={[tabela]} />);
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

test('datas usam anos completos e preservam idade digitada ao voltar', async () => {
  render(<Calculadora tabelas={[tabela]} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe na data prevista do parto/i), '40');
  const alternar = screen.getByRole('checkbox', { name: /calcular idade pelas datas/i });
  await userEvent.click(alternar);
  expect(screen.queryByRole('spinbutton')).toBeNull();
  fireEvent.change(screen.getByLabelText(/data de nascimento da mãe/i), { target: { value: '1990-03-10' } });
  fireEvent.change(screen.getByLabelText(/^data prevista do parto/i), { target: { value: '2026-09-08' } });
  expect(resultado().getByText('1 em 308')).toBeInTheDocument();
  expect(resultado().getByText(/valor correspondente a uma idade inteira/i)).toBeInTheDocument();
  expect(location.hash).toBe('');
  await userEvent.click(alternar);
  expect(screen.getByRole('spinbutton')).toHaveValue(40);
  expect(resultado().getByText('1 em 98')).toBeInTheDocument();
  expect(location.hash).toBe('#idade=40');
});

test('trocar para FIV remove a idade e nunca reaproveita estimativa', async () => {
  render(<Calculadora tabelas={[tabela]} />);
  await userEvent.type(screen.getByRole('spinbutton'), '45');
  expect(resultado().getByText('1 em 38')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('radio', { name: /FIV: próprio ou doado/i }));
  expect(screen.queryByRole('spinbutton')).toBeNull();
  expect(resultado().queryByText('1 em 38')).toBeNull();
  expect(location.hash).toBe('');
  await userEvent.click(screen.getByRole('radio', { name: /Próprio, sem FIV/i }));
  expect(screen.getByRole('spinbutton')).toHaveValue(null);
  expect(resultado().queryByText('1 em 38')).toBeNull();
});

test('link legado FIV restaura opção, sem número nem gráfico', () => {
  history.replaceState(null, '', '/calculadora#idade=45&ovulo=doado');
  render(<Calculadora tabelas={[tabela]} />);
  expect(screen.getByRole('radio', { name: /FIV: próprio ou doado/i })).toBeChecked();
  expect(screen.queryByRole('spinbutton')).toBeNull();
  expect(resultado().getByText(/não apresenta uma estimativa numérica/i)).toBeInTheDocument();
  expect(resultado().queryByText('1 em 38')).toBeNull();
  expect(screen.queryByRole('img', { name: /Curva do risco/ })).toBeNull();
});

test('link de gêmeos não volta a mostrar estimativa para gestação única', () => {
  history.replaceState(null, '', '/calculadora#idade=35&ovulo=doado&bebes=2');
  render(<Calculadora tabelas={[tabela]} />);
  expect(screen.getByRole('radio', { name: /dois ou mais/i })).toBeChecked();
  expect(resultado().queryByText('1 em 403')).toBeNull();
  expect(resultado().getByText(/gestação única/i)).toBeInTheDocument();
  expect(screen.queryByRole('img', { name: /Curva do risco/ })).toBeNull();
});

test('tabela T21 conferida mantém aviso clínico e rejeita idade manual com fração', () => {
  render(<Calculadora tabelas={[tabela]} />);
  expect(screen.queryByText('Dados em conferência.')).toBeNull();
  expect(screen.getByRole('note')).toHaveTextContent(/estimativa populacional/);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '35.5' } });
  expect(resultado().getByText(/idade inteira/)).toBeInTheDocument();
  expect(resultado().queryByRole('img')).toBeNull();
  expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
});

test('a calculadora informa qual fonte conferiu a tabela T21', () => {
  render(<Calculadora tabelas={[tabela]} />);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '35' } });
  expect(resultado().getByText('Tabela conferida com fonte institucional')).toBeInTheDocument();
  expect(screen.getByRole('note')).toHaveTextContent(/Não é diagnóstico/);
});

test('fragmento FIV sai do modo por datas e bloqueia números', async () => {
  render(<Calculadora tabelas={[tabela]} />);
  await userEvent.click(screen.getByRole('checkbox', { name: /calcular idade pelas datas/i }));
  history.replaceState(null, '', '/calculadora#idade=25&ovulo=doado');
  fireEvent(window, new Event('hashchange'));
  expect(screen.getByRole('radio', { name: /FIV: próprio ou doado/i })).toBeChecked();
  expect(screen.queryByRole('spinbutton')).toBeNull();
  expect(resultado().queryByText('1 em 1.362')).toBeNull();
});

test('data imediatamente anterior ao aniversário usa a idade anterior', async () => {
  render(<Calculadora tabelas={[tabela]} />);
  await userEvent.click(screen.getByRole('checkbox', { name: /calcular idade pelas datas/i }));
  fireEvent.change(screen.getByLabelText(/data de nascimento da mãe/i), { target: { value: '1991-10-01' } });
  fireEvent.change(screen.getByLabelText(/^data prevista do parto/i), { target: { value: '2026-09-30' } });
  expect(resultado().getByText('1 em 513')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/^data prevista do parto/i), { target: { value: '2026-10-01' } });
  expect(resultado().getByText('1 em 403')).toBeInTheDocument();
});

// Tabela fictícia, só para exercitar a troca de condição; não são valores reais de T18.
const t18Ficticia = { ...tabela, condicao: 't18', nome: 'Fictícia', valores: Object.fromEntries(Object.entries(tabela.valores).map(([i, n]) => [i, n * 10])) } as Tabela;

test('com uma só tabela, não mostra seletor de condição', () => {
  render(<Calculadora tabelas={[tabela]} />);
  expect(screen.queryByRole('group', { name: /ver a estimativa para/i })).toBeNull();
});

test('trocar a condição atualiza título, números e link', async () => {
  render(<Calculadora tabelas={[tabela, t18Ficticia]} />);
  await userEvent.type(screen.getByRole('spinbutton'), '40');
  expect(resultado().getByText('1 em 98')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('radio', { name: 'Síndrome de Edwards' }));
  expect(resultado().getByRole('heading', { name: /síndrome de Edwards \(trissomia 18\)/i })).toBeInTheDocument();
  expect(resultado().getByText('1 em 980')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /em cada 1.000 bebês têm síndrome de Edwards/ })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /Curva do risco de síndrome de Edwards/ })).toBeInTheDocument();
  expect(location.hash).toBe('#idade=40&condicao=t18');
});

test('link com condição abre nela; condição sem tabela cai na trissomia 21', () => {
  history.replaceState(null, '', '/calculadora#idade=40&condicao=t18');
  const { unmount } = render(<Calculadora tabelas={[tabela, t18Ficticia]} />);
  expect(screen.getByRole('radio', { name: 'Síndrome de Edwards' })).toBeChecked();
  unmount();
  history.replaceState(null, '', '/calculadora#idade=40&condicao=t13');
  render(<Calculadora tabelas={[tabela, t18Ficticia]} />);
  expect(screen.getByRole('radio', { name: 'Síndrome de Down' })).toBeChecked();
  expect(resultado().getByText('1 em 98')).toBeInTheDocument();
});
