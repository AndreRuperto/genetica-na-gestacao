# Genética da Gravidez Explicada · Design do Lançamento 1

Data: 2026-11-01
Base: "Plano de projeto · versão final" (outubro de 2026), seções 2.1, 3, 5, 6, 7.1, 7.4, 8, 10 e 11.

Este documento fixa as decisões de implementação do Lançamento 1 (fases 0 a 2 do plano):
calculadora de trissomia 21, visualização de 1.000 bebês, curva de risco, páginas das
síndromes, mito ou verdade, painel genético e metodologia. Pipeline SINASC, análise de
captação, simulador de herança e API ficam para as entregas seguintes.

## 1. Repositório e arquitetura

Repositório próprio em `genetica-gravidez/`. Hoje só existe o site; `pipeline/` (Python) e
`api/` (FastAPI) entram nas fases 4 e 5 como pastas irmãs de `web/`. Sem workspace ou
monorepo até haver algo a compartilhar.

```
genetica-gravidez/
├── web/                       # Astro + ilhas React (TypeScript)
│   ├── src/
│   │   ├── pages/             # /, /calculadora, /sindromes/[slug],
│   │   │                      # /mito-ou-verdade, /painel-genetico, /metodologia
│   │   ├── content/           # MDX: síndromes e mitos (coleções tipadas com zod)
│   │   ├── components/        # .astro estáticos (layout, aviso, fonte, revisão)
│   │   ├── islands/           # React: Calculadora, GradeMilBebes, CurvaRisco
│   │   ├── lib/risco.ts       # lógica pura da calculadora
│   │   └── styles/
│   └── tests/                 # Vitest
├── data/
│   └── risco/t21.json         # tabela versionada (fonte, data, conferido)
├── docs/plans/
└── README.md
```

Princípios:

- **Site 100% estático.** A idade digitada nunca sai do navegador: sem servidor, sem
  cookies de análise ligados a dados de saúde (LGPD).
- **Lógica separada da UI.** `lib/risco.ts` recebe a tabela e devolve resultados; é o que os
  testes cobrem e o que a API reproduzirá em Python.
- **Dados fora do código.** `data/risco/t21.json` segue a estrutura da seção 6.4 do plano,
  com `conferido: false` até a fase 0 confirmar os valores na publicação original. O build de
  produção falha com tabela não conferida; o modo dev só avisa.
- **Ilhas só onde há interação.** Calculadora, grade e curva são hidratadas; o resto é HTML
  puro (SEO e preview de link).
- **Hospedagem:** Netlify ou Vercel, build estático. A escolha não afeta o código.

## 2. Calculadora

### Entradas

- **Idade da mãe na data prevista do parto** (inteiro). Modo opcional "calcular pelas
  datas": data de nascimento + data prevista do parto → idade com fração. Nada é guardado.
- **Origem do óvulo:** próprio ou doado. Doado (ou congelado em FIV) troca o rótulo para
  "idade na data da coleta do óvulo", e o cálculo usa essa idade.
- **Número de bebês:** um, ou dois ou mais. Dois ou mais → aviso de que as tabelas valem para
  gestação única, sem resultado.
- **Idade paterna:** não é campo. Bloco de texto educativo, para não sugerir que muda o número.

### Cálculo (`lib/risco.ts`, funções puras)

- `risco(condicao, idade, tabelas)` → `{ n, prob, pct, complementoPct, fonte, interpolado }`.
  No lançamento 1 só existe `t21`; T18 e T13 entram na fase 3 adicionando os JSONs.
- Idade inteira: busca direta. Idade com fração: interpolação linear em `log(1/N)` entre as
  idades vizinhas.
- Fora de 21–45 (18–20 e 46–50): aviso, sem número. **Decisão em aberto para o revisor:**
  mostrar "próximo de 1 em 1.470 (valor de 21 anos)" para 18–20.
- Fora de 18–50: entrada inválida.
- Conversão: `prob = 1/N`, `pct = 100/N` (2 casas), complemento com 1 casa.

### Saída, nesta ordem

1. Grade de 1.000 bebês (destaque), com `round(1000/N)` casos e legenda
   "X com Down · Y sem · arredondado".
2. Cartão: "1 em N", porcentagem, "chance de não ter: 99,0%", comparação com 25 anos
   (1 em 1.362) e fonte ao lado do número.
3. Curva de risco com eixo Y em escala log e marcador na idade informada.
4. Aviso fixo (texto da seção 6.3 do plano), sempre visível, sem botão de fechar.

### Privacidade e compartilhamento

A idade vai para o fragmento da URL (`#idade=38`), que o navegador não envia ao servidor:
o link é compartilhável sem a idade aparecer em logs. Sem analytics de eventos da calculadora.

## 3. Visualizações e conteúdo

### Visualizações (ilhas React, SVG próprio; `d3-scale` e `d3-shape` só na curva)

- **Grade de 1.000 bebês:** 40 × 25, casos em laranja no fim da grade. Animação curta de
  entrada, desligada com `prefers-reduced-motion`. `role="img"` com `aria-label` descritivo
  ("10 em cada 1.000 bebês de mães de 40 anos têm síndrome de Down; 990 não têm").
- **"Baixar imagem":** SVG → PNG no navegador, com legenda, fonte e andreruperto.dev.
  Páginas públicas por idade com preview próprio ficam para depois.
- **Curva de risco:** pontos anotados em 25, 35, 40 e 45, marcador móvel na idade informada e
  tabela equivalente expansível abaixo.

### Conteúdo (coleções do Astro com schemas zod)

- `sindromes/`: um MDX por condição da seção 3 do plano (9 condições). Frontmatter: `nome`,
  `cariotipo`, `dependeIdadeMaterna`, `fontes[]` (mínimo 1), `revisadoPor?`, `atualizadoEm`.
  Gera `/sindromes` e `/sindromes/[slug]`.
- `mitos/`: um arquivo por afirmação (7 do plano): `afirmacao`, `veredito`, `explicacao`,
  `fontes[]`. Página `/mito-ou-verdade` com cards ancorados e compartilháveis.
- `/painel-genetico`: texto da seção 8 e figura estática 25/50/25 (portador × portador).
  O simulador interativo é da fase 5.
- `/metodologia`: fontes, fórmula, limitações, tabela T21 completa lida do mesmo JSON da
  calculadora e data da última atualização.
- `/`: os 4 números de destaque, chamada para a calculadora e links para as seções.

### Credibilidade embutida

- `<Revisao>`: "Revisado por Nome, credencial" quando há `revisadoPor`; senão, selo
  "Em revisão". O site pode ir ao ar antes da revisão terminar.
- `<Fonte>`: ao lado de todo número.

### Identidade

Paleta e tipografia do PDF (verde-escuro, acento laranja, Poppins nos títulos) em tokens CSS.
Tema escuro fora do MVP. Texto segue a seção 11.2 do plano (linguagem não capacitista, sem
recomendações reprodutivas).

## 4. Testes, qualidade e critérios de lançamento

### Testes (Vitest)

- `lib/risco.ts`:
  - toda idade de 21 a 45 bate com o JSON;
  - pontos do plano: 25 → 1 em 1.362 · 0,07%; 35 → 1 em 403; 40 → 1 em 98 · 1,02% · 99,0%
    sem; 45 → 1 em 38 · 97,4% sem;
  - interpolação: 35,5 fica entre 403 e 308 e o resultado é monotônico;
  - bordas: 20,9 e 45,1 → fora da tabela; 17 e 51 → inválido;
  - gêmeos → aviso, nunca número; óvulo doado → usa a idade da coleta.
- Grade: casos destacados = `round(1000/N)` em todas as idades; 25, 35, 40 e 45 anos dão
  1, 2, 10 e 26.
- Ilha `Calculadora` (Testing Library): digitar idade → cartão, aviso fixo presente,
  hash atualizado.

### Qualidade dos dados (no build)

- Schema zod da tabela: `fonte`, `referencia`, `atualizadoEm`, `conferido`; N inteiros e
  decrescentes com a idade.
- `astro build` falha se alguma tabela tiver `conferido: false`.
- Coleções exigem ao menos uma fonte por síndrome e por mito.

### Acessibilidade

`@axe-core/playwright` nas páginas principais e passada manual de teclado e leitor de tela na
calculadora. Meta: contraste WCAG AA.

### CI

GitHub Actions a cada push: lint, typecheck, Vitest, build e axe. Deploy só com tudo verde.

### Bloqueia o Lançamento 1

1. Tabela T21 conferida em Morris & Wald (2007) e marcada `conferido: true` (fase 0).
2. 9 páginas de síndromes e 7 mitos escritos a partir da seção 3 do plano e revisados pelo
   autor e coautor.
3. Página de metodologia completa.
4. Aviso fixo presente na calculadora (coberto por teste).

### Não bloqueia

Revisão por especialista (coberta pelo selo "Em revisão"), T18/T13, SINASC, simulador e API.
