import { requisicao } from "./api";

// Resposta: { media, total, distribuicao: { 5: n, ..., 1: n }, avaliacoes: [...] }

export function listarAvaliacoes(slug) {
  return requisicao(`/produtos/${encodeURIComponent(slug)}/avaliacoes`);
}

// Cria a avaliação do cliente ou edita a que ele já tinha
export function salvarAvaliacao(slug, dados) {
  return requisicao(`/produtos/${encodeURIComponent(slug)}/avaliacoes`, { method: "PUT", corpo: dados });
}

export function removerAvaliacao(slug) {
  return requisicao(`/produtos/${encodeURIComponent(slug)}/avaliacoes`, { method: "DELETE" });
}
