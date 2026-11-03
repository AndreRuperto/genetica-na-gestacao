import { scaleLinear, scaleLog } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import type { Tabela } from '../lib/tabela';
import { risco } from '../lib/risco';
import { umEmN, porcentagem } from '../lib/formatar';
import { CONDICOES } from '../lib/condicoes';

const L = 640, A = 320, M = { t: 24, r: 24, b: 40, l: 56 };
const ANOTADAS = [25, 35, 40, 45];
const MARCAS_Y = [0.01, 0.03, 0.1, 0.3, 1, 3, 10];

type Props = { tabela: Tabela; idade?: number; referenciaIdade?: string };

export function CurvaRisco({ tabela, idade, referenciaIdade = 'Idade da gestante na data prevista do parto' }: Props) {
  const pontos = Object.entries(tabela.valores).map(([i, n]) => ({ idade: Number(i), n, pct: 100 / n }));
  const textos = CONDICOES[tabela.condicao];
  const idades = pontos.map((p) => p.idade);
  const pcts = pontos.map((p) => p.pct);
  // Eixos seguem a tabela: T18 e T13 são bem mais raras que T21.
  const x = scaleLinear().domain([Math.min(...idades), Math.max(...idades)]).range([M.l, L - M.r]);
  const y = scaleLog().domain([Math.min(...pcts) / 1.6, Math.max(...pcts) * 1.6]).range([A - M.b, M.t]);
  const [yMin, yMax] = y.domain();
  const d = line<(typeof pontos)[number]>().x((p) => x(p.idade)).y((p) => y(p.pct)).curve(curveMonotoneX)(pontos)!;
  const marcador = idade !== undefined ? risco(tabela, { idade }) : null;

  return (
    <figure className="curva-risco">
      <figcaption><strong>Como a estimativa varia com a idade</strong><span>{referenciaIdade}. Chance de {textos.sindrome} ao nascimento, em gestação única. O eixo vertical usa escala logarítmica: distâncias iguais representam multiplicações da chance, não aumentos iguais em pontos percentuais.</span></figcaption>
      <svg viewBox={`0 0 ${L} ${A}`} width="100%" role="img"
        aria-label={`Curva do risco de ${textos.sindrome} ao nascimento em escala logarítmica. Referência: ${referenciaIdade.toLowerCase()}.`}>
        {MARCAS_Y.filter((v) => v >= yMin && v <= yMax).map((v) => (
          <g key={v}>
            <line x1={M.l} x2={L - M.r} y1={y(v)} y2={y(v)} stroke="var(--verde-100)" />
            <text x={M.l - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="11">
              {porcentagem(v).replace(',00', '')}
            </text>
          </g>
        ))}
        {[21, 25, 30, 35, 40, 45].filter((v) => v >= x.domain()[0] && v <= x.domain()[1]).map((v) => (
          <text key={v} x={x(v)} y={A - M.b + 18} textAnchor="middle" fontSize="11">{v}</text>
        ))}
        <text className="curva-eixo" x={(L + M.l) / 2} y={A - 4} textAnchor="middle" fontSize="12">Idade de referência (anos)</text>
        <path d={d} fill="none" stroke="var(--verde-700)" strokeWidth={2.5} />
        {pontos.filter((p) => ANOTADAS.includes(p.idade)).map((p) => (
          <g key={p.idade}>
            <circle cx={x(p.idade)} cy={y(p.pct)} r={4} fill="var(--laranja)" />
            <text x={x(p.idade)} y={y(p.pct) - 10} textAnchor="middle" fontSize="11">{umEmN(p.n)}</text>
          </g>
        ))}
        {marcador?.tipo === 'ok' && (
          <g data-marcador={idade}>
            <line x1={x(idade!)} x2={x(idade!)} y1={M.t} y2={A - M.b} stroke="var(--laranja)" strokeDasharray="4 4" />
            <circle cx={x(idade!)} cy={y(marcador.pct)} r={7} fill="var(--laranja)" stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>
      <details>
        <summary>Ver como tabela</summary>
        <table>
          <caption>{referenciaIdade} · estimativa ao nascimento</caption>
          <thead><tr><th scope="col">Idade de referência</th><th scope="col">Chance de {textos.trissomia}</th><th scope="col">%</th></tr></thead>
          <tbody>
            {pontos.map((p) => (
              <tr key={p.idade}><td>{p.idade}</td><td>{umEmN(p.n)}</td><td>{porcentagem(p.pct)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
