import type { Ref } from 'react';

const COLUNAS = 40;
const LINHAS = 25;
const PASSO = 12;
const RAIO = 4;

// React 19: `ref` chega como prop comum, sem forwardRef.
type Props = { casos: number; idadeTexto: string; ref?: Ref<SVGSVGElement> };

export function GradeMilBebes({ casos, idadeTexto, ref }: Props) {
  const total = COLUNAS * LINHAS;
  const rotulo = `${casos} em cada 1.000 bebês nascidos de mães de ${idadeTexto} têm síndrome de Down; ${total - casos} não têm`;
  return (
    <figure className="grade">
      <svg
        ref={ref}
        role="img"
        aria-label={rotulo}
        viewBox={`0 0 ${COLUNAS * PASSO} ${LINHAS * PASSO}`}
        width="100%"
      >
        {Array.from({ length: total }, (_, i) => {
          const caso = i >= total - casos; // casos no fim da grade, como no plano
          return (
            <circle
              key={i}
              className={caso ? 'caso' : undefined}
              cx={(i % COLUNAS) * PASSO + PASSO / 2}
              cy={Math.floor(i / COLUNAS) * PASSO + PASSO / 2}
              r={RAIO}
              fill={caso ? 'var(--laranja)' : 'var(--verde-100)'}
            />
          );
        })}
      </svg>
      <figcaption>
        <strong>{casos}</strong> com Down · <strong>{total - casos}</strong> sem · arredondado
      </figcaption>
    </figure>
  );
}
