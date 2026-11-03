import type { CSSProperties, Ref } from 'react';

const COLUNAS = 40;
const LINHAS = 25;
const PASSO = 12;
const RAIO = 4;

// React 19: `ref` chega como prop comum, sem forwardRef.
type Props = { casos: number; idadeTexto: string; contexto?: string; compacta?: boolean; animada?: boolean; ref?: Ref<SVGSVGElement> };

export function GradeMilBebes({ casos, idadeTexto, contexto, compacta = false, animada = false, ref }: Props) {
  const total = COLUNAS * LINHAS;
  const referencia = contexto ?? `Idade da gestante na data prevista do parto: ${idadeTexto}`;
  const rotulo = `${casos} em cada 1.000 bebês têm síndrome de Down; ${total - casos} não têm síndrome de Down. Estimativa ao nascimento, arredondada, para gestação única. ${referencia}. Não representa casos observados.`;
  const circulo = (i: number) => (
    <circle key={i} className={i >= total - casos ? 'caso' : undefined}
      cx={(i % COLUNAS) * PASSO + PASSO / 2} cy={Math.floor(i / COLUNAS) * PASSO + PASSO / 2}
      r={RAIO} fill={i >= total - casos ? 'var(--laranja)' : 'var(--verde-100)'} />
  );
  return (
    <figure className="grade">
      <svg
        ref={ref}
        role="img"
        aria-label={rotulo}
        viewBox={`0 0 ${COLUNAS * PASSO} ${LINHAS * PASSO}`}
        width="100%"
      >
        {animada
          ? Array.from({ length: LINHAS }, (_, linha) => <g key={linha} className="grade-linha" style={{ '--linha': linha } as CSSProperties}>{Array.from({ length: COLUNAS }, (_, coluna) => circulo(linha * COLUNAS + coluna))}</g>)
          : Array.from({ length: total }, (_, i) => circulo(i))}
      </svg>
      <figcaption>
        <span className="grade-legenda"><span><i className="legenda-caso" aria-hidden="true" /><strong>{casos}</strong><span className="legenda-descricao">com síndrome de Down</span></span><span><i className="legenda-sem" aria-hidden="true" /><strong>{total - casos}</strong><span className="legenda-descricao">sem síndrome de Down</span></span></span>
        <span className="grade-contexto">{referencia}.</span>
        {!compacta && <span className="grade-explicacao">Cada ponto representa 1 bebê em 1.000 nascimentos hipotéticos, de gestações com um bebê. Os totais foram arredondados; não são casos observados nem uma previsão de quais bebês terão a condição.</span>}
        {compacta && <span className="grade-explicacao">Por 1.000 nascimentos hipotéticos · valores arredondados.</span>}
      </figcaption>
    </figure>
  );
}
