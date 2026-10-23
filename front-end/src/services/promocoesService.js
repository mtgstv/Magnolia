import {requisicao} from "./api";

export function listarPromocoes() {
  return requisicao("/promocoes");
}