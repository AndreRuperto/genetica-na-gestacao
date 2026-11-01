// Falha o build de produção se alguma tabela de risco não foi conferida na fonte original.
// Builds de pré-visualização (CI, deploy preview) passam com PERMITIR_NAO_CONFERIDO=1.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pasta = fileURLToPath(new URL('../../data/risco/', import.meta.url));

export default function tabelasConferidas() {
  return {
    name: 'tabelas-conferidas',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const pendentes = readdirSync(pasta)
          .filter((f) => f.endsWith('.json'))
          .filter((f) => !JSON.parse(readFileSync(pasta + f, 'utf8')).conferido);
        if (pendentes.length === 0) return;
        const msg = `tabelas não conferidas: ${pendentes.join(', ')}`;
        if (process.env.PERMITIR_NAO_CONFERIDO === '1') logger.warn(msg);
        else throw new Error(`${msg}. Confira na publicação original e marque "conferido": true.`);
      },
    },
  };
}
