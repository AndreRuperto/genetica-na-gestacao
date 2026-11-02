import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paginas = ['/', '/calculadora', '/calculadora#idade=40', '/sindromes', '/sindromes/down',
  '/mito-ou-verdade', '/painel-genetico', '/metodologia'];

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
