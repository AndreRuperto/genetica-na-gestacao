export function AvisoDados({ conferido }: { conferido: boolean }) {
  if (conferido) return null;
  return <div className="aviso-dados"><strong>Dados em conferência.</strong> Os valores desta demonstração ainda não foram conferidos na publicação original. Use os números apenas para explorar a ferramenta, sem tomar decisões de saúde a partir deles. <a href="/metodologia">Veja as fontes e limitações.</a></div>;
}
