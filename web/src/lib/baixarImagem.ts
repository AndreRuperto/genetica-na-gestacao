import { complemento, porcentagem, umEmN } from './formatar';

const LARGURA = 1080;

type DadosImagem = {
  contexto: string;
  conferido: boolean;
  n: number;
  fonte: string;
  fonteUrl: string;
  interpolado: boolean;
};

/** Infográfico independente: chance da tabela e contagem arredondada têm rótulos distintos. */
export async function baixarImagem(svg: SVGSVGElement, dados: DadosImagem) {
  await document.fonts.ready;
  const css = getComputedStyle(document.documentElement);
  const cor = (nome: string) => css.getPropertyValue(nome).trim();
  const cores = {
    fundo: cor('--fundo'), titulo: cor('--titulo'), texto: '#bfccb6',
    suave: '#9eaf94', verde: '#b9dba5', ponto: cor('--verde-100'),
    laranja: cor('--laranja'), borda: '#3b5140', painel: '#19271e',
  };
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll('circle').forEach((circulo) => {
    circulo.setAttribute('fill', circulo.classList.contains('caso') ? cores.laranja : cores.ponto);
  });
  clone.setAttribute('width', '480');
  clone.setAttribute('height', '300');
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = LARGURA;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível preparar a imagem.');
  const fonte = (tamanho: number, peso = 400) => {
    ctx.font = `${peso} ${tamanho}px Poppins, sans-serif`;
  };
  const linhas = (texto: string, largura: number, tamanho: number, peso = 400) => {
    fonte(tamanho, peso);
    const resultado: string[] = [];
    for (const paragrafo of texto.split('\n')) {
      let linha = '';
      for (const palavra of paragrafo.split(/\s+/)) {
        const proxima = linha ? `${linha} ${palavra}` : palavra;
        if (linha && ctx.measureText(proxima).width > largura) {
          resultado.push(linha);
          linha = palavra;
        } else linha = proxima;
      }
      resultado.push(linha);
    }
    return resultado;
  };
  const texto = (valor: string, x: number, y: number, largura: number, tamanho: number,
    color = cores.texto, peso = 400, entrelinha = tamanho * 1.45) => {
    const partes = linhas(valor, largura, tamanho, peso);
    ctx.fillStyle = color;
    partes.forEach((parte, i) => ctx.fillText(parte, x, y + i * entrelinha));
    return y + partes.length * entrelinha;
  };
  const caixa = (x: number, y: number, largura: number, altura: number, raio: number,
    preenchimento: string, borda?: string) => {
    ctx.beginPath();
    ctx.roundRect(x, y, largura, altura, raio);
    ctx.fillStyle = preenchimento;
    ctx.fill();
    if (borda) {
      ctx.strokeStyle = borda;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };
  const linha = (x1: number, y1: number, x2: number, y2: number, color = cores.borda) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
  };
  const ponto = (x: number, y: number, raio: number, color: string) => {
    ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  };

  // Mede os textos antes de desenhar: contextos por datas podem ocupar mais de uma linha.
  const alturaContexto = Math.max(82, linhas(dados.contexto + '.', 878, 23, 500).length * 33 + 30);
  const corpoY = 244 + alturaContexto + 20;
  const corpoAltura = 608;
  const notaY = corpoY + corpoAltura + 22;
  const nota = 'Cada ponto representa 1 bebê em 1.000 nascimentos hipotéticos. Os totais da grade são arredondados; não são casos observados nem uma previsão individual.';
  const notaAltura = linhas(nota, 984, 20).length * 29;
  const fonteY = notaY + notaAltura + 22;
  const fonteTexto = `Fonte informada: ${dados.fonte}.`;
  const fonteAltura = linhas(fonteTexto, 984, 18).length * 26;
  const enderecoFonte = dados.fonteUrl.replace(/^https?:\/\//, '');
  const enderecoAltura = linhas(enderecoFonte, 984, 16).length * 23;
  const statusY = fonteY + 27 + fonteAltura + enderecoAltura + 14 + (dados.interpolado ? 28 : 0);
  const statusAltura = dados.conferido ? 62 : 94;
  const avisoY = statusY + statusAltura + 20;
  const aviso = 'Estimativa populacional baseada apenas na idade. Não é diagnóstico nem probabilidade de engravidar. “Sem trissomia 21” não exclui outras condições. Converse com seu obstetra ou geneticista.';
  const avisoAltura = linhas(aviso, 984, 18).length * 27;
  const rodapeY = avisoY + avisoAltura + 26;
  canvas.height = Math.max(1440, Math.ceil(rodapeY + 75));
  ctx.textBaseline = 'top';

  ctx.fillStyle = cores.fundo;
  ctx.fillRect(0, 0, LARGURA, canvas.height);
  const luz = ctx.createRadialGradient(850, 70, 0, 850, 70, 620);
  luz.addColorStop(0, '#b9dba509'); luz.addColorStop(1, '#b9dba500');
  ctx.fillStyle = luz; ctx.fillRect(0, 0, LARGURA, 660);

  // Marca discreta e cabeçalho editorial.
  caixa(48, 42, 48, 52, 14, '#283f2e', '#506847');
  ctx.save(); ctx.translate(61, 51); ctx.strokeStyle = cores.verde; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(3, 0); ctx.bezierCurveTo(3, 15, 19, 19, 19, 34);
  ctx.moveTo(19, 0); ctx.bezierCurveTo(19, 15, 3, 19, 3, 34);
  for (const [y, x1, x2] of [[0, 3, 19], [6, 5, 17], [14, 9, 13], [22, 8, 14], [29, 5, 17], [34, 3, 19]]) {
    ctx.moveTo(x1, y); ctx.lineTo(x2, y);
  }
  ctx.stroke(); ctx.restore();
  texto('Genética da Gravidez', 111, 45, 460, 22, cores.titulo, 600);
  texto('E X P L I C A D A', 112, 76, 400, 13, cores.verde, 500);
  caixa(744, 51, 288, 33, 16, '#acd29e08', '#506847');
  texto('INFORMAÇÃO EM PERSPECTIVA', 764, 59, 252, 14, cores.verde, 500);

  texto('Síndrome de Down', 48, 126, 984, 51, cores.titulo, 600);
  texto('Trissomia 21  ·  estimativa ao nascimento  ·  gestação única', 50, 195, 984, 21, cores.texto);
  caixa(48, 244, 984, alturaContexto, 14, '#1d2c21', '#4a6044');
  // Ícone de calendário para conectar o valor à referência correta.
  caixa(67, 265, 31, 31, 7, '#acd29e0a', '#5a724f');
  linha(74, 273, 91, 273, cores.verde);
  linha(78, 269, 78, 275, cores.verde); linha(87, 269, 87, 275, cores.verde);
  ponto(78, 282, 1.5, cores.verde); ponto(86, 282, 1.5, cores.verde);
  texto(dados.contexto + '.', 115, 263, 878, 23, cores.titulo, 500, 33);

  caixa(48, corpoY, 984, corpoAltura, 20, cores.painel, cores.borda);
  linha(367, corpoY + 28, 367, corpoY + corpoAltura - 28, '#364b39');
  const pct = 100 / dados.n;
  const casos = Math.round(1000 / dados.n);
  ponto(77, corpoY + 40, 4, cores.laranja);
  texto('CHANCE ESTIMADA', 91, corpoY + 30, 252, 16, '#d1c2ae', 500);
  const chance = umEmN(dados.n);
  let tamanhoNumero = 59;
  fonte(tamanhoNumero, 500);
  while (ctx.measureText(chance).width > 272 && tamanhoNumero > 36) {
    tamanhoNumero -= 1; fonte(tamanhoNumero, 500);
  }
  texto(chance, 72, corpoY + 82, 272, tamanhoNumero, cores.titulo, 500);
  fonte(23, 500);
  const larguraPct = ctx.measureText(porcentagem(pct)).width + 28;
  caixa(72, corpoY + 165, larguraPct, 39, 7, '#e9ac7410', '#8d6744');
  texto(porcentagem(pct), 86, corpoY + 173, larguraPct - 20, 23, '#f2bf8d', 500);
  texto('dos nascimentos, segundo a tabela', 72, corpoY + 217, 272, 18, cores.texto, 400, 27);

  caixa(72, corpoY + 300, 272, 168, 13, '#acd29e06', '#5f7954');
  texto('CHANCE DE NÃO TER\nTRISSOMIA 21', 90, corpoY + 316, 236, 16, '#c1d1b5', 500, 24);
  texto(complemento(100 - pct), 90, corpoY + 371, 236, 50, cores.verde, 500);
  texto('Não exclui outras condições.', 90, corpoY + 438, 236, 16, cores.texto);
  texto('Os números descrevem uma população. Não determinam o resultado de uma gestação específica.', 72, corpoY + 492, 272, 17, cores.texto, 400, 26);

  texto('Em 1.000 nascimentos', 392, corpoY + 28, 616, 26, cores.titulo, 500);
  texto('1 ponto = 1 bebê  ·  totais arredondados', 392, corpoY + 70, 616, 18, cores.texto);
  caixa(392, corpoY + 111, 616, 398, 13, '#101c14', '#3b5140');
  ctx.drawImage(img, 404, corpoY + 123, 592, 370);
  const legendaY = corpoY + 526;
  for (const item of [
    { x: 392, valor: casos, rotulo: 'com síndrome\nde Down', color: cores.laranja, fundo: '#e9ac7407', borda: '#8d6744' },
    { x: 708, valor: 1000 - casos, rotulo: 'sem síndrome\nde Down', color: cores.verde, fundo: '#acd29e07', borda: '#5f7954' },
  ]) {
    caixa(item.x, legendaY, 300, 62, 10, item.fundo, item.borda);
    ponto(item.x + 15, legendaY + 31, 3.5, item.color);
    texto(String(item.valor), item.x + 27, legendaY + 12, 85, 34, item.color, 500);
    texto(item.rotulo, item.x + 119, legendaY + 9, 168, 17, cores.texto, 400, 23);
  }

  texto(nota, 48, notaY, 984, 20, cores.texto, 400, 29);
  linha(48, fonteY - 12, 1032, fonteY - 12);
  texto('FONTE E LIMITES DA ESTIMATIVA', 48, fonteY, 984, 14, cores.verde, 500);
  texto(fonteTexto, 48, fonteY + 27, 984, 18, cores.texto, 400, 26);
  texto(enderecoFonte, 48, fonteY + 27 + fonteAltura, 984, 16, cores.verde, 400, 23);
  if (dados.interpolado) texto('Idade calculada pelas datas: valor interpolado entre idades vizinhas.', 48,
    fonteY + 27 + fonteAltura + enderecoAltura + 3, 984, 17, cores.texto);
  caixa(48, statusY, 984, statusAltura, 12, dados.conferido ? '#213320' : '#30271d',
    dados.conferido ? '#5f7954' : '#9f7851');
  ponto(69, statusY + 23, 4, dados.conferido ? cores.verde : cores.laranja);
  texto(dados.conferido ? 'VALORES CONFERIDOS NA PUBLICAÇÃO ORIGINAL' : 'DADOS EM CONFERÊNCIA', 84, statusY + 13, 924, 17,
    dados.conferido ? cores.verde : '#f1c99e', 600);
  if (!dados.conferido) texto('Valores ainda não conferidos na publicação original. Demonstração educativa; não use para decisões de saúde.',
    68, statusY + 40, 944, 18, '#dfc6a8', 400, 25);
  texto(aviso, 48, avisoY, 984, 18, cores.texto, 400, 27);
  linha(48, rodapeY - 10, 1032, rodapeY - 10);
  texto('Genética da Gravidez Explicada', 48, rodapeY + 9, 620, 16, cores.verde, 500);
  texto('andreruperto.dev', 790, rodapeY + 9, 242, 18, cores.texto);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Não foi possível gerar o arquivo PNG.');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'genetica-da-gravidez-estimativa.png';
  link.click();
  // O navegador precisa ter iniciado a leitura antes de liberar o arquivo.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
