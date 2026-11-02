import { useEffect, useId, useRef, useState } from 'react';
import type { Tabela } from '../lib/tabela';
import { risco, casosEmMil, IDADE_MIN, IDADE_MAX } from '../lib/risco';
import { umEmN, porcentagem, complemento } from '../lib/formatar';
import { idadePorDatas } from '../lib/idade';
import { lerIdadeDoHash, hashDaIdade } from '../lib/hash';
import { baixarImagem } from '../lib/baixarImagem';
import { AvisoEstimativa } from '../components/AvisoEstimativa';
import { GradeMilBebes } from './GradeMilBebes';
import { CurvaRisco } from './CurvaRisco';

type Props = { tabela: Tabela };

export function Calculadora({ tabela }: Props) {
  const id = useId();
  const [idadeTexto, setIdadeTexto] = useState('');
  const [pelasDatas, setPelasDatas] = useState(false);
  const [nascimento, setNascimento] = useState('');
  const [dataParto, setDataParto] = useState('');
  const [ovulo, setOvulo] = useState<'proprio' | 'doado'>('proprio');
  const [bebes, setBebes] = useState(1);
  const grade = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const doHash = lerIdadeDoHash(location.hash);
    if (doHash !== null) setIdadeTexto(String(doHash));
  }, []);

  const usaDatas = pelasDatas && ovulo === 'proprio';
  const idade = usaDatas ? idadePorDatas(nascimento, dataParto) : idadeTexto === '' ? Number.NaN : Number(idadeTexto);
  const r = risco(tabela, { idade, bebes });

  useEffect(() => {
    const h = usaDatas ? '' : hashDaIdade(idade);
    history.replaceState(null, '', location.pathname + h);
  }, [idade, usaDatas]);

  const rotuloIdade = ovulo === 'doado' ? 'Idade na data da coleta do óvulo' : 'Idade da mãe na data prevista do parto';
  const ref25 = tabela.valores['25'];

  return (
    <section className="calculadora">
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend>Origem do óvulo</legend>
          <label><input type="radio" name={`${id}-ovulo`} checked={ovulo === 'proprio'} onChange={() => setOvulo('proprio')} /> Próprio</label>
          <label><input type="radio" name={`${id}-ovulo`} checked={ovulo === 'doado'} onChange={() => setOvulo('doado')} /> Doado ou congelado (FIV)</label>
        </fieldset>

        {usaDatas ? (
          <>
            <label>Data de nascimento da mãe <input type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} /></label>
            <label>Data prevista do parto <input type="date" value={dataParto} onChange={(e) => setDataParto(e.target.value)} /></label>
          </>
        ) : (
          <label>
            {rotuloIdade}
            <input type="number" inputMode="numeric" min={IDADE_MIN} max={IDADE_MAX} step={1}
              value={idadeTexto} onChange={(e) => setIdadeTexto(e.target.value)} />
          </label>
        )}
        {ovulo === 'proprio' && (
          <label><input type="checkbox" checked={pelasDatas} onChange={(e) => setPelasDatas(e.target.checked)} /> Calcular pelas datas</label>
        )}

        <fieldset>
          <legend>Número de bebês</legend>
          <label><input type="radio" name={`${id}-bebes`} checked={bebes === 1} onChange={() => setBebes(1)} /> Um</label>
          <label><input type="radio" name={`${id}-bebes`} checked={bebes > 1} onChange={() => setBebes(2)} /> Dois ou mais</label>
        </fieldset>
      </form>

      <section aria-label="Resultado" aria-live="polite">
        {r.tipo === 'gemeos' && (
          <p className="aviso">As tabelas usadas valem para gestação única. Gestações de gêmeos têm valores próprios, que ainda não estão nesta calculadora.</p>
        )}
        {r.tipo === 'fora-da-tabela' && (
          <p className="aviso">A tabela de referência cobre idades entre {r.min} e {r.max} anos. Para outras idades, não mostramos um número para não extrapolar.</p>
        )}
        {r.tipo === 'ok' && (
          <>
            <GradeMilBebes ref={grade} casos={casosEmMil(r.n)} idadeTexto={`${Math.round(idade)} anos`} />
            <button type="button" onClick={() => grade.current && baixarImagem(
              grade.current, `${Math.round(idade)} anos`,
              `${casosEmMil(r.n)} em 1.000 com Down · ${1000 - casosEmMil(r.n)} sem`,
              `Fonte: ${r.fonte}`)}>Baixar imagem</button>
            <article className="cartao">
              <h2>Síndrome de Down (trissomia 21)</h2>
              <p className="destaque">{umEmN(r.n)}</p>
              <p>{porcentagem(r.pct)}</p>
              <p>Chance de não ter trissomia 21: {complemento(r.complementoPct)}</p>
              <p>Para comparar, aos 25 anos: {umEmN(ref25)}</p>
              <p className="fonte">Fonte: <a href={tabela.fonteUrl} rel="noopener">{r.fonte}</a>{r.interpolado && ' · valor interpolado entre idades vizinhas'}</p>
            </article>
          </>
        )}
      </section>

      <CurvaRisco tabela={tabela} idade={r.tipo === 'ok' ? idade : undefined} />
      <AvisoEstimativa />
      <p>
        <strong>E a idade do pai?</strong> O efeito da idade paterna sobre trissomias é pequeno. O
        efeito maior é sobre mutações novas em um único gene, que esta calculadora não estima.
      </p>
    </section>
  );
}
