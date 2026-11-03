// A idade fica no fragmento (#), que o navegador não envia ao servidor.
export function lerConfiguracaoDoHash(hash: string) {
  if (!hash.startsWith('#')) return null;
  const params = new URLSearchParams(hash.slice(1));
  if ([...params.keys()].some((k) => !['idade', 'ovulo', 'bebes'].includes(k) || params.getAll(k).length !== 1)) return null;
  const texto = params.get('idade') ?? '';
  if (!/^\d{1,2}$/.test(texto)) return null;
  const idade = Number(texto);
  if (idade < 18 || idade > 50) return null;
  const ovulo = params.get('ovulo') ?? 'proprio';
  const bebes = params.get('bebes') ?? '1';
  if (!['proprio', 'doado'].includes(ovulo) || !['1', '2'].includes(bebes)) return null;
  return { idade, ovulo: ovulo as 'proprio' | 'doado', bebes: Number(bebes) as 1 | 2 };
}

export function lerIdadeDoHash(hash: string): number | null {
  return lerConfiguracaoDoHash(hash)?.idade ?? null;
}

export function hashDaIdade(idade: number, ovulo: 'proprio' | 'doado' = 'proprio', bebes = 1): string {
  if (!Number.isInteger(idade) || idade < 18 || idade > 50) return '';
  return `#idade=${idade}${ovulo === 'doado' ? '&ovulo=doado' : ''}${bebes > 1 ? '&bebes=2' : ''}`;
}
