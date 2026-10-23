import {requisicao} from "./api";

export function listarMarcas() {
  return requisicao("/marcas");
}