// Os filtros do catálogo ficam na URL (ex.: /catalogo?familia=Floral&marca=dior),
// então dá para compartilhar o link e os links da home já abrem o catálogo filtrado

export const ORDENACOES = [
  { valor: "novidades", rotulo: "Novidades" },
  { valor: "menor-preco", rotulo: "Menor preço" },
  { valor: "maior-preco", rotulo: "Maior preço" },
  { valor: "desconto", rotulo: "Maior desconto" },
  { valor: "nome-az", rotulo: "Nome: A–Z" },
  { valor: "nome-za", rotulo: "Nome: Z–A" }
];

const ORDENACAO_PADRAO = "novidades";

export function lerFiltros(params) {
  return {
    busca: params.get("q") ?? "",
    categoria: params.get("categoria") ?? "",
    marcas: params.getAll("marca"),
    familias: params.getAll("familia"),
    precoMinimo: params.get("precoMin") ?? "",
    precoMaximo: params.get("precoMax") ?? "",
    somentePromocao: params.get("promocao") === "1",
    ordenacao: params.get("ordenacao") ?? ORDENACAO_PADRAO
  };
}

// Filtros vazios não entram na URL
export function paraParams(filtros) {
  const params = new URLSearchParams();

  if (filtros.busca) params.set("q", filtros.busca);
  if (filtros.categoria) params.set("categoria", filtros.categoria);
  filtros.marcas.forEach((marca) => params.append("marca", marca));
  filtros.familias.forEach((familia) => params.append("familia", familia));
  if (filtros.precoMinimo) params.set("precoMin", filtros.precoMinimo);
  if (filtros.precoMaximo) params.set("precoMax", filtros.precoMaximo);
  if (filtros.somentePromocao) params.set("promocao", "1");
  if (filtros.ordenacao !== ORDENACAO_PADRAO) params.set("ordenacao", filtros.ordenacao);

  return params;
}

export function semFiltros(filtros) {
  return paraParams({ ...filtros, ordenacao: ORDENACAO_PADRAO }).size === 0;
}

// Filtros no formato que a API espera em GET /produtos (ver FiltroProdutos.java).
// A diferença para a URL do site: os preços vão em centavos e "promocao" vira true.
export function paraParamsApi(filtros) {
  const params = new URLSearchParams();
  const centavos = (reais) => String(Math.round(Number(reais) * 100));

  if (filtros.busca.trim()) params.set("q", filtros.busca.trim());
  if (filtros.categoria) params.set("categoria", filtros.categoria);
  filtros.marcas.forEach((marca) => params.append("marca", marca));
  filtros.familias.forEach((familia) => params.append("familia", familia));
  if (filtros.precoMinimo !== "" && !Number.isNaN(Number(filtros.precoMinimo))) params.set("precoMin", centavos(filtros.precoMinimo));
  if (filtros.precoMaximo !== "" && !Number.isNaN(Number(filtros.precoMaximo))) params.set("precoMax", centavos(filtros.precoMaximo));
  if (filtros.somentePromocao) params.set("promocao", "true");
  params.set("ordenacao", filtros.ordenacao);

  return params;
}
