import { readdirSync } from 'node:fs';
import { expect, test } from 'vitest';

const contar = (pasta: string, ext: string) =>
  readdirSync(new URL(`../src/content/${pasta}/`, import.meta.url)).filter((f) => f.endsWith(ext)).length;

test('9 síndromes da seção 3 do plano', () => expect(contar('sindromes', '.mdx')).toBe(9));
test('7 mitos da seção 7.4 do plano', () => expect(contar('mitos', '.md')).toBe(7));
