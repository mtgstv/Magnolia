import {requisicao} from "./api";

// Sem filtros: todos os perfumes (do mais novo para o mais antigo).
// Com filtros (URLSearchParams no formato da API, ver utils/filtrosCatalogo.js): a API busca, filtra e ordena.
export function listarProdutos(filtros) {
  const busca = filtros?.toString();
  return requisicao(busca ? `/produtos?${busca}` : "/produtos");
}

export function buscarProduto(slug) {

    return requisicao(`/produtos/${encodeURIComponent(slug)}`);
}
