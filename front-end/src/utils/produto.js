import { percentualDesconto, precoAtual } from "./preco";

const CONCENTRACOES = {
  EDP: "Eau de Parfum",
  EDT: "Eau de Toilette",
  PARFUM: "Parfum"
};

export function nomeConcentracao(codigo) {
  return CONCENTRACOES[codigo] ?? codigo;
}

export function formatarVolumes(volumes) {
  return volumes.map((volume) => `${volume} ml`).join(" · ");
}

// A página do produto recebe o detalhe completo; a lista de favoritos usa o formato
// resumido dos cards (o mesmo de GET /produtos)
export function resumoDoDetalhe(produto) {
  const maisBarata = produto.variantes.reduce((menor, variante) =>
    precoAtual(variante) < precoAtual(menor) ? variante : menor
  );

  return {
    id: produto.id,
    slug: produto.slug,
    nome: produto.nome,
    marca: produto.marca,
    marcaSlug: produto.marcaSlug,
    categoria: produto.categoria,
    categoriaSlug: produto.categoriaSlug,
    concentracao: produto.concentracao,
    familiaOlfativa: produto.familiaOlfativa,
    imagem: produto.imagens[0]?.url ?? null,
    volumes: produto.variantes.map((variante) => variante.volumeMl),
    preco: maisBarata.preco,
    precoPromocional: maisBarata.precoPromocional,
    descontoMaximo: Math.max(...produto.variantes.map(percentualDesconto)),
    emEstoque: produto.variantes.some((variante) => variante.emEstoque)
  };
}
