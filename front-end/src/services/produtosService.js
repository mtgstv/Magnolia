import {requisicao} from "./api";

export function listarProdutos() {
  return requisicao("/produtos");
}

export function buscarProduto(slug) {

    return requisicao(`/produtos/${encodeURIComponent(slug)}`);
}