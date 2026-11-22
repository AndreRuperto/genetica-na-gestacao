# Roteiro para revisão independente — Genética da Gravidez Explicada

**Estado:** Aguardando avaliação de profissional qualificado. **Nenhuma revisão externa foi realizada ou aprovada até o momento.**

## Objetivo e limites

O projeto é **educativo** e apresenta os valores publicados de frequência de trissomia 21 **ao nascimento**, para gestação única, por idade inteira de 21 a 45 anos na data prevista do parto. Não pretende diagnosticar, orientar exames ou substituir aconselhamento genético.

Este roteiro busca uma revisão pontual de clareza, precisão e segurança das informações. **Não é um pedido para endossar o aplicativo ou declará-lo apto a decisões médicas.** Qualquer finalidade clínica futura exige análise específica, inclusive regulatória.

## Materiais a examinar

- [Auditoria pública e todos os 25 valores](https://genetica-na-gestacao.up.railway.app/auditoria).
- [Metodologia e limitações](https://genetica-na-gestacao.up.railway.app/metodologia).
- [Calculadora educativa](https://genetica-na-gestacao.up.railway.app/calculadora).
- [Registro da transcrição dos valores](../data/risco/CONFERENCIA-T21-2026-11-21.md).
- [Dados usados no site](../data/risco/t21.json) e [cálculo no código](../web/src/lib/risco.ts).
- [Tabela institucional do Prenatal Screening Ontario](https://www.prenatalscreeningontario.ca/types-of-screening/chromosome-screening/chromosome-differences/chance-of-chromosome-differences-based-on-age/) (fonte de comparação).
- [Orientações do ACOG sobre rastreamento e diagnóstico](https://www.acog.org/clinical/clinical-guidance/practice-advisory/articles/2026/01/screening-for-fetal-chromosomal-abnormalities) (consulte atualizações quando revisar).

## Questões para revisão clínica/editorial

Marcar somente após revisão real, com comentário indicando página, trecho e fundamento da correção.

- [ ] **Escopo:** os textos distinguem claramente frequência populacional **ao nascimento** de risco na gestação atual, prognóstico e diagnóstico?
- [ ] **Idade de referência:** a explicação de "idade em anos completos na data prevista do parto" está correta e suficientemente clara? Há ambiguidade no caso de óvulo doado?
- [ ] **Reprodução assistida:** é adequado o sistema **não oferecer resultado numérico** para FIV ou óvulos doados/congelados sem um modelo específico e revisão? O aviso é preciso?
- [ ] **Gestações múltiplas:** o bloqueio da apresentação de números está adequadamente explicado?
- [ ] **Visualizações:** expressões como "1 em N", porcentagens, complemento e grade de 1.000 casos hipotéticos podem induzir falsa precisão, confusão ou ansiedade? Precisam de outra redação?
- [ ] **Textos:** revisar as afirmações sobre condições cromossômicas, idade paterna, rastreamento, diagnóstico, NIPT, FIV, PGT e limitações em todas as páginas.
- [ ] **Fontes:** a tabela institucional e as demais referências estão bem atribuídas e atualizadas? Há recomendações mais recentes aplicáveis?
- [ ] **Acessibilidade e linguagem:** uma pessoa leiga entende que os números não descrevem um caso individual, nem substituem consulta?
- [ ] **Conclusão editorial:** identificar trechos que devam ser removidos, modificados ou acompanhados de contexto antes de divulgação ampla.

## Registro da revisão (preencher apenas após avaliação real)

| Campo | Informação |
|---|---|
| Profissional e qualificação | **Pendente** |
| Especialidade e registro profissional, se pertinente | **Pendente** |
| Data da revisão | **Pendente** |
| Versão/commit revisado | **Pendente** |
| Escopo efetivamente revisado | **Pendente** |
| Fontes adicionais utilizadas | **Pendente** |
| Ressalvas e correções solicitadas | **Pendente** |
| Decisão sobre liberação do conteúdo revisado | **Pendente** |
| Consentimento para publicar nome/parecer | **Pendente** |

O responsável pelo repositório deve documentar cada correção em issue/PR, executar testes e informar os limites do parecer. **Não publicar dados pessoais ou de pacientes, prontuários ou documentos clínicos** no repositório. Nome e detalhes do avaliador só podem ser publicados com autorização.

## Critérios para considerar esta etapa concluída

1. Parecer ou comentários rastreáveis de profissional com competência adequada ao escopo.
2. Correções identificadas registradas e implementadas ou justificadamente recusadas.
3. Testes e acessibilidade aprovados após as correções.
4. Página pública de auditoria atualizada com o escopo **real** da revisão, nunca uma alegação de aprovação genérica.
5. Se o propósito mudar para avaliação clínica individual, revisar exigências profissionais, éticas, de privacidade e de software como dispositivo médico com assessoramento especializado.

**Até lá:** tabela T21 transcrita e conferida com fonte institucional; interpretação clínica independente **não avaliada**.
