/** Idade em anos completos na data prevista do parto, sem interpolação.
 * Usa o calendário real, não divisão por 365 dias; rejeita datas impossíveis.
 * Na data de aniversário, a idade avança um ano.
 */
export function idadePorDatas(nascimento: string, dataParto: string): number {
  const analisar = (texto: string): [number, number, number] | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
    const data = new Date(`${texto}T12:00:00Z`);
    if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== texto) return null;
    return texto.split('-').map(Number) as [number, number, number];
  };
  const inicio = analisar(nascimento);
  const fim = analisar(dataParto);
  if (!inicio || !fim || dataParto <= nascimento) return Number.NaN;
  const [anoNascimento, mesNascimento, diaNascimento] = inicio;
  const [anoParto, mesParto, diaParto] = fim;
  const aniversarioAindaNaoChegou = mesParto < mesNascimento ||
    (mesParto === mesNascimento && diaParto < diaNascimento);
  return anoParto - anoNascimento - (aniversarioAindaNaoChegou ? 1 : 0);
}
