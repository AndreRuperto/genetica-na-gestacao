# Aplicação web — Genética na Gestação

Frontend em Astro, React e TypeScript do site **Genética da Gravidez Explicada**.

A documentação principal, com recursos, imagens, estado dos dados, privacidade e contribuição, está no [README da raiz](../README.md).

## Início rápido

Requer Node.js 22.23.4 ou superior. Execute nesta pasta:

```bash
npm ci
npm run dev -- --background
```

Abra http://localhost:4321. No PowerShell, use `npm.cmd` se a execução de `npm.ps1` estiver bloqueada.

## Verificações

```bash
npm run check
npm test
```

Para uma prévia com a tabela ainda em conferência, siga as instruções de [build de demonstração](../README.md#build-de-demonstração). O build de produção continua bloqueado enquanto os dados não forem conferidos.

Os testes de navegador usam Playwright; a instalação do Chromium e os comandos de acessibilidade estão descritos no README principal.

## Onde alterar

- `src/pages/`: páginas e rotas.
- `src/content/`: síndromes e mitos/verdades com fontes.
- `src/islands/`: calculadora e visualizações React.
- `src/lib/`: cálculo, validação e exportação de PNG.
- `src/styles/`: tema e layout.
- `../data/risco/`: dados e status de conferência.

Licença: [MIT](../LICENSE), com as ressalvas sobre materiais externos descritas na documentação principal.
