import { requisicao } from "./api";

export function buscarPerfil() {
  return requisicao("/me");
}

// As funções abaixo ainda não têm rota na API

export function atualizarPerfil(dados) {
  return requisicao("/me", { method: "PUT", corpo: dados });
}

export function listarEnderecos() {
  return requisicao("/me/enderecos");
}

export function cadastrarEndereco(dados) {
  return requisicao("/me/enderecos", { method: "POST", corpo: dados });
}
