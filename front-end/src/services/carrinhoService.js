import { requisicao } from "./api";

// A sacola fica na API (com ou sem login). Toda rota devolve a sacola inteira:
// { itens, cupom: { codigo, descricao } | null, resumo: { subtotal, desconto, frete, total, ... } }

export function buscarCarrinho() {
  return requisicao("/carrinho");
}

export function adicionarItem(varianteId, quantidade) {
  return requisicao("/carrinho/itens", { method: "POST", corpo: { varianteId, quantidade } });
}

export function atualizarItem(varianteId, quantidade) {
  return requisicao(`/carrinho/itens/${encodeURIComponent(varianteId)}`, { method: "PATCH", corpo: { quantidade } });
}

export function removerItem(varianteId) {
  return requisicao(`/carrinho/itens/${encodeURIComponent(varianteId)}`, { method: "DELETE" });
}

export function aplicarCupom(codigo) {
  return requisicao("/carrinho/cupom", { method: "POST", corpo: { codigo } });
}

export function removerCupom() {
  return requisicao("/carrinho/cupom", { method: "DELETE" });
}

// Opções de entrega para o CEP: [{ tipo, nome, prazo, valor, gratis }]
export function calcularFrete(cep) {
  return requisicao(`/carrinho/frete?cep=${encodeURIComponent(cep)}`);
}
