const LARGURA = 1080;
const ALTURA = 1080;

/** Gera PNG 1080×1080 com a grade, título, legenda e fonte, tudo no navegador. */
export async function baixarImagem(svg: SVGSVGElement, titulo: string, legenda: string, fonte: string) {
  const css = getComputedStyle(document.documentElement);
  const cor = (v: string) => css.getPropertyValue(v).trim();
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // Variáveis CSS não existem fora do documento: resolve as cores antes de serializar.
  clone.querySelectorAll('circle').forEach((c) => {
    c.setAttribute('fill', c.classList.contains('caso') ? cor('--laranja') : cor('--verde-100'));
  });
  // Sem largura e altura explícitas o SVG vira imagem de 0×0 em alguns navegadores.
  clone.setAttribute('width', '480');
  clone.setAttribute('height', '300');
  const grade = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(grade);
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = LARGURA;
  canvas.height = ALTURA;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, LARGURA, ALTURA);
  ctx.fillStyle = cor('--verde-900');
  ctx.font = '700 56px Poppins, sans-serif';
  ctx.fillText(titulo, 60, 120);
  ctx.drawImage(img, 60, 180, 960, 600);
  ctx.font = '36px system-ui, sans-serif';
  ctx.fillText(legenda, 60, 860);
  ctx.fillStyle = cor('--texto-suave');
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText(fonte, 60, 960);
  ctx.fillText('andreruperto.dev', 60, 1010);

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${titulo.toLowerCase().replace(/\s+/g, '-')}.png`;
  a.click();
  URL.revokeObjectURL(a.href);
}
