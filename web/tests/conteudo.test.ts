import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const contar = (pasta: string, ext: string) =>
  readdirSync(new URL(`../src/content/${pasta}/`, import.meta.url)).filter((f) => f.endsWith(ext)).length;

test('9 síndromes da seção 3 do plano', () => expect(contar('sindromes', '.mdx')).toBe(9));
test('Mito ou verdade contém os dois vereditos e ordens sem repetição', () => {
  const pasta = new URL('../src/content/mitos/', import.meta.url);
  const arquivos = readdirSync(pasta).filter((f) => f.endsWith('.md'));
  const conteudos = arquivos.map((f) => readFileSync(new URL(f, pasta), 'utf8'));
  expect(conteudos.some((c) => /^veredito: Mito$/m.test(c))).toBe(true);
  expect(conteudos.some((c) => /^veredito: Verdade$/m.test(c))).toBe(true);
  const ordens = conteudos.map((c) => Number(/^ordem: (\d+)$/m.exec(c)?.[1]));
  expect(ordens.every(Number.isInteger)).toBe(true);
  expect(new Set(ordens).size).toBe(arquivos.length);
  // Os links compartilháveis dos temas originais continuam válidos.
  expect(arquivos).toEqual(expect.arrayContaining(['01-35-anos.md', '02-turner-tiques.md', '03-miado-edwards.md', '04-pares-sexuais.md', '05-painel-sexo-gemeos.md', '06-idade-trissomias.md', '07-turner-idade.md']));
});
