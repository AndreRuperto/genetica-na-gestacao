// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tabelasConferidas from './integrations/tabelas-conferidas.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), tabelasConferidas()],
  vite: { server: { fs: { allow: ['..'] } } },
});
