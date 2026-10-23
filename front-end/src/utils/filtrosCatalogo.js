import { precoAtual } from "./preco";
import { normalizarTexto } from "./texto";

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

const COMPARADORES = {
  // A API já entrega do mais novo para o mais antigo
  novidades: () => 0,
  "menor-preco": (a, b) => precoAtual(a) - precoAtual(b),
  "maior-preco": (a, b) => precoAtual(b) - precoAtual(a),
  desconto: (a, b) => b.descontoMaximo - a.descontoMaximo,
  "nome-az": (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
  "nome-za": (a, b) => b.nome.localeCompare(a.nome, "pt-BR")
};

export function filtrarProdutos(produtos, filtros) {
  const termo = normalizarTexto(filtros.busca.trim());

  // Os campos de preço são em reais; os preços dos produtos, em centavos.
  // Se a pessoa inverter mínimo e máximo, a faixa é corrigida.
  let minimo = filtros.precoMinimo === "" ? null : Number(filtros.precoMinimo) * 100;
  let maximo = filtros.precoMaximo === "" ? null : Number(filtros.precoMaximo) * 100;
  if (minimo != null && maximo != null && minimo > maximo) {
    [minimo, maximo] = [maximo, minimo];
  }

  return produtos
    .filter((produto) => {
      const preco = precoAtual(produto);

      return (
        (termo === "" ||
          normalizarTexto(produto.nome).includes(termo) ||
          normalizarTexto(produto.marca).includes(termo) ||
          normalizarTexto(produto.familiaOlfativa ?? "").includes(termo)) &&
        (filtros.categoria === "" || produto.categoriaSlug === filtros.categoria) &&
        (filtros.marcas.length === 0 || filtros.marcas.includes(produto.marcaSlug)) &&
        (filtros.familias.length === 0 || filtros.familias.includes(produto.familiaOlfativa)) &&
        (minimo == null || preco >= minimo) &&
        (maximo == null || preco <= maximo) &&
        // Em oferta = algum volume com desconto (não só o mais barato)
        (!filtros.somentePromocao || produto.descontoMaximo > 0)
      );
    })
    .sort(COMPARADORES[filtros.ordenacao] ?? COMPARADORES.novidades);
}
