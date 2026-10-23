import { requisicao } from "./api";

// Rotas do painel admin (só para contas com papel ADMIN). Preços em centavos.

export function listarProdutosAdmin() {
  return requisicao("/admin/produtos");
}

export function buscarProdutoAdmin(id) {
  return requisicao(`/admin/produtos/${encodeURIComponent(id)}`);
}

export function salvarProdutoAdmin(id, dados) {
  return id
    ? requisicao(`/admin/produtos/${encodeURIComponent(id)}`, { method: "PUT", corpo: dados })
    : requisicao("/admin/produtos", { method: "POST", corpo: dados });
}

export function alterarAtivoAdmin(id, ativo) {
  return requisicao(`/admin/produtos/${encodeURIComponent(id)}/ativo`, { method: "PATCH", corpo: { ativo } });
}

export function criarMarcaAdmin(nome) {
  return requisicao("/admin/marcas", { method: "POST", corpo: { nome } });
}

export function listarPromocoesAdmin() {
  return requisicao("/admin/promocoes");
}

export function salvarPromocaoAdmin(id, dados) {
  return id
    ? requisicao(`/admin/promocoes/${encodeURIComponent(id)}`, { method: "PUT", corpo: dados })
    : requisicao("/admin/promocoes", { method: "POST", corpo: dados });
}

export function removerPromocaoAdmin(id) {
  return requisicao(`/admin/promocoes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function removerAvaliacaoAdmin(id) {
  return requisicao(`/admin/avaliacoes/${encodeURIComponent(id)}`, { method: "DELETE" });
}
