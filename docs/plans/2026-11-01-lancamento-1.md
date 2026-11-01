# Lançamento 1 · Plano de implementação

> **Para o Claude:** SUB-SKILL OBRIGATÓRIA: use superpowers:executing-plans para executar este plano tarefa a tarefa.

**Objetivo:** publicar o site estático "Genética da Gravidez Explicada" com a calculadora de
trissomia 21 (grade de 1.000 bebês, cartão, curva), páginas das síndromes, mito ou verdade,
painel genético e metodologia.

**Arquitetura:** projeto Astro em `web/` com ilhas React só onde há interação. A lógica de
risco é pura, fica em `web/src/lib/` e é coberta por Vitest. A tabela de risco fica em
`data/risco/t21.json`, na raiz, e o build de produção falha se ela não estiver conferida.
Design completo em `docs/plans/2026-11-01-lancamento-1-design.md`.

**Stack:** Astro (última estável), @astrojs/react, @astrojs/mdx, React 19, TypeScript,
d3-scale e d3-shape, Vitest com Testing Library (jsdom), Playwright com @axe-core/playwright,
@fontsource/poppins e GitHub Actions.

**Convenções**
- Todos os comandos rodam em `web/`, salvo indicação.
- Neste disco o git reclama de "dubious ownership". Use `git -c safe.directory='*' …` ou peça
  ao usuário para adicionar a exceção global.
- Commits em português, no formato `tipo: descrição`, terminando com
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Textos de interface em pt-BR e linguagem não capacitista ("pessoa com síndrome de Down",
  nunca "normal × anormal" nem "incompatível com a vida").

---

## Fase 0 (humana, em paralelo, não bloqueia as tarefas abaixo)

Fica com o autor e não deve ser feita pelo agente:
1. Conferir os 25 valores de T21 em Morris & Wald, J Med Screen 2007;14(1):5-7. Se baterem,
   mudar `conferido` para `true` e `atualizadoEm` para a data em `data/risco/t21.json`.
2. Enviar os convites de revisão (geneticista clínico e professor(a) de genética).
3. Enviar o pedido de dados agregados ao ECLAMC.
4. Obter Savva 2010 (para a fase 3).

---

### Tarefa 1: Scaffold do projeto Astro

**Arquivos**
- Criar: `web/` (via CLI), `.gitignore` na raiz
- Modificar: `web/astro.config.mjs`, `web/tsconfig.json`, `web/package.json`
- Criar: `web/vitest.config.ts`, `web/tests/smoke.test.ts`

**Passo 1: criar o projeto** (na raiz do repositório)

```bash
npm create astro@latest web -- --template minimal --typescript strict --install --no-git --skip-houston
cd web
npx astro add react mdx --yes
npm i d3-scale d3-shape @fontsource/poppins
npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @types/d3-scale @types/d3-shape @astrojs/check typescript
```

**Passo 2: `.gitignore` na raiz**

```
node_modules/
dist/
.astro/
test-results/
playwright-report/
```

**Passo 3: alias `@dados` para a pasta `data/` da raiz.** Em `web/tsconfig.json`, mantenha o
que o CLI gerou e acrescente:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@dados/*": ["../data/*"] }
  }
}
```

Em `web/astro.config.mjs`, permita que o Vite leia fora de `web/`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [react(), mdx()],
  vite: { server: { fs: { allow: ['..'] } } },
});
```

**Passo 4: Vitest**

`web/vitest.config.ts`:

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
  },
});
```

`web/tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`web/tests/smoke.test.ts`:

```ts
import { expect, test } from 'vitest';
test('vitest roda', () => expect(1 + 1).toBe(2));
```

Em `web/package.json`, acrescente aos scripts:

```json
"test": "vitest run",
"check": "astro check"
```

**Passo 5: verificar**

Rode `npm test` (esperado: 1 passed) e `npm run build` (esperado: build concluído em `dist/`).

**Passo 6: commit**

```bash
git add .gitignore web
git commit -m "chore: scaffold Astro com React, MDX e Vitest"
```

---

### Tarefa 2: Tabela T21 e schema

**Arquivos**
- Criar: `data/risco/t21.json`
- Criar: `web/src/lib/tabela.ts`
- Teste: `web/tests/tabela.test.ts`

**Passo 1: dados** em `data/risco/t21.json`, com os valores do PDF ainda não conferidos:

```json
{
  "condicao": "t21",
  "nome": "Trissomia 21 (síndrome de Down)",
  "fonte": "Morris & Wald, J Med Screen 2007;14(1):5-7",
  "fonteUrl": "https://doi.org/10.1258/096914107780154549",
  "reproduzidaEm": "BORN Ontario, Prevalence of Chromosome Differences",
  "referencia": "nascido_vivo",
  "gestacao": "unica",
  "idade": "data_prevista_parto",
  "atualizadoEm": "2026-11-01",
  "conferido": false,
  "valores": {
    "21": 1470, "22": 1452, "23": 1430, "24": 1400, "25": 1362,
    "26": 1315, "27": 1255, "28": 1182, "29": 1095, "30": 994,
    "31": 881, "32": 759, "33": 634, "34": 513, "35": 403,
    "36": 308, "37": 231, "38": 172, "39": 129, "40": 98,
    "41": 76, "42": 61, "43": 50, "44": 43, "45": 38
  }
}
```

**Passo 2: teste que falha** em `web/tests/tabela.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { tabelaSchema } from '../src/lib/tabela';

describe('tabela T21', () => {
  test('passa no schema', () => {
    expect(() => tabelaSchema.parse(t21)).not.toThrow();
  });

  test('schema rejeita N que não diminui com a idade', () => {
    const ruim = { ...t21, valores: { ...t21.valores, '30': 2000 } };
    expect(() => tabelaSchema.parse(ruim)).toThrow(/decrescente/);
  });

  test('schema rejeita N não inteiro', () => {
    const ruim = { ...t21, valores: { ...t21.valores, '30': 994.5 } };
    expect(() => tabelaSchema.parse(ruim)).toThrow();
  });
});
```

**Passo 3:** rode `npx vitest run tests/tabela.test.ts`. Esperado: FAIL, porque `../src/lib/tabela` não existe.

**Passo 4: implementação** em `web/src/lib/tabela.ts`:

```ts
import { z } from 'astro/zod';

export const tabelaSchema = z
  .object({
    condicao: z.string(),
    nome: z.string(),
    fonte: z.string().min(1),
    fonteUrl: z.string().url(),
    reproduzidaEm: z.string().optional(),
    referencia: z.literal('nascido_vivo'),
    gestacao: z.literal('unica'),
    idade: z.literal('data_prevista_parto'),
    atualizadoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    conferido: z.boolean(),
    valores: z.record(z.string().regex(/^\d+$/), z.number().int().positive()),
  })
  .superRefine((t, ctx) => {
    const idades = Object.keys(t.valores).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < idades.length; i++) {
      if (idades[i] !== idades[i - 1] + 1) {
        ctx.addIssue({ code: 'custom', message: `idade ${idades[i - 1] + 1} faltando` });
      }
      if (t.valores[idades[i]] >= t.valores[idades[i - 1]]) {
        ctx.addIssue({ code: 'custom', message: `N deve ser decrescente (idade ${idades[i]})` });
      }
    }
  });

export type Tabela = z.infer<typeof tabelaSchema>;
```

**Passo 5:** rode `npx vitest run tests/tabela.test.ts`. Esperado: 3 passed.

**Passo 6: commit**

```bash
git add data web/src/lib/tabela.ts web/tests/tabela.test.ts
git commit -m "feat: tabela T21 versionada com schema"
```

---

### Tarefa 3: Cálculo de risco

**Arquivos**
- Criar: `web/src/lib/risco.ts`
- Teste: `web/tests/risco.test.ts`

**Passo 1: teste que falha**

```ts
import { describe, expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { risco, IDADE_MIN, IDADE_MAX } from '../src/lib/risco';
import type { Tabela } from '../src/lib/tabela';

const tabela = t21 as Tabela;

describe('risco T21', () => {
  test('toda idade inteira de 21 a 45 bate com a tabela', () => {
    for (let idade = 21; idade <= 45; idade++) {
      const r = risco(tabela, { idade });
      expect(r.tipo).toBe('ok');
      if (r.tipo === 'ok') {
        expect(r.n).toBe(tabela.valores[String(idade)]);
        expect(r.interpolado).toBe(false);
      }
    }
  });

  test.each([
    [25, 1362, 0.0734],
    [35, 403, 0.2481],
    [40, 98, 1.0204],
    [45, 38, 2.6316],
  ])('%i anos → 1 em %i', (idade, n, pct) => {
    const r = risco(tabela, { idade });
    if (r.tipo !== 'ok') throw new Error('esperado ok');
    expect(r.n).toBe(n);
    expect(r.pct).toBeCloseTo(pct, 4);
    expect(r.complementoPct).toBeCloseTo(100 - pct, 4);
    expect(r.prob).toBeCloseTo(1 / n, 10);
  });

  test('interpola em log entre idades vizinhas', () => {
    const r = risco(tabela, { idade: 35.5 });
    if (r.tipo !== 'ok') throw new Error('esperado ok');
    expect(r.interpolado).toBe(true);
    expect(r.n).toBeCloseTo(Math.sqrt(403 * 308), 6);
  });

  test('risco cresce de forma monotônica com a idade', () => {
    let anterior = 0;
    for (let idade = 21; idade <= 45; idade += 0.1) {
      const r = risco(tabela, { idade });
      if (r.tipo !== 'ok') throw new Error(`esperado ok em ${idade}`);
      expect(r.pct).toBeGreaterThanOrEqual(anterior);
      anterior = r.pct;
    }
  });

  test.each([18, 20.9, 45.1, 50])('%s anos → fora da tabela, sem número', (idade) => {
    expect(risco(tabela, { idade })).toEqual({ tipo: 'fora-da-tabela', min: 21, max: 45 });
  });

  test.each([17.9, 51, Number.NaN])('%s → inválido', (idade) => {
    expect(risco(tabela, { idade }).tipo).toBe('invalido');
  });

  test('gêmeos → aviso, nunca número', () => {
    expect(risco(tabela, { idade: 35, bebes: 2 })).toEqual({ tipo: 'gemeos' });
  });

  test('faixa aceita é 18 a 50', () => {
    expect([IDADE_MIN, IDADE_MAX]).toEqual([18, 50]);
  });
});
```

**Passo 2:** rode `npx vitest run tests/risco.test.ts`. Esperado: FAIL (módulo não existe).

**Passo 3: implementação** em `web/src/lib/risco.ts`:

```ts
import type { Tabela } from './tabela';

export const IDADE_MIN = 18;
export const IDADE_MAX = 50;

export type Entrada = { idade: number; bebes?: number };

export type Resultado =
  | {
      tipo: 'ok';
      n: number;
      prob: number;
      pct: number;
      complementoPct: number;
      fonte: string;
      interpolado: boolean;
    }
  | { tipo: 'fora-da-tabela'; min: number; max: number }
  | { tipo: 'gemeos' }
  | { tipo: 'invalido' };

export function faixaDaTabela(tabela: Tabela): [number, number] {
  const idades = Object.keys(tabela.valores).map(Number);
  return [Math.min(...idades), Math.max(...idades)];
}

export function risco(tabela: Tabela, { idade, bebes = 1 }: Entrada): Resultado {
  if (!Number.isFinite(idade) || idade < IDADE_MIN || idade > IDADE_MAX) {
    return { tipo: 'invalido' };
  }
  if (bebes > 1) return { tipo: 'gemeos' };

  const [min, max] = faixaDaTabela(tabela);
  if (idade < min || idade > max) return { tipo: 'fora-da-tabela', min, max };

  const baixo = Math.floor(idade);
  const nBaixo = tabela.valores[String(baixo)];
  const fracao = idade - baixo;

  let n = nBaixo;
  if (fracao > 0) {
    // A curva é aproximadamente exponencial: interpola no logaritmo.
    const nAlto = tabela.valores[String(baixo + 1)];
    n = Math.exp(Math.log(nBaixo) + fracao * (Math.log(nAlto) - Math.log(nBaixo)));
  }

  const pct = 100 / n;
  return {
    tipo: 'ok',
    n,
    prob: 1 / n,
    pct,
    complementoPct: 100 - pct,
    fonte: tabela.fonte,
    interpolado: fracao > 0,
  };
}

export function casosEmMil(n: number): number {
  return Math.round(1000 / n);
}
```

**Passo 4:** rode `npx vitest run tests/risco.test.ts`. Esperado: todos passam.

**Passo 5: teste de `casosEmMil`**, acrescentado ao mesmo arquivo:

```ts
import { casosEmMil } from '../src/lib/risco';

test.each([
  [25, 1], [35, 2], [40, 10], [45, 26],
])('grade de 1.000 aos %i anos destaca %i', (idade, casos) => {
  expect(casosEmMil(tabela.valores[String(idade)])).toBe(casos);
});

test('grade nunca fica vazia nem passa de 1.000 na faixa da tabela', () => {
  for (const n of Object.values(tabela.valores)) {
    const c = casosEmMil(n);
    expect(c).toBeGreaterThanOrEqual(1);
    expect(c).toBeLessThan(1000);
  }
});
```

Rode de novo. Esperado: todos passam.

**Passo 6: commit**

```bash
git add web/src/lib/risco.ts web/tests/risco.test.ts
git commit -m "feat: cálculo de risco T21 com interpolação log"
```

---

### Tarefa 4: Formatação pt-BR

**Arquivos**
- Criar: `web/src/lib/formatar.ts`
- Teste: `web/tests/formatar.test.ts`

**Passo 1: teste que falha**

```ts
import { expect, test } from 'vitest';
import { umEmN, porcentagem, complemento } from '../src/lib/formatar';

test.each([
  [1362, '1 em 1.362'],
  [98, '1 em 98'],
  [352.31, '1 em 352'],
])('umEmN(%s) = %s', (n, esperado) => expect(umEmN(n)).toBe(esperado));

test.each([
  [100 / 1362, '0,07%'],
  [100 / 98, '1,02%'],
  [100 / 38, '2,63%'],
])('porcentagem(%s) = %s', (pct, esperado) => expect(porcentagem(pct)).toBe(esperado));

test.each([
  [100 - 100 / 98, '99,0%'],
  [100 - 100 / 38, '97,4%'],
  [100 - 100 / 1362, '99,9%'],
])('complemento(%s) = %s', (pct, esperado) => expect(complemento(pct)).toBe(esperado));
```

**Passo 2:** rode `npx vitest run tests/formatar.test.ts`. Esperado: FAIL.

**Passo 3: implementação**

```ts
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const duasCasas = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const umEmN = (n: number) => `1 em ${inteiro.format(Math.round(n))}`;
export const porcentagem = (pct: number) => `${duasCasas.format(pct)}%`;
// Uma casa: 99,93% vira "99,9%", nunca "100,0%" na faixa da tabela.
export const complemento = (pct: number) => `${umaCasa.format(pct)}%`;
```

**Passo 4:** rode o teste. Esperado: passa. Se `1 em 1.362` sair sem o ponto, o ICU do
Node está sem os dados de pt-BR. Nesse caso, troque `inteiro.format` por
`String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')`.

**Passo 5: commit**

```bash
git add web/src/lib/formatar.ts web/tests/formatar.test.ts
git commit -m "feat: formatação pt-BR de risco"
```

---

### Tarefa 5: Idade pelas datas e estado no hash

**Arquivos**
- Criar: `web/src/lib/idade.ts`, `web/src/lib/hash.ts`
- Teste: `web/tests/idade.test.ts`, `web/tests/hash.test.ts`

**Passo 1: testes que falham**

`web/tests/idade.test.ts`:

```ts
import { expect, test } from 'vitest';
import { idadePorDatas } from '../src/lib/idade';

test('idade exata no aniversário', () => {
  expect(idadePorDatas('1990-03-10', '2026-03-10')).toBeCloseTo(36, 2);
});

test('meio ano depois do aniversário', () => {
  expect(idadePorDatas('1990-03-10', '2026-09-08')).toBeCloseTo(36.5, 1);
});

test('datas inválidas ou parto antes do nascimento → NaN', () => {
  expect(idadePorDatas('', '2026-01-01')).toBeNaN();
  expect(idadePorDatas('2026-01-01', '1990-01-01')).toBeNaN();
});
```

`web/tests/hash.test.ts`:

```ts
import { expect, test } from 'vitest';
import { lerIdadeDoHash, hashDaIdade } from '../src/lib/hash';

test('lê idade do hash', () => expect(lerIdadeDoHash('#idade=38')).toBe(38));
test('hash vazio ou inválido → null', () => {
  expect(lerIdadeDoHash('')).toBeNull();
  expect(lerIdadeDoHash('#idade=abc')).toBeNull();
});
test('gera hash só com idade inteira', () => {
  expect(hashDaIdade(38)).toBe('#idade=38');
  expect(hashDaIdade(38.4)).toBe('');
  expect(hashDaIdade(Number.NaN)).toBe('');
});
```

**Passo 2:** rode `npx vitest run tests/idade.test.ts tests/hash.test.ts`. Esperado: FAIL.

**Passo 3: implementação**

`web/src/lib/idade.ts`:

```ts
const MS_POR_ANO = 365.2425 * 24 * 60 * 60 * 1000;

/** Idade (em anos, com fração) na data prevista do parto. Datas no formato AAAA-MM-DD. */
export function idadePorDatas(nascimento: string, dataParto: string): number {
  const a = Date.parse(nascimento);
  const b = Date.parse(dataParto);
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return Number.NaN;
  return (b - a) / MS_POR_ANO;
}
```

`web/src/lib/hash.ts`:

```ts
// A idade fica no fragmento (#), que o navegador não envia ao servidor.
export function lerIdadeDoHash(hash: string): number | null {
  const m = /^#idade=(\d{1,2})$/.exec(hash);
  return m ? Number(m[1]) : null;
}

export function hashDaIdade(idade: number): string {
  return Number.isInteger(idade) ? `#idade=${idade}` : '';
}
```

**Passo 4:** rode os testes. Esperado: passam.

**Passo 5: commit**

```bash
git add web/src/lib/idade.ts web/src/lib/hash.ts web/tests/idade.test.ts web/tests/hash.test.ts
git commit -m "feat: idade pelas datas e idade no fragmento da URL"
```

---

### Tarefa 6: Trava de build para tabela não conferida

**Arquivos**
- Criar: `web/integrations/tabelas-conferidas.mjs`
- Modificar: `web/astro.config.mjs`

**Passo 1: integração**

```js
// Falha o build de produção se alguma tabela de risco não foi conferida na fonte original.
// Builds de pré-visualização (CI, deploy preview) passam com PERMITIR_NAO_CONFERIDO=1.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pasta = fileURLToPath(new URL('../../data/risco/', import.meta.url));

export default function tabelasConferidas() {
  return {
    name: 'tabelas-conferidas',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const pendentes = readdirSync(pasta)
          .filter((f) => f.endsWith('.json'))
          .filter((f) => !JSON.parse(readFileSync(pasta + f, 'utf8')).conferido);
        if (pendentes.length === 0) return;
        const msg = `tabelas não conferidas: ${pendentes.join(', ')}`;
        if (process.env.PERMITIR_NAO_CONFERIDO === '1') logger.warn(msg);
        else throw new Error(`${msg}. Confira na publicação original e marque "conferido": true.`);
      },
    },
  };
}
```

Em `web/astro.config.mjs`, importe e adicione `tabelasConferidas()` em `integrations`.

**Passo 2: verificar**

Rode `npm run build`. Esperado: FAIL com "tabelas não conferidas: t21.json".
Rode `PERMITIR_NAO_CONFERIDO=1 npm run build` (no PowerShell: `$env:PERMITIR_NAO_CONFERIDO=1; npm run build`).
Esperado: aviso e build concluído.

**Passo 3: commit**

```bash
git add web/integrations web/astro.config.mjs
git commit -m "feat: build falha com tabela de risco não conferida"
```

---

### Tarefa 7: Estilos, layout e componentes de credibilidade

**Arquivos**
- Criar: `web/src/styles/global.css`, `web/src/layouts/Base.astro`
- Criar: `web/src/components/AvisoEstimativa.tsx`, `web/src/components/Fonte.astro`, `web/src/components/Revisao.astro`
- Teste: `web/tests/aviso.test.tsx`

**Passo 1: tokens** em `web/src/styles/global.css`:

```css
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';

:root {
  --verde-900: #133b30;
  --verde-700: #1f5c4a;
  --verde-100: #e6efec;
  --laranja: #d9822b;
  --creme: #fbf3ea;
  --texto: #1d2522;
  --texto-suave: #5b6662;
  --fundo: #ffffff;
  --raio: 8px;
  --largura: 72rem;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--texto);
  background: var(--fundo);
  line-height: 1.6;
}
h1, h2, h3 { font-family: 'Poppins', system-ui, sans-serif; color: var(--verde-900); line-height: 1.2; }
a { color: var(--verde-700); }
main { max-width: var(--largura); margin: 0 auto; padding: 2rem 1rem 4rem; }
.aviso { background: var(--creme); border-left: 4px solid var(--laranja); padding: 1rem 1.25rem; border-radius: var(--raio); }
.fonte { font-size: 0.85rem; color: var(--texto-suave); }
.selo { display: inline-block; font-size: 0.8rem; padding: 0.15rem 0.6rem; border-radius: 999px; background: var(--verde-100); color: var(--verde-900); }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```

Confira o contraste no `--texto-suave` sobre branco: precisa de pelo menos 4,5:1. O axe da
Tarefa 18 vai acusar se não tiver.

**Passo 2: teste que falha** em `web/tests/aviso.test.tsx`:

```tsx
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
```

**Passo 3:** rode o teste. Esperado: FAIL.

**Passo 4: componentes**

`web/src/components/AvisoEstimativa.tsx`. É React para poder ser usado dentro da ilha e
também renderizado estático nas páginas:

```tsx
export function AvisoEstimativa() {
  return (
    <aside role="note" className="aviso">
      Esta é uma estimativa populacional baseada apenas na idade. O risco da sua gestação pode
      ser refinado com exames de rastreio (ultrassom morfológico do 1º trimestre, NIPT) e
      diagnóstico (biópsia de vilo corial, amniocentese). Converse com seu obstetra ou um
      geneticista.
    </aside>
  );
}
```

`web/src/components/Fonte.astro`:

```astro
---
interface Props { titulo: string; url?: string }
const { titulo, url } = Astro.props;
---
<span class="fonte">Fonte: {url ? <a href={url} rel="noopener">{titulo}</a> : titulo}</span>
```

`web/src/components/Revisao.astro`:

```astro
---
interface Props { revisadoPor?: { nome: string; credencial: string }; atualizadoEm: string }
const { revisadoPor, atualizadoEm } = Astro.props;
const data = new Date(atualizadoEm + 'T12:00:00').toLocaleDateString('pt-BR');
---
<p>
  {revisadoPor
    ? <span class="selo">Revisado por {revisadoPor.nome}, {revisadoPor.credencial}</span>
    : <span class="selo">Em revisão</span>}
  <span class="fonte"> · Atualizado em {data}</span>
</p>
```

`web/src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
interface Props { titulo: string; descricao: string }
const { titulo, descricao } = Astro.props;
const nomeSite = 'Genética da Gravidez Explicada';
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titulo === nomeSite ? nomeSite : `${titulo} · ${nomeSite}`}</title>
    <meta name="description" content={descricao} />
    <meta property="og:title" content={titulo} />
    <meta property="og:description" content={descricao} />
    <meta property="og:locale" content="pt_BR" />
  </head>
  <body>
    <header>
      <nav aria-label="Principal">
        <a href="/">Início</a> · <a href="/calculadora">O que a idade muda</a> ·
        <a href="/sindromes">Síndromes</a> · <a href="/mito-ou-verdade">Mito ou verdade</a> ·
        <a href="/painel-genetico">Painel genético</a> · <a href="/metodologia">Metodologia</a>
      </nav>
    </header>
    <main><slot /></main>
    <footer class="fonte">
      Conteúdo educativo. Não é diagnóstico nem substitui consulta médica ou aconselhamento
      genético. · <a href="https://andreruperto.dev">andreruperto.dev</a>
    </footer>
  </body>
</html>
```

**Passo 5:** rode `npm test`. Esperado: tudo passa.

**Passo 6: commit**

```bash
git add web/src web/tests/aviso.test.tsx
git commit -m "feat: layout base, tokens e componentes de aviso, fonte e revisão"
```

---

### Tarefa 8: Ilha GradeMilBebes

**Arquivos**
- Criar: `web/src/islands/GradeMilBebes.tsx`
- Teste: `web/tests/grade.test.tsx`

**Passo 1: teste que falha**

```tsx
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
```

**Passo 2:** rode `npx vitest run tests/grade.test.tsx`. Esperado: FAIL.

**Passo 3: implementação**

```tsx
import { forwardRef } from 'react';

const COLUNAS = 40;
const LINHAS = 25;
const PASSO = 12;
const RAIO = 4;

type Props = { casos: number; idadeTexto: string };

export const GradeMilBebes = forwardRef<SVGSVGElement, Props>(function GradeMilBebes(
  { casos, idadeTexto },
  ref,
) {
  const total = COLUNAS * LINHAS;
  const rotulo = `${casos} em cada 1.000 bebês nascidos de mães de ${idadeTexto} têm síndrome de Down; ${total - casos} não têm`;
  return (
    <figure className="grade">
      <svg
        ref={ref}
        role="img"
        aria-label={rotulo}
        viewBox={`0 0 ${COLUNAS * PASSO} ${LINHAS * PASSO}`}
        width="100%"
      >
        {Array.from({ length: total }, (_, i) => {
          const caso = i >= total - casos; // casos no fim da grade, como no plano
          return (
            <circle
              key={i}
              className={caso ? 'caso' : undefined}
              cx={(i % COLUNAS) * PASSO + PASSO / 2}
              cy={Math.floor(i / COLUNAS) * PASSO + PASSO / 2}
              r={RAIO}
              fill={caso ? 'var(--laranja)' : 'var(--verde-100)'}
            />
          );
        })}
      </svg>
      <figcaption>
        <strong>{casos}</strong> com Down · <strong>{total - casos}</strong> sem · arredondado
      </figcaption>
    </figure>
  );
});
```

Animação: CSS em `global.css`, que já é desligada pelo bloco `prefers-reduced-motion`:

```css
.grade circle.caso { animation: surgir 0.4s ease-out both; }
@keyframes surgir { from { opacity: 0; transform: scale(0.3); transform-box: fill-box; transform-origin: center; } }
```

**Passo 4:** rode o teste. Esperado: passa.

**Passo 5: commit**

```bash
git add web/src/islands/GradeMilBebes.tsx web/src/styles/global.css web/tests/grade.test.tsx
git commit -m "feat: grade de 1.000 bebês"
```

---

### Tarefa 9: Baixar imagem da grade

**Arquivos**
- Criar: `web/src/lib/baixarImagem.ts`

Não há teste unitário porque o jsdom não tem canvas. A verificação é manual, na Tarefa 11.

**Passo 1: implementação**

```ts
const LARGURA = 1080;
const ALTURA = 1080;

/** Gera PNG 1080×1080 com a grade, título, legenda e fonte, tudo no navegador. */
export async function baixarImagem(svg: SVGSVGElement, titulo: string, legenda: string, fonte: string) {
  const css = getComputedStyle(document.documentElement);
  const cor = (v: string) => css.getPropertyValue(v).trim();
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // Variáveis CSS não existem fora do documento: resolve as cores antes de serializar.
  clone.querySelectorAll('circle').forEach((c) => {
    c.setAttribute('fill', c.classList.contains('caso') ? cor('--laranja') : cor('--verde-100'));
  });
  const grade = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(grade);
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = LARGURA;
  canvas.height = ALTURA;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, LARGURA, ALTURA);
  ctx.fillStyle = cor('--verde-900');
  ctx.font = '700 56px Poppins, sans-serif';
  ctx.fillText(titulo, 60, 120);
  ctx.drawImage(img, 60, 180, 960, 600);
  ctx.font = '36px system-ui, sans-serif';
  ctx.fillText(legenda, 60, 860);
  ctx.fillStyle = cor('--texto-suave');
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText(fonte, 60, 960);
  ctx.fillText('andreruperto.dev', 60, 1010);

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${titulo.toLowerCase().replace(/\s+/g, '-')}.png`;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

**Passo 2: commit**

```bash
git add web/src/lib/baixarImagem.ts
git commit -m "feat: exportar grade de 1.000 bebês como PNG no navegador"
```

---

### Tarefa 10: Ilha CurvaRisco

**Arquivos**
- Criar: `web/src/islands/CurvaRisco.tsx`
- Teste: `web/tests/curva.test.tsx`

**Passo 1: teste que falha**

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { CurvaRisco } from '../src/islands/CurvaRisco';
import type { Tabela } from '../src/lib/tabela';

test('anota 25, 35, 40 e 45 anos', () => {
  render(<CurvaRisco tabela={t21 as Tabela} />);
  for (const t of ['1 em 1.362', '1 em 403', '1 em 98', '1 em 38']) {
    expect(screen.getAllByText(t).length).toBeGreaterThan(0);
  }
});

test('marca a idade informada', () => {
  const { container } = render(<CurvaRisco tabela={t21 as Tabela} idade={38} />);
  expect(container.querySelector('[data-marcador="38"]')).not.toBeNull();
});

test('tabela equivalente tem 25 linhas', () => {
  render(<CurvaRisco tabela={t21 as Tabela} />);
  expect(screen.getAllByRole('row')).toHaveLength(26); // cabeçalho + 25
});
```

**Passo 2:** rode o teste. Esperado: FAIL.

**Passo 3: implementação**

```tsx
import { scaleLinear, scaleLog } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import type { Tabela } from '../lib/tabela';
import { risco } from '../lib/risco';
import { umEmN, porcentagem } from '../lib/formatar';

const L = 640, A = 320, M = { t: 24, r: 24, b: 40, l: 56 };
const ANOTADAS = [25, 35, 40, 45];

type Props = { tabela: Tabela; idade?: number };

export function CurvaRisco({ tabela, idade }: Props) {
  const pontos = Object.entries(tabela.valores).map(([i, n]) => ({ idade: Number(i), n, pct: 100 / n }));
  const x = scaleLinear().domain([21, 45]).range([M.l, L - M.r]);
  const y = scaleLog().domain([0.05, 4]).range([A - M.b, M.t]);
  const d = line<(typeof pontos)[number]>().x((p) => x(p.idade)).y((p) => y(p.pct)).curve(curveMonotoneX)(pontos)!;
  const marcador = idade !== undefined ? risco(tabela, { idade }) : null;

  return (
    <figure>
      <svg viewBox={`0 0 ${L} ${A}`} width="100%" role="img"
        aria-label="Curva do risco de síndrome de Down ao nascimento por idade materna, em escala logarítmica">
        {[0.1, 0.3, 1, 3].map((v) => (
          <g key={v}>
            <line x1={M.l} x2={L - M.r} y1={y(v)} y2={y(v)} stroke="var(--verde-100)" />
            <text x={M.l - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="11">
              {porcentagem(v).replace(',00', '')}
            </text>
          </g>
        ))}
        {[21, 25, 30, 35, 40, 45].map((v) => (
          <text key={v} x={x(v)} y={A - M.b + 18} textAnchor="middle" fontSize="11">{v}</text>
        ))}
        <text x={(L + M.l) / 2} y={A - 4} textAnchor="middle" fontSize="12">Idade materna no parto</text>
        <path d={d} fill="none" stroke="var(--verde-700)" strokeWidth={2.5} />
        {pontos.filter((p) => ANOTADAS.includes(p.idade)).map((p) => (
          <g key={p.idade}>
            <circle cx={x(p.idade)} cy={y(p.pct)} r={4} fill="var(--laranja)" />
            <text x={x(p.idade)} y={y(p.pct) - 10} textAnchor="middle" fontSize="11">{umEmN(p.n)}</text>
          </g>
        ))}
        {marcador?.tipo === 'ok' && (
          <g data-marcador={idade}>
            <line x1={x(idade!)} x2={x(idade!)} y1={M.t} y2={A - M.b} stroke="var(--laranja)" strokeDasharray="4 4" />
            <circle cx={x(idade!)} cy={y(marcador.pct)} r={7} fill="var(--laranja)" stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>
      <details>
        <summary>Ver como tabela</summary>
        <table>
          <thead><tr><th scope="col">Idade</th><th scope="col">Risco</th><th scope="col">%</th></tr></thead>
          <tbody>
            {pontos.map((p) => (
              <tr key={p.idade}><td>{p.idade}</td><td>{umEmN(p.n)}</td><td>{porcentagem(p.pct)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
```

**Passo 4:** rode o teste. Esperado: passa. Se `getAllByRole('row')` não achar as linhas
porque `<details>` está fechado, use `{ hidden: true }` na consulta.

**Passo 5: commit**

```bash
git add web/src/islands/CurvaRisco.tsx web/tests/curva.test.tsx
git commit -m "feat: curva de risco em escala log com tabela equivalente"
```

---

### Tarefa 11: Ilha Calculadora e página `/calculadora`

**Arquivos**
- Criar: `web/src/islands/Calculadora.tsx`, `web/src/pages/calculadora.astro`
- Teste: `web/tests/calculadora.test.tsx`

**Passo 1: teste que falha**

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { Calculadora } from '../src/islands/Calculadora';
import type { Tabela } from '../src/lib/tabela';

const tabela = t21 as Tabela;
beforeEach(() => history.replaceState(null, '', '/calculadora'));

test('idade → cartão, grade, aviso e hash', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe na data prevista do parto/i), '40');
  expect(screen.getByText('1 em 98')).toBeInTheDocument();
  expect(screen.getByText('1,02%')).toBeInTheDocument();
  expect(screen.getByText(/99,0%/)).toBeInTheDocument();
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
  expect(screen.getByText('1 em 403')).toBeInTheDocument();
});

test('gêmeos → aviso, sem número', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe/i), '35');
  await userEvent.click(screen.getByLabelText(/dois ou mais/i));
  expect(screen.queryByText('1 em 403')).toBeNull();
  expect(screen.getByText(/gestação única/i)).toBeInTheDocument();
});

test('óvulo doado troca o rótulo e usa a idade da coleta', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.click(screen.getByLabelText(/doado/i));
  await userEvent.type(screen.getByLabelText(/idade na data da coleta do óvulo/i), '25');
  expect(screen.getByText('1 em 1.362')).toBeInTheDocument();
});

test('fora da tabela → aviso, sem número', async () => {
  render(<Calculadora tabela={tabela} />);
  await userEvent.type(screen.getByLabelText(/idade da mãe/i), '47');
  expect(screen.getByText(/entre 21 e 45 anos/)).toBeInTheDocument();
  expect(screen.queryByText(/^1 em /)).toBeNull();
});
```

**Passo 2:** rode o teste. Esperado: FAIL.

**Passo 3: implementação** em `web/src/islands/Calculadora.tsx`:

```tsx
import { useEffect, useId, useRef, useState } from 'react';
import type { Tabela } from '../lib/tabela';
import { risco, casosEmMil, IDADE_MIN, IDADE_MAX } from '../lib/risco';
import { umEmN, porcentagem, complemento } from '../lib/formatar';
import { idadePorDatas } from '../lib/idade';
import { lerIdadeDoHash, hashDaIdade } from '../lib/hash';
import { baixarImagem } from '../lib/baixarImagem';
import { AvisoEstimativa } from '../components/AvisoEstimativa';
import { GradeMilBebes } from './GradeMilBebes';
import { CurvaRisco } from './CurvaRisco';

type Props = { tabela: Tabela };

export function Calculadora({ tabela }: Props) {
  const id = useId();
  const [idadeTexto, setIdadeTexto] = useState('');
  const [pelasDatas, setPelasDatas] = useState(false);
  const [nascimento, setNascimento] = useState('');
  const [dataParto, setDataParto] = useState('');
  const [ovulo, setOvulo] = useState<'proprio' | 'doado'>('proprio');
  const [bebes, setBebes] = useState(1);
  const grade = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const doHash = lerIdadeDoHash(location.hash);
    if (doHash !== null) setIdadeTexto(String(doHash));
  }, []);

  const usaDatas = pelasDatas && ovulo === 'proprio';
  const idade = usaDatas ? idadePorDatas(nascimento, dataParto) : idadeTexto === '' ? Number.NaN : Number(idadeTexto);
  const r = risco(tabela, { idade, bebes });

  useEffect(() => {
    const h = usaDatas ? '' : hashDaIdade(idade);
    history.replaceState(null, '', location.pathname + h);
  }, [idade, usaDatas]);

  const rotuloIdade = ovulo === 'doado' ? 'Idade na data da coleta do óvulo' : 'Idade da mãe na data prevista do parto';
  const ref25 = tabela.valores['25'];

  return (
    <section className="calculadora">
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>Origem do óvulo</legend>
          <label><input type="radio" name={`${id}-ovulo`} checked={ovulo === 'proprio'} onChange={() => setOvulo('proprio')} /> Próprio</label>
          <label><input type="radio" name={`${id}-ovulo`} checked={ovulo === 'doado'} onChange={() => setOvulo('doado')} /> Doado ou congelado (FIV)</label>
        </fieldset>

        {usaDatas ? (
          <>
            <label>Data de nascimento da mãe <input type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} /></label>
            <label>Data prevista do parto <input type="date" value={dataParto} onChange={(e) => setDataParto(e.target.value)} /></label>
          </>
        ) : (
          <label>
            {rotuloIdade}
            <input type="number" inputMode="numeric" min={IDADE_MIN} max={IDADE_MAX} step={1}
              value={idadeTexto} onChange={(e) => setIdadeTexto(e.target.value)} />
          </label>
        )}
        {ovulo === 'proprio' && (
          <label><input type="checkbox" checked={pelasDatas} onChange={(e) => setPelasDatas(e.target.checked)} /> Calcular pelas datas</label>
        )}

        <fieldset>
          <legend>Número de bebês</legend>
          <label><input type="radio" name={`${id}-bebes`} checked={bebes === 1} onChange={() => setBebes(1)} /> Um</label>
          <label><input type="radio" name={`${id}-bebes`} checked={bebes > 1} onChange={() => setBebes(2)} /> Dois ou mais</label>
        </fieldset>
      </form>

      <div aria-live="polite">
        {r.tipo === 'gemeos' && (
          <p className="aviso">As tabelas usadas valem para gestação única. Gestações de gêmeos têm valores próprios, que ainda não estão nesta calculadora.</p>
        )}
        {r.tipo === 'fora-da-tabela' && (
          <p className="aviso">A tabela de referência cobre idades entre {r.min} e {r.max} anos. Para outras idades, não mostramos um número para não extrapolar.</p>
        )}
        {r.tipo === 'ok' && (
          <>
            <GradeMilBebes ref={grade} casos={casosEmMil(r.n)} idadeTexto={`${Math.round(idade)} anos`} />
            <button type="button" onClick={() => grade.current && baixarImagem(
              grade.current, `${Math.round(idade)} anos`,
              `${casosEmMil(r.n)} em 1.000 com Down · ${1000 - casosEmMil(r.n)} sem`,
              `Fonte: ${r.fonte}`)}>Baixar imagem</button>
            <article className="cartao">
              <h2>Síndrome de Down (trissomia 21)</h2>
              <p className="destaque">{umEmN(r.n)}</p>
              <p>{porcentagem(r.pct)}</p>
              <p>Chance de não ter trissomia 21: {complemento(r.complementoPct)}</p>
              <p>Para comparar, aos 25 anos: {umEmN(ref25)}</p>
              <p className="fonte">Fonte: <a href={tabela.fonteUrl} rel="noopener">{r.fonte}</a>{r.interpolado && ' · valor interpolado entre idades vizinhas'}</p>
            </article>
          </>
        )}
      </div>

      <CurvaRisco tabela={tabela} idade={r.tipo === 'ok' ? idade : undefined} />
      <AvisoEstimativa />
      <p>
        <strong>E a idade do pai?</strong> O efeito da idade paterna sobre trissomias é pequeno. O
        efeito maior é sobre mutações novas em um único gene, que esta calculadora não estima.
      </p>
    </section>
  );
}
```

**Passo 4:** rode `npx vitest run tests/calculadora.test.tsx`. Esperado: passa. O teste
"fora da tabela" usa `/^1 em /`, que não deve casar com "aos 25 anos: 1 em 1.362" porque
esse texto só aparece quando `r.tipo === 'ok'`.

**Passo 5: página** `web/src/pages/calculadora.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import { Calculadora } from '../islands/Calculadora';
import t21 from '@dados/risco/t21.json';
---
<Base titulo="O que a idade muda na gestação" descricao="Veja, em 1.000 bebês, como a idade materna muda a chance de síndrome de Down, com fonte para cada número.">
  <h1>O que a idade muda na gestação</h1>
  <p>Informe a idade da mãe na data prevista do parto. Nada do que você digitar sai do seu navegador.</p>
  <Calculadora client:load tabela={t21} />
</Base>
```

**Passo 6: verificação manual**

Rode `npm run dev`, abra `/calculadora` e confira:
- 40 anos mostra 10 laranjas e "1 em 98";
- a URL fica com `#idade=40`;
- "Baixar imagem" gera um PNG legível;
- com `prefers-reduced-motion` (DevTools → Rendering), a grade aparece sem animação.

**Passo 7: commit**

```bash
git add web/src/islands/Calculadora.tsx web/src/pages/calculadora.astro web/tests/calculadora.test.tsx
git commit -m "feat: calculadora T21 com grade, cartão, curva e aviso fixo"
```

---

### Tarefa 12: Coleções de conteúdo

**Arquivos**
- Criar: `web/src/content.config.ts`
- Teste: `web/tests/conteudo.test.ts`

**Passo 1: schemas**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const fonte = z.object({ titulo: z.string(), url: z.string().url().optional() });
const revisor = z.object({ nome: z.string(), credencial: z.string() });

const sindromes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/sindromes' }),
  schema: z.object({
    nome: z.string(),
    cariotipo: z.string(),
    resumo: z.string().max(200),
    dependeIdadeMaterna: z.boolean(),
    ordem: z.number().int(),
    fontes: z.array(fonte).min(1),
    revisadoPor: revisor.optional(),
    atualizadoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const mitos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/mitos' }),
  schema: z.object({
    afirmacao: z.string(),
    veredito: z.enum(['Mito', 'Verdade']),
    ordem: z.number().int(),
    fontes: z.array(fonte).min(1),
  }),
});

export const collections = { sindromes, mitos };
```

**Passo 2: teste de contagem**, que falha até as Tarefas 13 e 14 serem feitas:

```ts
import { readdirSync } from 'node:fs';
import { expect, test } from 'vitest';

const contar = (pasta: string, ext: string) =>
  readdirSync(new URL(`../src/content/${pasta}/`, import.meta.url)).filter((f) => f.endsWith(ext)).length;

test('9 síndromes da seção 3 do plano', () => expect(contar('sindromes', '.mdx')).toBe(9));
test('7 mitos da seção 7.4 do plano', () => expect(contar('mitos', '.md')).toBe(7));
```

A validação dos schemas (ao menos uma fonte e assim por diante) acontece no `astro build` e
no `astro check`.

**Passo 3: commit** (com o teste ainda falhando; anote isso na mensagem)

```bash
git add web/src/content.config.ts web/tests/conteudo.test.ts
git commit -m "feat: coleções de síndromes e mitos com schema (conteúdo a seguir)"
```

---

### Tarefa 13: Mito ou verdade

**Arquivos**
- Criar: `web/src/content/mitos/01-35-anos.md` a `07-turner-idade.md`
- Criar: `web/src/pages/mito-ou-verdade.astro`

**Passo 1: os 7 itens da seção 7.4 do plano.** Um arquivo por item; o corpo é a explicação
curta. Exemplo:

```md
---
afirmacao: "Depois dos 35 é mais provável ter filho com Down do que sem"
veredito: Mito
ordem: 1
fontes:
  - titulo: "Morris & Wald, J Med Screen 2007"
    url: "https://doi.org/10.1258/096914107780154549"
---
Aos 35 anos o risco é de cerca de 1 em 400: mais de 99% dos bebês nascem sem a síndrome.
```

Os demais, na ordem:

| Arquivo | Afirmação | Veredito | Explicação (do plano) | Fonte |
|---|---|---|---|---|
| 02-turner-tiques.md | Síndrome de Turner causa tiques | Mito | Tiques são da síndrome de Tourette. Turner é a falta de um X (45,X). | MedlinePlus Genetics, Turner syndrome (conferir) |
| 03-miado-edwards.md | Miado do Gato e Edwards são a mesma síndrome | Mito | Miado do Gato é deleção no cromossomo 5; Edwards é trissomia do 18. | MedlinePlus Genetics, Cri-du-chat (conferir) |
| 04-pares-sexuais.md | Toda célula tem dois pares de cromossomos sexuais | Mito | Temos 23 pares, e só um deles é sexual. | MedlinePlus Genetics, Chromosomes (conferir) |
| 05-painel-sexo-gemeos.md | Painel genético mostra se vou ter menino ou gêmeos | Mito | O painel mostra se o casal é portador de doenças recessivas. | ACOG Committee Opinion 691 (2017) |
| 06-idade-trissomias.md | A idade materna aumenta o risco de trissomias | Verdade | A não disjunção na formação do óvulo fica mais frequente com a idade. | Morris & Wald 2007; Savva, Walker & Morris 2010 |
| 07-turner-idade.md | Turner não depende da idade da mãe | Verdade | Diferente das trissomias, Turner não aumenta com a idade materna. | Fetal Medicine Foundation, https://courses.fetalmedicine.com/fmf/show/53 |

As fontes marcadas "(conferir)" não estão no plano. O agente sugere e o autor confirma antes
do lançamento. Liste-as no PR.

**Passo 2: página**

```astro
---
import Base from '../layouts/Base.astro';
import { getCollection, render } from 'astro:content';
const mitos = (await getCollection('mitos')).sort((a, b) => a.data.ordem - b.data.ordem);
const itens = await Promise.all(mitos.map(async (m) => ({ m, Conteudo: (await render(m)).Content })));
---
<Base titulo="Mito ou verdade" descricao="Afirmações comuns sobre genética e gravidez, conferidas com fonte.">
  <h1>Mito ou verdade</h1>
  {itens.map(({ m, Conteudo }) => (
    <article id={m.id} class="card-mito">
      <h2><a href={`#${m.id}`}>{m.data.afirmacao}</a></h2>
      <p class="selo">{m.data.veredito}</p>
      <Conteudo />
      <p class="fonte">Fonte: {m.data.fontes.map((f) => f.url ? <a href={f.url}>{f.titulo}</a> : f.titulo)}</p>
    </article>
  ))}
</Base>
```

**Passo 3:** rode `npx vitest run tests/conteudo.test.ts`. Esperado: o teste dos mitos passa
e o das síndromes ainda falha.

**Passo 4: commit**

```bash
git add web/src/content/mitos web/src/pages/mito-ou-verdade.astro
git commit -m "feat: seção mito ou verdade"
```

---

### Tarefa 14: Páginas das síndromes

**Arquivos**
- Criar: 9 arquivos em `web/src/content/sindromes/`
- Criar: `web/src/pages/sindromes/index.astro`, `web/src/pages/sindromes/[slug].astro`

**Passo 1: rascunhos.** Um MDX por linha da tabela da seção 3 do plano. O corpo expande o
texto da coluna "O que é correto dizer" em 3 a 5 parágrafos curtos: o que é, causa, como afeta
a pessoa, relação com a idade materna e onde buscar apoio. A linguagem segue a seção 11.2.
Sem `revisadoPor`, então todos aparecem como "Em revisão". `atualizadoEm: 2026-11-01`.

| Arquivo | nome | cariotipo | dependeIdadeMaterna | Fonte inicial |
|---|---|---|---|---|
| down.mdx | Síndrome de Down | Trissomia do 21 (47,+21) | true | Morris & Wald 2007 |
| edwards.mdx | Síndrome de Edwards | Trissomia do 18 (47,+18) | true | Savva, Walker & Morris 2010 |
| patau.mdx | Síndrome de Patau | Trissomia do 13 (47,+13) | true | Savva, Walker & Morris 2010 |
| miado-do-gato.mdx | Síndrome do Miado do Gato (cri du chat) | Deleção 5p- | false | MedlinePlus Genetics (conferir) |
| turner.mdx | Síndrome de Turner | 45,X | false | Fetal Medicine Foundation |
| klinefelter.mdx | Síndrome de Klinefelter | 47,XXY | false | MedlinePlus Genetics (conferir) |
| triplo-x.mdx | Triplo X | 47,XXX | false | MedlinePlus Genetics (conferir) |
| duplo-y.mdx | Duplo Y | 47,XYY | false | MedlinePlus Genetics (conferir) |
| intersexo-dds.mdx | Intersexo / DDS | Causas variadas | false | MedlinePlus Genetics (conferir) |

Atenção a duas coisas. Primeiro, Klinefelter, Triplo X e Duplo Y têm alguma associação com
a idade materna na literatura. Marque `false` só se a fonte conferida sustentar; na dúvida,
deixe uma pergunta no PR para o revisor. Segundo, Edwards nunca deve ser descrita como
"incompatível com a vida".

**Passo 2: páginas**

`web/src/pages/sindromes/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import { getCollection } from 'astro:content';
const lista = (await getCollection('sindromes')).sort((a, b) => a.data.ordem - b.data.ordem);
---
<Base titulo="Síndromes cromossômicas" descricao="O que é cada alteração cromossômica e o que é correto dizer sobre ela.">
  <h1>Síndromes cromossômicas</h1>
  <ul>
    {lista.map((s) => (
      <li><a href={`/sindromes/${s.id}`}>{s.data.nome}</a> · {s.data.cariotipo}<br />{s.data.resumo}</li>
    ))}
  </ul>
</Base>
```

`web/src/pages/sindromes/[slug].astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Revisao from '../../components/Revisao.astro';
import Fonte from '../../components/Fonte.astro';
import { AvisoEstimativa } from '../../components/AvisoEstimativa';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  return (await getCollection('sindromes')).map((s) => ({ params: { slug: s.id }, props: { s } }));
}
const { s } = Astro.props;
const { Content } = await render(s);
---
<Base titulo={s.data.nome} descricao={s.data.resumo}>
  <h1>{s.data.nome}</h1>
  <p class="selo">{s.data.cariotipo}</p>
  <Revisao revisadoPor={s.data.revisadoPor} atualizadoEm={s.data.atualizadoEm} />
  <Content />
  <p>{s.data.dependeIdadeMaterna ? 'O risco aumenta com a idade materna.' : 'Não depende da idade materna.'}</p>
  {s.data.fontes.map((f) => <p><Fonte titulo={f.titulo} url={f.url} /></p>)}
  {s.data.dependeIdadeMaterna && <AvisoEstimativa />}
</Base>
```

**Passo 3:** rode `npm test` (esperado: o teste de conteúdo passa) e
`PERMITIR_NAO_CONFERIDO=1 npm run build` (esperado: build gera `/sindromes/*`).

**Passo 4: commit**

```bash
git add web/src/content/sindromes web/src/pages/sindromes
git commit -m "feat: páginas das síndromes cromossômicas (rascunho, em revisão)"
```

---

### Tarefa 15: Painel genético

**Arquivos**
- Criar: `web/src/pages/painel-genetico.mdx`

**Passo 1: página.** MDX com `layout` apontando para `Base` via frontmatter, ou um `.astro`
com o texto embutido. O conteúdo vem da seção 8 do plano:
- o que é o painel de portadores;
- o risco de 25% quando os dois são portadores da mesma condição;
- as três estratégias aceitas pelo ACOG, de preferência antes da gravidez;
- fibrose cística, AME e hemoglobinopatias na rotina;
- o que o painel **não** faz: não detecta trissomias, não prevê sexo nem gêmeos, não mapeia "tudo";
- se uma pessoa der positivo, o parceiro deve ser testado;
- um resultado negativo reduz o risco, mas não zera (risco residual).

Inclua uma figura SVG estática portador × portador: quadro 2×2 com AA, Aa, aA e aa e a
legenda "25% não portador · 50% portador · 25% afetado". Fontes: ACOG Committee Opinions
690 e 691 (2017).

**Passo 2:** rode `PERMITIR_NAO_CONFERIDO=1 npm run build`. Esperado: `/painel-genetico` gerado.

**Passo 3: commit**

```bash
git add web/src/pages/painel-genetico.mdx
git commit -m "feat: página do painel genético de portadores"
```

---

### Tarefa 16: Metodologia

**Arquivos**
- Criar: `web/src/pages/metodologia.astro`

**Passo 1: página.** As seções são:
1. **De onde vêm os números:** a tabela de fontes da seção 4 do plano, restrita ao que o
   Lançamento 1 usa.
2. **Como calculamos:** busca direta na tabela, interpolação log para idade com fração,
   `% = 100/N` e grade = `round(1000/N)`.
3. **Cuidados:** os itens da seção 4.1 do plano (nascido vivo × meio da gestação, idade na
   data do parto, FIV e doação, gestação única, por que o SINASC não alimenta a calculadora).
4. **Tabela completa:** gerada a partir de `@dados/risco/t21.json`, com as mesmas funções de
   `formatar.ts`, mostrando `atualizadoEm` e o estado `conferido`.
5. **Revisão:** quem revisou e quando, ou "Em revisão".
6. **Código aberto:** link para o repositório.

```astro
---
import Base from '../layouts/Base.astro';
import t21 from '@dados/risco/t21.json';
import { umEmN, porcentagem } from '../lib/formatar';
const linhas = Object.entries(t21.valores).map(([idade, n]) => ({ idade, n }));
const data = new Date(t21.atualizadoEm + 'T12:00:00').toLocaleDateString('pt-BR');
---
<Base titulo="Metodologia" descricao="De onde vêm os números, como são calculados e quais são os limites.">
  <h1>Metodologia</h1>
  <!-- seções 1, 2, 3, 5 e 6: texto -->
  <h2>Tabela completa: trissomia 21 ao nascimento</h2>
  <p class="fonte">Fonte: <a href={t21.fonteUrl}>{t21.fonte}</a>, conforme {t21.reproduzidaEm}. Atualizado em {data}.</p>
  <table>
    <thead><tr><th scope="col">Idade</th><th scope="col">Risco</th><th scope="col">%</th></tr></thead>
    <tbody>{linhas.map((l) => <tr><td>{l.idade}</td><td>{umEmN(l.n)}</td><td>{porcentagem(100 / l.n)}</td></tr>)}</tbody>
  </table>
</Base>
```

**Passo 2:** rode o build. Esperado: `/metodologia` gerado.

**Passo 3: commit**

```bash
git add web/src/pages/metodologia.astro
git commit -m "feat: página de metodologia"
```

---

### Tarefa 17: Home

**Arquivos**
- Modificar: `web/src/pages/index.astro` (substitui o que o template gerou)

**Passo 1: página.** Os 4 números de destaque são calculados a partir do JSON, não digitados:

```astro
---
import Base from '../layouts/Base.astro';
import Fonte from '../components/Fonte.astro';
import t21 from '@dados/risco/t21.json';
import { umEmN, complemento } from '../lib/formatar';
const v = t21.valores;
const destaques = [
  { valor: umEmN(v['25']), rotulo: 'risco de Down aos 25 anos' },
  { valor: umEmN(v['35']), rotulo: 'aos 35 anos' },
  { valor: umEmN(v['40']), rotulo: 'aos 40 anos' },
  { valor: complemento(100 - 100 / v['45']), rotulo: 'chance de bebê sem Down aos 45' },
];
---
<Base titulo="Genética da Gravidez Explicada" descricao="Como a idade materna afeta o risco de trissomias, com números confiáveis, fontes e visualizações simples.">
  <h1>Genética da Gravidez Explicada</h1>
  <p>Como a idade materna muda a chance de alterações cromossômicas, explicado com números confiáveis e fonte para cada um.</p>
  <ul class="destaques">
    {destaques.map((d) => <li><strong>{d.valor}</strong><span>{d.rotulo}</span></li>)}
  </ul>
  <Fonte titulo="Morris & Wald (2007), risco ao nascimento, gestação única" url={t21.fonteUrl} />
  <p><a href="/calculadora" class="botao">Veja o que a idade muda</a></p>
  <nav aria-label="Seções">
    <a href="/sindromes">Síndromes</a> · <a href="/mito-ou-verdade">Mito ou verdade</a> ·
    <a href="/painel-genetico">Painel genético</a> · <a href="/metodologia">Metodologia</a>
  </nav>
</Base>
```

**Passo 2:** abra `npm run dev` e confira: "1 em 1.362", "1 em 403", "1 em 98" e "97,4%".

**Passo 3: commit**

```bash
git add web/src/pages/index.astro
git commit -m "feat: página inicial com destaques calculados da tabela"
```

---

### Tarefa 18: Acessibilidade com axe

**Arquivos**
- Criar: `web/playwright.config.ts`, `web/e2e/a11y.spec.ts`
- Modificar: `web/package.json`

**Passo 1: instalar**

```bash
npm i -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

**Passo 2: config**

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  webServer: { command: 'npm run preview -- --port 4321', port: 4321, reuseExistingServer: true },
  use: { baseURL: 'http://localhost:4321' },
});
```

**Passo 3: spec**

```ts
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
  await page.getByLabel(/idade da mãe/i).focus();
  await page.keyboard.type('40');
  await expect(page.getByText('1 em 98')).toBeVisible();
});
```

Script em `package.json`: `"test:a11y": "playwright test"`.

**Passo 4: rodar**

```bash
PERMITIR_NAO_CONFERIDO=1 npm run build && npm run test:a11y
```

Esperado: todos passam. Se houver violações, corrija em CSS ou markup, nunca desligando a regra.

**Passo 5: commit**

```bash
git add web/playwright.config.ts web/e2e web/package.json web/package-lock.json
git commit -m "test: acessibilidade com axe e uso por teclado"
```

---

### Tarefa 19: CI

**Arquivos**
- Criar: `.github/workflows/ci.yml`

**Passo 1: workflow**

```yaml
name: CI
on: [push, pull_request]
jobs:
  web:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: web } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: web/package-lock.json }
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npm run build
        env: { PERMITIR_NAO_CONFERIDO: '1' }
      - run: npx playwright install --with-deps chromium
      - run: npm run test:a11y
```

O deploy de produção (Netlify ou Vercel) roda `npm run build` **sem** a variável, então só
publica com a tabela conferida. Configure o provedor com base directory `web`, comando
`npm run build` e diretório de publicação `dist`. Previews de PR podem usar
`PERMITIR_NAO_CONFERIDO=1`.

**Passo 2: commit**

```bash
git add .github
git commit -m "ci: check, testes, build e acessibilidade"
```

---

### Tarefa 20: README

**Arquivos**
- Criar: `README.md` (raiz)

Conteúdo, no mesmo estilo do README do Cronomapa:
- o que é e o que não é (não é diagnóstico);
- o que já funciona;
- como rodar (`cd web && npm install && npm run dev`);
- tabela de comandos (`dev`, `build`, `test`, `test:a11y`, `check`);
- como os números entram, com `data/risco/*.json` e a regra do `conferido`;
- fontes e licenças;
- link para os docs em `docs/plans/`.

```bash
git add README.md
git commit -m "docs: README"
```

---

## Checklist de lançamento (fase 2)

- [ ] `data/risco/t21.json` com `conferido: true` (autor)
- [ ] Fontes "(conferir)" das Tarefas 13 e 14 confirmadas (autor)
- [ ] Textos das 9 síndromes revisados pelo autor e pelo coautor
- [ ] Decisão sobre 18–20 anos tomada com o revisor (design, seção 2)
- [ ] `npm run build` sem a variável passa
- [ ] CI verde
- [ ] Revisão do especialista: entra quando vier e não bloqueia
