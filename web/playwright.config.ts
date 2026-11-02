import { defineConfig } from '@playwright/test';

// Porta própria: a 4321 padrão costuma estar ocupada por outros projetos Astro na máquina.
const PORTA = 4340;

export default defineConfig({
  testDir: 'e2e',
  webServer: { command: `npm run preview -- --port ${PORTA}`, port: PORTA, reuseExistingServer: !process.env.CI },
  use: { baseURL: `http://localhost:${PORTA}` },
});
