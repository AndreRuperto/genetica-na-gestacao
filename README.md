# Genética na Gestação

**Genética e gravidez em linguagem simples, com números em contexto e fontes para aprofundar a leitura.**

[![CI](https://github.com/AndreRuperto/genetica-na-gestacao/actions/workflows/ci.yml/badge.svg)](https://github.com/AndreRuperto/genetica-na-gestacao/actions/workflows/ci.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-aad19c)](LICENSE)

Código do site **Genética da Gravidez Explicada**: uma experiência educativa em português que reúne calculadora de estimativas, visualizações e explicações sobre genética na gestação. Tema escuro, navegação por teclado e layouts para celular e desktop.

> [!IMPORTANT]
> **Projeto educativo, não ferramenta clínica.** Os 25 valores de trissomia 21 (21–45 anos) foram conferidos linha a linha com a tabela institucional do [Prenatal Screening Ontario](https://www.prenatalscreeningontario.ca/types-of-screening/chromosome-screening/chromosome-differences/chance-of-chromosome-differences-based-on-age/), adaptada de Morris & Wald (2007). Essa conferência valida a transcrição dos valores inteiros, **não o uso como ferramenta clínica**. Para evitar inferências, a aplicação deixou de interpolar idades e de calcular resultados para FIV. Não houve revisão clínica independente do produto.

![Página inicial do projeto em tema escuro](docs/images/inicio.png)

## O que você encontra

| Página | Conteúdo |
| --- | --- |
| `/` | Apresentação, números de exemplo e acesso aos conteúdos |
| `/calculadora` | Estimativa de trissomia 21 por idade, grade de 1.000 pontos, curva e exportação em PNG |
| `/sindromes` | Nove guias sobre alterações cromossômicas, com referências e status de revisão |
| `/mito-ou-verdade` | Cinco mitos e cinco verdades, intercalados, com filtros e fontes |
| `/painel-genetico` | O que o painel de portadores pesquisa, um exemplo de herança recessiva e limites do exame |
| `/metodologia` | Fontes, fórmulas, tabela completa, limitações e conferência dos dados |
| `/auditoria` | Histórico da auditoria, 25 valores, fontes e limites; revisão clínica externa pendente |

### Uma calculadora que explica o resultado

- No modo sem FIV, consulta somente a idade inteira da gestante na data prevista do parto; FIV apresenta informações educativas, sem estimativa.
- Permite digitar idade inteira ou obtê-la pelas datas em anos completos, sem interpolação entre idades.
- Apresenta a estimativa como **1 em N**, percentual e complemento, sem tratar o resultado como diagnóstico.
- Representa 1.000 nascimentos hipotéticos e identifica o arredondamento dos pontos.
- Exporta um infográfico com contexto da idade, fonte e aviso de conferência.
- Mantém links com idades inteiras no modo sem FIV; links antigos de FIV não exibem estimativas e a troca de modo apaga a idade preenchida.
- Não calcula FIV, gestações múltiplas, idades fracionárias ou idades fora da faixa publicada.

![Exemplo do painel de resultado da calculadora, com números e grade de pontos](docs/images/calculadora.png)

## Executar localmente

Requisitos: **Node.js 22.23.4 ou superior**, npm e Git. Os comandos da aplicação são executados na pasta `web/`.

```bash
git clone https://github.com/AndreRuperto/genetica-na-gestacao.git
cd genetica-na-gestacao/web
npm ci
npm run dev -- --background
```

Abra **http://localhost:4321** ou a porta indicada no terminal.

No PowerShell, use `npm.cmd` e `npx.cmd` no lugar de `npm` e `npx` se a política de execução bloquear os arquivos `.ps1`. Não é preciso alterar a política do sistema.

```powershell
npm.cmd ci
npm.cmd run dev -- --background
```

Gerencie o servidor em segundo plano:

```bash
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

## Desenvolvimento e verificações

Todos os comandos abaixo partem de `web/`.

| Comando | Finalidade |
| --- | --- |
| `npm run check` | Verificação de tipos, componentes Astro e conteúdo |
| `npm test` | Testes de cálculo, componentes, links e conteúdo com Vitest |
| `npm run test:a11y` | Acessibilidade com axe e navegação por teclado com Playwright |
| `npm run build` | Build estático de produção, sujeito à conferência dos dados |
| `npm run preview -- --port 4340` | Prévia do build em http://localhost:4340 |

Para os testes de navegador, instale o Chromium do Playwright uma vez:

```bash
npx playwright install chromium
```

A integração contínua executa verificação de tipos, testes, build normal de produção e testes de acessibilidade a cada push e pull request. Consulte o [workflow de CI](.github/workflows/ci.yml).

### Build de demonstração

A tabela T21 agora tem verificação documentada e o **build padrão de produção pode rodar sem exceções**. Se outras tabelas não conferidas forem adicionadas, a proteção continua ativa. Só para desenvolvimento e revisão de tabelas futuras, é possível permitir um build de demonstração:

```bash
PERMITIR_NAO_CONFERIDO=1 npm run build
npm run preview -- --port 4340
```

No PowerShell:

```powershell
$env:PERMITIR_NAO_CONFERIDO = "1"
npm.cmd run build
npm.cmd run preview -- --port 4340
```

Essa variável **não valida os dados** e não remove os avisos da interface. Para voltar à validação padrão no PowerShell, execute `Remove-Item Env:PERMITIR_NAO_CONFERIDO`.

## Deploy no Railway

O repositório inclui um [`Dockerfile`](Dockerfile) com build em Node.js e servidor estático Caddy, além da configuração [`railway.json`](railway.json). O container final contém os arquivos gerados em `web/dist/` e escuta na variável `PORT` fornecida pelo Railway (8080 por padrão).

1. Conecte este repositório ao serviço, usando a branch `main`.
2. Mantenha **Root Directory** na raiz do repositório (`/`), pois o build também precisa de `data/`. Usar apenas `/web` exclui esses dados.
3. Deixe **Build Command** e **Start Command** sem substituições manuais. A configuração usa o Dockerfile para construir e iniciar o site.
4. Para a única tabela atual (T21, verificada no PSO), **não é mais necessário configurar `PERMITIR_NAO_CONFERIDO=1`**. Se essa variável já existir, remova-a para manter o bloqueio de futuras tabelas não conferidas. A liberação do build não transforma o site em ferramenta clínica.
5. Faça um novo deploy com o commit mais recente e gere o domínio público em **Networking**.

O build continua bloqueado quando houver alguma tabela pendente sem registro rastreável de conferência. O aviso educacional da calculadora permanece mesmo com a T21 conferida.

Para testar o mesmo container localmente, a partir da raiz:

```bash
docker build -t genetica-na-gestacao .
docker run --rm -p 8080:8080 genetica-na-gestacao
```

Abra http://localhost:8080. As rotas são servidas como páginas estáticas independentes, incluindo URLs acessadas diretamente, como `/sindromes/down/`.

## Dados, referências e limites

Os valores ficam em [`data/risco/t21.json`](data/risco/t21.json), separados do código. **As 25 linhas (21–45 anos) coincidem integralmente com a tabela pública do [Prenatal Screening Ontario](https://www.prenatalscreeningontario.ca/types-of-screening/chromosome-screening/chromosome-differences/chance-of-chromosome-differences-based-on-age/)**, que declara ser adaptada de Morris & Wald (2007). Os valores numéricos não precisaram de correção. Leia o [registro de auditoria](data/risco/CONFERENCIA-T21-2026-11-21.md), incluindo o escopo, as limitações e o teste de regressão. O schema verifica números inteiros positivos, continuidade, ordenação e metadados de conferência.

O recorte atual é **trissomia 21 ao nascimento, em gestação única, para idades de referência entre 21 e 45 anos**. Não representa probabilidade de engravidar, resultado de exame ou avaliação de todas as condições de saúde. A tabela do PSO especifica idade **na data prevista do parto**. Na FIV ou com óvulos doados/congelados, **não há estimativa numérica**: o modo é apenas informativo. Idades fracionárias não são interpoladas; se a idade for obtida a partir de duas datas, são usados os anos completos na data prevista do parto. Exames e características individuais não entram na consulta.

Para atualizar uma tabela:

1. Compare todos os valores com uma fonte institucional rastreável ou a publicação original e confira a população e o momento da estimativa.
2. Registre fonte, URL, data, escopo e número de linhas no campo `verificacao`, distinguindo fonte original de reprodução institucional.
3. Altere `conferido` para `true` somente após a comparação integral; inclua um teste de regressão independente.
4. Execute as verificações e revise a explicação mostrada na interface.

Fontes indicadas no projeto incluem [MedlinePlus Genetics](https://medlineplus.gov/genetics/), [NHS England Genomics Education](https://www.genomicseducation.hee.nhs.uk/), [ACOG](https://www.acog.org/womens-health/faqs/carrier-screening), [GECKO](https://www.geneticseducation.ca/a-guide-to-understanding-prenatal-screening-tests) e as publicações citadas em cada página. A presença de uma referência não substitui a conferência da tabela nem a revisão especializada do conteúdo.

## Privacidade e acessibilidade

Os campos da calculadora são processados no navegador, sem envio para uma API e sem analytics de saúde implementados pelo projeto. Fontes tipográficas são servidas junto com a aplicação.

O link pode conter a idade inteira e o número de bebês, por exemplo `#idade=25`, para o modo sem FIV. **Novos links de FIV com números não são gerados**, e links antigos de FIV não produzem estimativa. O fragmento não é enviado na requisição HTTP, mas pode ser visto por quem receber o link. Datas de nascimento e parto não entram no endereço. O PNG exportado mantém o contexto da idade de referência.

A interface inclui foco visível, controles por teclado, descrições das visualizações, tabela equivalente à curva e respeito a `prefers-reduced-motion`. A animação da página inicial permite pausa; o movimento ao passar o mouse é desativado em dispositivos de toque e quando há preferência por movimento reduzido.

## Estrutura e tecnologias

```text
genetica-na-gestacao/
├── .github/workflows/       # Integração contínua
├── data/risco/              # Tabelas, fontes e status de conferência
├── docs/                    # Imagens, design e planos
└── web/
    ├── public/              # Arquivos estáticos
    ├── src/
    │   ├── components/      # Elementos compartilhados e avisos
    │   ├── content/         # Síndromes e afirmações em Markdown/MDX
    │   ├── islands/         # Calculadora e visualizações React
    │   ├── layouts/         # Estrutura das páginas
    │   ├── lib/             # Cálculos, validação, links e exportação
    │   ├── pages/           # Rotas Astro
    │   └── styles/          # Tema e estilos responsivos
    ├── tests/               # Testes unitários e de componentes
    └── e2e/                 # Testes no navegador
```

**Astro + React + TypeScript**, conteúdo em Markdown/MDX, gráficos em SVG com D3, exportação por Canvas e tipografia Poppins. O resultado do build é estático, sem backend próprio.

## Contribuir

Issues e pull requests são bem-vindos. Descreva o problema ou a melhoria, mantenha as mudanças focadas e execute `npm run check` e `npm test`. Para alterações visuais, inclua a verificação no celular e por teclado.

Alterações em conteúdo de saúde devem trazer referências verificáveis. Não remova os avisos de limite ou de conferência para fazer uma validação passar. Decisões anteriores estão documentadas em [`docs/plans/`](docs/plans/).

Próximas etapas: obter **revisão clínica independente** dos textos e visualizações, usando o [roteiro de revisão](docs/revisao-clinica-checklist.md). A [auditoria pública](https://genetica-na-gestacao.up.railway.app/auditoria) informa o escopo conferido e as pendências. Qualquer retorno a estimativas de FIV, idades fracionárias ou outras condições exige fonte adequada, justificativa metodológica e revisão especializada.

## Licença

Código e documentação original sob a [licença MIT](LICENSE). Bibliotecas, a fonte Poppins (SIL Open Font License) e materiais externos citados mantêm suas próprias licenças e direitos.

Criado por [André Ruperto](https://andreruperto.dev).
