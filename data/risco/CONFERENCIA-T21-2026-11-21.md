# Auditoria da tabela T21 — 21/11/2026

## Resultado

**25/25 linhas verificadas e coincidentes** com a tabela de trissomia 21 ao nascimento publicada pelo
**Prenatal Screening Ontario (PSO)**, programa de rastreamento pré-natal de Ontário.

- **Fonte pública usada para a conferência integral:** [Chance of Chromosome Differences Based on Age — Prenatal Screening Ontario](https://www.prenatalscreeningontario.ca/types-of-screening/chromosome-screening/chromosome-differences/chance-of-chromosome-differences-based-on-age/).
- **Estudo citado pelo PSO:** J. K. Morris e N. J. Wald. *Estimating the risk of Down's syndrome in antenatal screening and the gestation at which this risk applies.* Journal of Medical Screening, 14(1), 5–7 (2007), [DOI 10.1258/096914107780154549](https://doi.org/10.1258/096914107780154549).
- **Data da conferência:** 21/11/2026.
- **Cobertura:** 25 idades inteiras de 21 a 45 anos, inclusive.
- **Indicador:** chance de trissomia 21 **ao nascimento**, para gestação única, expressa como "1 em N"; idade na data prevista do parto.
- **Arquivo revisado:** `data/risco/t21.json`. Os valores numéricos já coincidiam com a fonte, portanto **nenhum valor da tabela precisou ser alterado**.
- **Regressão:** `web/tests/referencia-t21-pso.test.ts` registra separadamente os 25 valores conferidos, evitando mudanças silenciosas.

| Idade (anos) | Valor publicado pelo PSO | Valor no projeto | Resultado |
|---|---|---|---|
| 21–24 | 1470, 1452, 1430, 1400 | Iguais | 4/4 |
| 25–29 | 1362, 1315, 1255, 1182, 1095 | Iguais | 5/5 |
| 30–34 | 994, 881, 759, 634, 513 | Iguais | 5/5 |
| 35–39 | 403, 308, 231, 172, 129 | Iguais | 5/5 |
| 40–45 | 98, 76, 61, 50, 43, 38 | Iguais | 6/6 |

**Limite da atribuição:** a reprodução institucional do PSO foi usada para comparar linha por linha. O artigo científico original foi identificado pelo título, periódico e DOI; **não se afirma uma comparação numérica independente com tabelas do PDF original**.

## O que esta auditoria valida — e o que não valida

Valida a **transcrição dos valores publicados** para idades inteiras entre 21 e 45 anos e o recorte "ao nascimento". Não valida a calculadora como instrumento de rastreamento pré-natal, diagnóstico ou aconselhamento individual.

Os itens abaixo continuam sendo aproximações de implementação, não linhas conferidas da tabela do PSO:

1. **Idades fracionárias:** a implementação interpola `log(N)` entre idades inteiras vizinhas. É uma escolha matemática de visualização; a fonte apresenta apenas idades inteiras. Não atribuir a interpolação diretamente a Morris & Wald/PSO.
2. **FIV e doação de óvulos:** o site permite informar a idade no momento da coleta para representar a origem do óvulo. A nota da tabela institucional especifica **idade na data prevista do nascimento**. A aplicação da tabela de referência à idade na coleta, sem ajuste específico e sem dados clínicos/PGT, **não constitui cálculo clinicamente validado para FIV**. Essa ressalva deve permanecer visível.
3. **Gestações múltiplas:** a calculadora não fornece número e deve continuar assim até existir fonte apropriada.
4. **Estimativa ao nascimento ≠ chance no trimestre atual:** o valor não substitui rastreamento, teste diagnóstico nem avaliação médica.
5. **Generalização populacional:** prevalências e desfechos podem variar conforme população e contexto de rastreamento; a publicação de uma curva histórica não quantifica um caso individual.

## Critérios de segurança editorial e manutenção

- O metadado `conferido: true` significa **"25 valores conferidos contra fonte institucional identificada"**, e não "aplicação avaliada ou aprovada clinicamente".
- O objeto `verificacao` registra fonte, URL, data, escopo e total de linhas.
- O schema exige esse registro sempre que uma tabela for marcada como conferida; o build padrão continua bloqueando outras tabelas pendentes.
- A página de metodologia deve apresentar a fonte institucional e manter a referência ao estudo científico original, explicando claramente a distinção.
- O aviso sobre a natureza educacional da estimativa permanece na calculadora e no PNG exportado.
- Para ampliar a calculadora (T18/T13, outras faixas etárias, FIV, gêmeos), realizar **nova auditoria do conjunto de dados e revisão clínica específica**, com testes e referências rastreáveis.

## Verificações de qualidade

Depois de alterar os arquivos, executar na pasta `web/`:
```bash
npm ci
npm run check
npm test
npm run build
```
A CI também roda acessibilidade com Playwright; capturas e UX médica não substituem revisão especializada.

**Status:** transcrição T21 verificada em fonte institucional; revisão clínica independente do produto **não realizada**.
