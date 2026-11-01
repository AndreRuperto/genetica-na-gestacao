const MS_POR_ANO = 365.2425 * 24 * 60 * 60 * 1000;

/** Idade (em anos, com fração) na data prevista do parto. Datas no formato AAAA-MM-DD. */
export function idadePorDatas(nascimento: string, dataParto: string): number {
  const a = Date.parse(nascimento);
  const b = Date.parse(dataParto);
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return Number.NaN;
  return (b - a) / MS_POR_ANO;
}
