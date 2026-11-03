import { useEffect, useId, useRef, useState } from 'react';
import type { Tabela } from '../lib/tabela';
import { risco, casosEmMil, faixaDaTabela, IDADE_MIN, IDADE_MAX } from '../lib/risco';
import { umEmN, porcentagem, complemento } from '../lib/formatar';
import { idadePorDatas } from '../lib/idade';
import { lerConfiguracaoDoHash, hashDaIdade } from '../lib/hash';
import { baixarImagem } from '../lib/baixarImagem';
import { CONDICOES, maiuscula, type Condicao } from '../lib/condicoes';
import { AvisoEstimativa } from '../components/AvisoEstimativa';
import { AvisoDados } from '../components/AvisoDados';
import { GradeMilBebes } from './GradeMilBebes';
import { CurvaRisco } from './CurvaRisco';

type Props = { tabelas: Tabela[] };

function IconeCampo({ tipo }: { tipo: 'ovulo' | 'frio' | 'bebe' | 'gemeos' | 'calendario' | 'escudo' | 'baixar' | 'grade' | 'livro' }) {
  const caminhos = {
    ovulo: 'M18 14c0 4-2.7 7-6 7s-6-3-6-7S8.7 3 12 3s6 7 6 11ZM10 15c0 1.7 1 3 2.5 3',
    frio: 'M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4M20 14l-4 1 1 4M4 14l4 1-1 4M20 10l-4-1 1-4',
    bebe: 'M9 3c0 3 6 0 6 4M5 8a9 9 0 1 0 14 0M8 12h.01M16 12h.01M9 16c1.5 1.5 4.5 1.5 6 0',
    gemeos: 'M10 5a6 6 0 1 0 1 11M16 8a6 6 0 1 0 1 11M6 9h.01M10 9h.01M12 13h.01M16 13h.01M6 12c1 1 2 1 3 0M12 16c1 1 2 1 3 0',
    calendario: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM8 14h2M14 14h2M8 18h2',
    escudo: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3ZM8 12l3 3 5-6',
    baixar: 'M12 3v12M7 10l5 5 5-5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3',
    grade: 'M4 4h5v5H4ZM15 4h5v5h-5ZM4 15h5v5H4ZM15 15h5v5h-5Z',
    livro: 'M12 5v15M12 5C8 2 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-2-1-6-2-10 1Z',
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={caminhos[tipo]} /></svg>;
}

export function Calculadora({ tabelas }: Props) {
  const id = useId();
  const [condicao, setCondicao] = useState<Condicao>(tabelas[0].condicao);
  const [idadeTexto, setIdadeTexto] = useState('');
  const [pelasDatas, setPelasDatas] = useState(false);
  const [nascimento, setNascimento] = useState('');
  const [dataParto, setDataParto] = useState('');
  const [ovulo, setOvulo] = useState<'proprio' | 'doado'>('proprio');
  const [bebes, setBebes] = useState(1);
  const grade = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const aplicarHash = () => {
      const doHash = lerConfiguracaoDoHash(location.hash);
      if (doHash) {
        setIdadeTexto(String(doHash.idade));
        setOvulo(doHash.ovulo);
        setBebes(doHash.bebes);
        setPelasDatas(false);
        if (tabelas.some((t) => t.condicao === doHash.condicao)) setCondicao(doHash.condicao);
      }
    };
    aplicarHash();
    window.addEventListener('hashchange', aplicarHash);
    return () => window.removeEventListener('hashchange', aplicarHash);
  }, [tabelas]);

  const tabela = tabelas.find((t) => t.condicao === condicao) ?? tabelas[0];
  const textos = CONDICOES[tabela.condicao];
  const usaDatas = pelasDatas && ovulo === 'proprio';
  const idade = usaDatas ? idadePorDatas(nascimento, dataParto) : idadeTexto === '' ? Number.NaN : Number(idadeTexto);
  const r = bebes > 1 ? { tipo: 'gemeos' as const }
    : !usaDatas && !Number.isInteger(idade) ? { tipo: 'invalido' as const }
    : risco(tabela, { idade, bebes });
  const [idadeMinTabela, idadeMaxTabela] = faixaDaTabela(tabela);

  useEffect(() => {
    const h = usaDatas ? '' : hashDaIdade(idade, ovulo, bebes, tabela.condicao);
    history.replaceState(null, '', location.pathname + h);
  }, [idade, usaDatas, ovulo, bebes, tabela.condicao]);

  const rotuloIdade = ovulo === 'doado' ? 'Idade na data da coleta do óvulo' : 'Idade da mãe na data prevista do parto';
  const ref25 = tabela.valores['25'] as number | undefined;
  const idadeExibida = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(idade);
  const referenciaIdade = ovulo === 'doado' ? 'Idade de quem forneceu o óvulo na coleta' : 'Idade da gestante na data prevista do parto';
  const contexto = `${referenciaIdade}: ${idadeExibida} anos${usaDatas ? ' (aproximadamente, calculada pelas datas)' : ''}`;
  const trocarOrigem = (origem: 'proprio' | 'doado') => {
    if (origem === ovulo) return;
    setOvulo(origem);
    setIdadeTexto('');
    setPelasDatas(false);
  };
  const ajustarIdade = (passo: number) => {
    if (idadeTexto === '' || !Number.isFinite(Number(idadeTexto))) return;
    setIdadeTexto(String(Math.min(IDADE_MAX, Math.max(IDADE_MIN, Math.round(Number(idadeTexto)) + passo))));
  };

  return (
    <section className="calculadora">
      <form className="formulario-estimativa" onSubmit={(e) => e.preventDefault()} aria-label="Dados da estimativa">
        <div className="formulario-intro">
          <div><p className="sobretitulo">SUA GESTAÇÃO EM PERSPECTIVA</p><h2>Vamos começar por você.</h2><p>Alguns detalhes para entender os números.</p></div>
          <span className="formulario-privacidade"><IconeCampo tipo="escudo" /><span>Seus dados ficam<br />só neste navegador</span></span>
        </div>
        <fieldset className="etapa-campo">
          <legend><span className="etapa-numero" aria-hidden="true">01</span> Origem do óvulo e uso de FIV</legend>
          <div className="opcoes-cartoes">
            <label className="opcao-cartao">
              <input type="radio" name={`${id}-ovulo`} checked={ovulo === 'proprio'} onChange={() => trocarOrigem('proprio')} />
              <span className="opcao-icone"><IconeCampo tipo="ovulo" /></span>
              <span className="opcao-texto"><strong>Próprio, sem FIV</strong><small>Idade da gestante no parto</small></span>
            </label>
            <label className="opcao-cartao">
              <input type="radio" name={`${id}-ovulo`} checked={ovulo === 'doado'} onChange={() => trocarOrigem('doado')} />
              <span className="opcao-icone"><IconeCampo tipo="frio" /></span>
              <span className="opcao-texto"><strong>FIV: próprio ou doado</strong><small>Fresco ou congelado: idade na coleta</small></span>
            </label>
          </div>
        </fieldset>

        <fieldset className="etapa-campo etapa-idade">
          <legend><span className="etapa-numero" aria-hidden="true">02</span> {usaDatas ? 'Datas da gestação' : 'Idade de referência'}</legend>
          <p className="contexto-idade" id={`${id}-referencia`}>
            {ovulo === 'doado' ? <><strong>De quem é a idade?</strong> Da pessoa que forneceu o óvulo, no dia da coleta. Se o óvulo é seu, use sua idade naquela data; se é doado, use a idade da doadora. Exemplo: gestante com 45 anos e doadora com 25 na coleta → informe 25. A idade atual da gestante não entra nesta estimativa.</>
              : <>Informe quantos anos a gestante terá na data prevista do parto, que pode ser diferente da idade de hoje. Se houve FIV, selecione a outra opção, inclusive para óvulo próprio.</>}
          </p>
          {usaDatas ? (
            <div className="campos-datas">
              <label htmlFor={`${id}-nascimento`}><span><IconeCampo tipo="calendario" /> Data de nascimento da mãe</span><input id={`${id}-nascimento`} type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} /></label>
              <label htmlFor={`${id}-parto`}><span><IconeCampo tipo="calendario" /> Data prevista do parto</span><input id={`${id}-parto`} type="date" value={dataParto} onChange={(e) => setDataParto(e.target.value)} /></label>
            </div>
          ) : (
            <div className="campo-idade">
              <div className="campo-idade-texto"><label htmlFor={`${id}-idade`}>{rotuloIdade}</label><p id={`${id}-idade-ajuda`}>Digite anos completos. A tabela cobre {idadeMinTabela} a {idadeMaxTabela} anos.</p></div>
              <div className="idade-controle">
                <button className="idade-passo" type="button" aria-label="Diminuir idade em um ano" disabled={idadeTexto === '' || Number(idadeTexto) <= IDADE_MIN} onClick={() => ajustarIdade(-1)}><span aria-hidden="true">−</span></button>
                <div className="idade-valor"><input id={`${id}-idade`} type="number" inputMode="numeric" min={IDADE_MIN} max={IDADE_MAX} step={1} placeholder="—" aria-describedby={`${id}-referencia ${id}-idade-ajuda`} aria-invalid={idadeTexto !== '' && r.tipo === 'invalido' ? true : undefined} value={idadeTexto} onChange={(e) => setIdadeTexto(e.target.value)} /><span aria-hidden="true">anos</span></div>
                <button className="idade-passo" type="button" aria-label="Aumentar idade em um ano" disabled={idadeTexto === '' || Number(idadeTexto) >= IDADE_MAX} onClick={() => ajustarIdade(1)}><span aria-hidden="true">+</span></button>
              </div>
            </div>
          )}
          {ovulo === 'proprio' && (
            <label className="alternar-datas">
              <input className="alternar-input" type="checkbox" checked={pelasDatas} onChange={(e) => setPelasDatas(e.target.checked)} />
              <span className="alternar-trilho" aria-hidden="true"><span /></span>
              <span><strong>Calcular pelas datas</strong><small>Use o nascimento e a previsão do parto</small></span>
              <span className="alternar-calendario"><IconeCampo tipo="calendario" /></span>
            </label>
          )}
        </fieldset>

        <fieldset className="etapa-campo">
          <legend><span className="etapa-numero" aria-hidden="true">03</span> Número de bebês</legend>
          <div className="opcoes-cartoes">
            <label className="opcao-cartao"><input type="radio" name={`${id}-bebes`} checked={bebes === 1} onChange={() => setBebes(1)} /><span className="opcao-icone"><IconeCampo tipo="bebe" /></span><span className="opcao-texto"><strong>Um</strong><small>Gestação única</small></span></label>
            <label className="opcao-cartao"><input type="radio" name={`${id}-bebes`} checked={bebes > 1} onChange={() => setBebes(2)} /><span className="opcao-icone"><IconeCampo tipo="gemeos" /></span><span className="opcao-texto"><strong>Dois ou mais</strong><small>Gestação múltipla</small></span></label>
          </div>
        </fieldset>
        <p className="formulario-rodape"><span className="ponto" aria-hidden="true" /> A estimativa se atualiza enquanto você preenche.</p>
      </form>

      {tabelas.length > 1 && (
        <fieldset className="seletor-condicao">
          <legend>Ver a estimativa para</legend>
          <div>
            {tabelas.map((t) => (
              <label key={t.condicao}><input type="radio" name={`${id}-condicao`} checked={t.condicao === tabela.condicao} onChange={() => setCondicao(t.condicao)} /><span>{maiuscula(CONDICOES[t.condicao].sindrome)}</span></label>
            ))}
          </div>
        </fieldset>
      )}

      <section aria-label="Resultado" aria-live="polite">
        {r.tipo === 'invalido' && <p className="resultado-pendente">{usaDatas ? (nascimento && dataParto ? 'Confira as datas: o parto deve ser posterior ao nascimento da mãe, com idade entre 18 e 50 anos.' : 'Preencha as duas datas para visualizar a estimativa.') : idadeTexto === '' ? `Para visualizar a estimativa, informe: ${rotuloIdade.toLowerCase()}.` : 'Digite uma idade inteira entre 18 e 50 anos. Só mostramos estimativas dentro da faixa da tabela.'}</p>}
        {r.tipo === 'gemeos' && (
          <p className="aviso">As tabelas usadas valem para gestação única. Gestações de gêmeos têm valores próprios, que ainda não estão nesta calculadora.</p>
        )}
        {r.tipo === 'fora-da-tabela' && (
          <p className="aviso">A tabela de referência cobre idades entre {r.min} e {r.max} anos. Para outras idades, não mostramos um número para não extrapolar.</p>
        )}
        {r.tipo === 'ok' && (
          <article className="painel-resultado">
            <header className="resultado-cabecalho">
              <div className="resultado-titulo"><span className="resultado-icone"><IconeCampo tipo="grade" /></span><div><p className="sobretitulo">ESTIMATIVA AO NASCIMENTO · UM BEBÊ</p><h2>{maiuscula(textos.sindrome)} <span>({textos.trissomia})</span></h2></div></div>
              <button className="baixar-resultado" type="button" onClick={() => grade.current && baixarImagem(
                grade.current, { contexto, conferido: tabela.conferido, n: r.n, fonte: r.fonte,
                  fonteUrl: tabela.fonteUrl, interpolado: r.interpolado, textos })}><IconeCampo tipo="baixar" /> Baixar imagem <span aria-hidden="true">PNG</span></button>
            </header>
            <div className="resultado-referencia"><IconeCampo tipo="calendario" /><p><strong>{contexto}.</strong></p></div>
            <div className="resultado-corpo">
              <div className="resultado-metricas">
                <div className="metrica-principal"><p className="metrica-rotulo"><span className="metrica-ponto" aria-hidden="true" /> Chance estimada de {textos.trissomia}</p><p className="metrica-numero">{umEmN(r.n)}</p><p className="metrica-percentual"><strong>{porcentagem(r.pct)}</strong><span>dos nascimentos, segundo a tabela</span></p><p className="metrica-explicacao">Em média, cerca de 1 nascimento com {textos.trissomia} a cada {Math.round(r.n).toLocaleString('pt-BR')} nascimentos com essa idade de referência.</p></div>
                <div className="metrica-complemento"><p>Chance de não ter {textos.trissomia}</p><strong>{complemento(r.complementoPct)}</strong><p>“Sem {textos.trissomia}” não significa ausência de outras condições de saúde.</p></div>
                {ref25 !== undefined && <p className="metrica-comparacao">Para comparar, aos 25 anos de referência: {umEmN(ref25)}</p>}
              </div>
              <div className="resultado-visual"><div className="visual-cabecalho"><h3>Em 1.000 nascimentos</h3><span className="visual-escala"><i aria-hidden="true" /> 1 ponto = 1 bebê</span></div><GradeMilBebes ref={grade} casos={casosEmMil(r.n)} idadeTexto={`${idadeExibida} anos`} contexto={contexto} textos={textos} /></div>
            </div>
            <div className="resultado-leitura"><span className="leitura-icone"><IconeCampo tipo="livro" /></span><div><h3>Como ler essa estimativa</h3><p>Estimativa populacional para {textos.sindrome} ({textos.trissomia}), baseada apenas na idade. Não é resultado de exame nem probabilidade de engravidar. Isso não prevê o resultado de uma gestação específica.</p>{ovulo === 'doado' && <p>Na FIV, usamos a idade na coleta como referência para a tabela. A estimativa não incorpora resultados de exames do embrião ou da gestação.</p>}</div></div>
            <footer className="resultado-fontes"><p><span>FONTE INFORMADA NA TABELA</span><a href={tabela.fonteUrl} rel="noopener">{r.fonte}<span aria-hidden="true"> ↗</span></a>{r.interpolado && <small>Valor interpolado entre idades vizinhas.</small>}</p><span className={`resultado-status${tabela.conferido ? ' resultado-conferido' : ''}`}><i aria-hidden="true" />{tabela.conferido ? 'Valores conferidos' : 'Conferência na publicação original pendente'}</span></footer>
          </article>
        )}
      </section>

      {bebes === 1 && <CurvaRisco tabela={tabela} idade={r.tipo === 'ok' ? idade : undefined} referenciaIdade={referenciaIdade} />}
      <AvisoEstimativa sindrome={textos.sindrome} />
      <p>
        <strong>E a idade do pai?</strong> O efeito da idade paterna sobre trissomias é pequeno. O
        efeito maior é sobre mutações novas em um único gene, que esta calculadora não estima.
      </p>
      <AvisoDados conferido={tabela.conferido} />
    </section>
  );
}
