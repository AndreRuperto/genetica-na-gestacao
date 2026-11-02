import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const fonte = z.object({ titulo: z.string(), url: z.url().optional() });
const revisor = z.object({ nome: z.string(), credencial: z.string() });

const sindromes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/sindromes' }),
  schema: z.object({
    nome: z.string(),
    cariotipo: z.string(),
    resumo: z.string().max(200),
    dependeIdadeMaterna: z.boolean(),
    ordem: z.number().int(),
    fontes: z.array(fonte).min(1),
    revisadoPor: revisor.optional(),
    atualizadoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const mitos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/mitos' }),
  schema: z.object({
    afirmacao: z.string(),
    veredito: z.enum(['Mito', 'Verdade']),
    ordem: z.number().int(),
    fontes: z.array(fonte).min(1),
  }),
});

export const collections = { sindromes, mitos };
