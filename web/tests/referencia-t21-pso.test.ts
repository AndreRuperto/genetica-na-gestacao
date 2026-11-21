import { describe, expect, test } from 'vitest';
import t21 from '@dados/risco/t21.json';
import { tabelaSchema } from '../src/lib/tabela';

// Transcrição independente de todos os valores da tabela pública institucional do
// Prenatal Screening Ontario (consulta de 21/11/2026), idades ao parto, T21 ao nascimento.
// https://www.prenatalscreeningontario.ca/types-of-screening/chromosome-screening/chromosome-differences/chance-of-chromosome-differences-based-on-age/
// O teste protege contra alterações acidentais; não substitui nova auditoria externa.
const T21_PSO_20261121: Record<string, number> = {
  '21': 1470, '22': 1452, '23': 1430, '24': 1400, '25': 1362,
  '26': 1315, '27': 1255, '28': 1182, '29': 1095, '30': 994,
  '31': 881, '32': 759, '33': 634, '34': 513, '35': 403,
  '36': 308, '37': 231, '38': 172, '39': 129, '40': 98,
  '41': 76, '42': 61, '43': 50, '44': 43, '45': 38,
};

describe('conferência da tabela T21 com fonte institucional', () => {
  test('as 25 linhas coincidem integralmente com a tabela do PSO', () => {
    expect(t21.valores).toEqual(T21_PSO_20261121);
    expect(Object.keys(t21.valores)).toHaveLength(25);
    expect(t21.referencia).toBe('nascido_vivo');
    expect(t21.gestacao).toBe('unica');
    expect(t21.idade).toBe('data_prevista_parto');
  });

  test('a marca de conferência aponta para fonte, data e escopo auditáveis', () => {
    expect(t21.conferido).toBe(true);
    expect(t21.verificacao.fonte).toBe('Prenatal Screening Ontario');
    expect(t21.verificacao.fonteUrl).toContain('chance-of-chromosome-differences-based-on-age');
    expect(t21.verificacao.totalLinhas).toBe(25);
    expect(t21.verificacao.conferidoEm).toBe('2026-11-21');
    expect(t21.verificacao.escopo).toMatch(/Não valida a interpolação/);
    expect(() => tabelaSchema.parse(t21)).not.toThrow();
  });

  test('não permite conferir uma tabela sem registro de auditoria', () => {
    const { verificacao, ...semFonte } = t21;
    expect(() => tabelaSchema.parse(semFonte)).toThrow(/registro de verificação/);
  });

  test('não aceita metadado de número de linhas diferente do conteúdo', () => {
    const adulterada = { ...t21, verificacao: { ...t21.verificacao, totalLinhas: 24 } };
    expect(() => tabelaSchema.parse(adulterada)).toThrow(/total de linhas/);
  });
});
