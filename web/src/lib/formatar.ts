const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const duasCasas = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const umEmN = (n: number) => `1 em ${inteiro.format(Math.round(n))}`;
export const porcentagem = (pct: number) => `${duasCasas.format(pct)}%`;
// Uma casa: 99,93% vira "99,9%", nunca "100,0%" na faixa da tabela.
export const complemento = (pct: number) => `${umaCasa.format(pct)}%`;
