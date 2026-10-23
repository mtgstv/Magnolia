import { requisicao } from "./api";

// Rotas do usuário logado

export function listarFavoritos() {
  return requisicao("/me/favoritos");
}

export function adicionarFavorito(produtoId) {
  return requisicao(`/me/favoritos/${encodeURIComponent(produtoId)}`, { method: "PUT" });
}

export function removerFavorito(produtoId) {
  return requisicao(`/me/favoritos/${encodeURIComponent(produtoId)}`, { method: "DELETE" });
}

// Perfumes parecidos com os favoritos (ou novidades, para quem ainda não favoritou nada)
export function listarRecomendacoes() {
  return requisicao("/me/recomendacoes");
}
