import { z } from 'astro/zod';

export const tabelaSchema = z
  .object({
    condicao: z.string(),
    nome: z.string(),
    fonte: z.string().min(1),
    fonteUrl: z.url(),
    reproduzidaEm: z.string().optional(),
    referencia: z.literal('nascido_vivo'),
    gestacao: z.literal('unica'),
    idade: z.literal('data_prevista_parto'),
    atualizadoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    conferido: z.boolean(),
    valores: z.record(z.string().regex(/^\d+$/), z.number().int().positive()),
  })
  .superRefine((t, ctx) => {
    const idades = Object.keys(t.valores).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < idades.length; i++) {
      if (idades[i] !== idades[i - 1] + 1) {
        ctx.addIssue({ code: 'custom', message: `idade ${idades[i - 1] + 1} faltando` });
      }
      if (t.valores[idades[i]] >= t.valores[idades[i - 1]]) {
        ctx.addIssue({ code: 'custom', message: `N deve ser decrescente (idade ${idades[i]})` });
      }
    }
  });

export type Tabela = z.infer<typeof tabelaSchema>;
