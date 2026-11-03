export function AvisoEstimativa({ sindrome = 'síndrome de Down' }: { sindrome?: string }) {
  return (
    <aside role="note" className="aviso">
      Esta é uma estimativa populacional baseada apenas na idade, para {sindrome} ao nascimento em gestação única.
      Não é diagnóstico, resultado de exame nem avaliação de todas as alterações cromossômicas.
      O rastreio, como o teste pré-natal não invasivo (NIPT) e a avaliação do primeiro trimestre, refina a estimativa; não confirma o diagnóstico.
      Exames diagnósticos, como biópsia de vilo corial e amniocentese, têm outra finalidade.
      Converse com seu obstetra ou um geneticista sobre o seu caso.
    </aside>
  );
}
