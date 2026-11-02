# Genética da Gravidez Explicada

Site educativo que mostra, com números confiáveis e fonte para cada um, como a idade materna
muda a chance de alterações cromossômicas na gestação.

**O que é:** material de divulgação científica em português, com uma calculadora que roda só no
navegador, visualizações simples e textos revisados sobre síndromes cromossômicas.

**O que não é:** diagnóstico, exame ou aconselhamento genético. Os números são estimativas
populacionais baseadas apenas na idade. O risco de uma gestação específica é refinado com exames
de rastreio e diagnóstico, junto com obstetra ou geneticista.

## O que já funciona

- **Calculadora de trissomia 21** (`/calculadora`): idade da mãe na data prevista do parto, ou
  cálculo pelas datas; óvulo próprio ou doado; aviso para gestação de gêmeos. Mostra uma grade de
  1.000 bebês (com opção de baixar como PNG), o cartão "1 em N" com porcentagem e fonte, a curva
  de risco em escala log e um aviso fixo. A idade fica no fragmento da URL (`#idade=38`), que o
  navegador não envia ao servidor. Nada é coletado.
- **Síndromes cromossômicas** (`/sindromes`): 9 páginas, cada uma com fonte e selo de revisão.
- **Mito ou verdade** (`/mito-ou-verdade`): 7 afirmações com veredito e fonte, com âncoras
  compartilháveis.
- **Painel genético** (`/painel-genetico`): o que o painel de portadores mostra e o que não mostra.
- **Metodologia** (`/metodologia`): fontes, fórmula, cuidados e a tabela completa.

## Como rodar

Requer Node 22 ou mais novo.

```bash
cd web
npm install
npm run dev
```

## Comandos

Todos rodam em `web/`.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build estático em `dist/` (falha se houver tabela não conferida) |
| `npm run preview` | Serve o build localmente |
| `npm test` | Testes unitários e de componentes (Vitest) |
| `npm run test:a11y` | Acessibilidade com axe e uso por teclado (Playwright; precisa de build) |
| `npm run check` | Verificação de tipos e de conteúdo (`astro check`) |

## Como os números entram

As tabelas de risco ficam em `data/risco/*.json`, fora do código do site. Cada uma traz a fonte,
o link, a data de atualização e o campo `conferido`. Os valores são validados por schema no
build (N inteiros, decrescentes com a idade, sem idades faltando).

A regra do `conferido`:

- `conferido: false` quer dizer que os valores ainda não foram conferidos na publicação original.
- `npm run build` **falha** enquanto houver tabela com `conferido: false`. É o build de produção.
- Para desenvolvimento, CI e pré-visualizações, use `PERMITIR_NAO_CONFERIDO=1`, que troca a falha
  por um aviso:

```bash
PERMITIR_NAO_CONFERIDO=1 npm run build
```

No PowerShell: `$env:PERMITIR_NAO_CONFERIDO=1; npm run build`.

Para conferir uma tabela, compare cada valor com a publicação original e, se tudo bater, mude
`conferido` para `true` e `atualizadoEm` para a data da conferência.

## Fontes e licenças

- Trissomia 21 ao nascimento: Morris JK, Wald NJ et al., *J Med Screen* 2007;14(1):5-7,
  conforme reproduzido pelo BORN Ontario.
- Trissomias 18 e 13: Savva GM, Walker K, Morris JK, *Prenat Diagn* 2010.
- Painel de portadores: ACOG Committee Opinions 690 e 691 (2017).
- Descrições das síndromes: Fetal Medicine Foundation e MedlinePlus Genetics.

Cada página cita a fonte ao lado do número. Fonte tipográfica: Poppins (SIL Open Font License),
via `@fontsource/poppins`.

## Documentos

Design e plano de implementação em [`docs/plans/`](docs/plans/).
