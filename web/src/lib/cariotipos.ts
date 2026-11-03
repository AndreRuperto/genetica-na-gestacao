// Desenhos simplificados: só os cromossomos envolvidos, sem fotos de pessoas.
// Tamanho em Mb (aprox.) e fração do braço curto (p) definem a forma de cada cromossomo.
export const CROMOSSOMOS = {
  '5': { mb: 181, p: 0.27 },
  '13': { mb: 114, p: 0.15 },
  '18': { mb: 80, p: 0.23 },
  '21': { mb: 47, p: 0.25 },
  X: { mb: 156, p: 0.39 },
  Y: { mb: 57, p: 0.2 },
} as const;

export type Cromossomo = keyof typeof CROMOSSOMOS;
// extra: cópia a mais · ausente: cópia que falta · delecao: perdeu parte do braço curto
export type Copia = { c: Cromossomo; estado?: 'extra' | 'ausente' | 'delecao' };
// sigla: rótulo curto da miniatura nos cartões.
export type Cariotipo = { copias: Copia[]; legenda: string; sigla: string };

const trissomia = (c: Cromossomo): Cariotipo => ({
  copias: [{ c }, { c }, { c, estado: 'extra' }],
  legenda: `Três cópias do cromossomo ${c}, em vez de duas.`,
  sigla: `+${c}`,
});

export const CARIOTIPOS: Record<string, Cariotipo> = {
  down: trissomia('21'),
  edwards: trissomia('18'),
  patau: trissomia('13'),
  'miado-do-gato': {
    copias: [{ c: '5' }, { c: '5', estado: 'delecao' }],
    legenda: 'Um dos cromossomos 5 perdeu um pedaço do braço curto.',
    sigla: '5p−',
  },
  turner: {
    copias: [{ c: 'X' }, { c: 'X', estado: 'ausente' }],
    legenda: 'Um cromossomo X só, em vez de dois.',
    sigla: '45,X',
  },
  'triplo-x': {
    copias: [{ c: 'X' }, { c: 'X' }, { c: 'X', estado: 'extra' }],
    legenda: 'Três cromossomos X, em vez de dois.',
    sigla: 'XXX',
  },
  klinefelter: {
    copias: [{ c: 'X' }, { c: 'Y' }, { c: 'X', estado: 'extra' }],
    legenda: 'Um cromossomo X a mais, além do par XY.',
    sigla: 'XXY',
  },
  'duplo-y': {
    copias: [{ c: 'X' }, { c: 'Y' }, { c: 'Y', estado: 'extra' }],
    legenda: 'Um cromossomo Y a mais, além do par XY.',
    sigla: 'XYY',
  },
};
