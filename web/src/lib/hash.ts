// A idade fica no fragmento (#), que o navegador não envia ao servidor.
export function lerIdadeDoHash(hash: string): number | null {
  const m = /^#idade=(\d{1,2})$/.exec(hash);
  return m ? Number(m[1]) : null;
}

export function hashDaIdade(idade: number): string {
  return Number.isInteger(idade) ? `#idade=${idade}` : '';
}
