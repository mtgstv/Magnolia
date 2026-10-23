import {requisicao} from "./api";

export function listarCategorias() {
  return requisicao("/categorias");
}