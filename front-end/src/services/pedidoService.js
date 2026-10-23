import { requisicao } from "./api";

// Os pedidos ainda não têm rotas na API: estas chamadas já seguem o formato esperado

export function criarPedido(dados) {
  return requisicao("/pedidos", { method: "POST", corpo: dados });
}

export function listarPedidos() {
  return requisicao("/pedidos");
}

export function buscarPedido(id) {
  return requisicao(`/pedidos/${encodeURIComponent(id)}`);
}
