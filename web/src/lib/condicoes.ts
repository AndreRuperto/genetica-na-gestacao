// Textos de cada condição. A calculadora só oferece as que têm tabela em data/risco.
export const CONDICOES = {
  t21: { sindrome: 'síndrome de Down', trissomia: 'trissomia 21' },
  t18: { sindrome: 'síndrome de Edwards', trissomia: 'trissomia 18' },
  t13: { sindrome: 'síndrome de Patau', trissomia: 'trissomia 13' },
} as const;

export type Condicao = keyof typeof CONDICOES;
export type TextosCondicao = (typeof CONDICOES)[Condicao];

export const ORDEM_CONDICOES = Object.keys(CONDICOES) as Condicao[];

export const maiuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export function ehCondicao(valor: string): valor is Condicao {
  return Object.hasOwn(CONDICOES, valor);
}
