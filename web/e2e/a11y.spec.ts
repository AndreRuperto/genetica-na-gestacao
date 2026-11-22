import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paginas = ['/', '/calculadora', '/calculadora#idade=40', '/sindromes', '/sindromes/down',
  '/mito-ou-verdade', '/painel-genetico', '/metodologia', '/auditoria'];

for (const p of paginas) {
  test(`sem violações de acessibilidade em ${p}`, async ({ page }) => {
    await page.goto(p);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations).toEqual([]);
  });
}

test('calculadora funciona só com teclado', async ({ page }) => {
  await page.goto('/calculadora');
  // Digitar antes da hidratação perderia as teclas: a ilha tira o atributo `ssr` quando hidrata.
  await page.locator('astro-island:not([ssr])').waitFor();
  await page.getByLabel(/idade da mãe/i).focus();
  await page.keyboard.type('40');
  // A curva também mostra "1 em 98" (anotação e tabela): confere o cartão do resultado.
  await expect(page.getByRole('region', { name: 'Resultado' }).getByText('1 em 98')).toBeVisible();
});

test('links antigos de FIV não produzem estimativa numérica', async ({ page }) => {
  await page.goto('/calculadora#idade=35&ovulo=doado');
  await page.locator('astro-island:not([ssr])').waitFor();
  await expect(page.getByRole('radio', { name: /FIV: próprio ou doado/i })).toBeChecked();
  await expect(page.getByRole('region', { name: 'Resultado' }).getByText(/não apresenta uma estimativa numérica/i)).toBeVisible();
  await expect(page.getByRole('spinbutton')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Resultado' }).getByText('1 em 403')).toHaveCount(0);
});

test('datas consultam apenas idades em anos completos', async ({ page }) => {
  await page.goto('/calculadora');
  await page.locator('astro-island:not([ssr])').waitFor();
  await page.getByRole('checkbox', { name: /calcular idade pelas datas/i }).check();
  await page.getByLabel(/data de nascimento da mãe/i).fill('1991-10-01');
  await page.getByLabel(/^data prevista do parto/i).fill('2026-09-30');
  await expect(page.getByRole('region', { name: 'Resultado' }).getByText('1 em 513')).toBeVisible();
  await page.getByLabel(/^data prevista do parto/i).fill('2026-10-01');
  await expect(page.getByRole('region', { name: 'Resultado' }).getByText('1 em 403')).toBeVisible();
});

test('auditoria publica mostra 25 idades e revisao clinica pendente', async ({ page }) => {
  await page.goto('/auditoria');
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(26);
  await expect(page.getByRole('heading', { name: /avaliação especializada pendente/i })).toBeVisible();
});
