import {requisicao} from "./api";

export function listarcategorias() {
  return requisicao("/categorias");
}