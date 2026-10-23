import { requisicao } from "./api";

// O carrinho ainda não tem rotas na API: estas chamadas já seguem o formato esperado

export function buscarCarrinho() {
  return requisicao("/carrinho");
}

export function adicionarItem(dados) {
  return requisicao("/carrinho/itens", { method: "POST", corpo: dados });
}

export function atualizarItem(id, dados) {
  return requisicao(`/carrinho/itens/${encodeURIComponent(id)}`, { method: "PATCH", corpo: dados });
}

export function removerItem(id) {
  return requisicao(`/carrinho/itens/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function aplicarCupom(dados) {
  return requisicao("/carrinho/cupom", { method: "POST", corpo: dados });
}
