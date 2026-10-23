import { requisicao, renovarSessao } from "./api";

// Os tokens de login chegam em cookies HttpOnly; aqui só recebemos os dados do usuário

export function cadastrarUsuario(dados) {
  return requisicao("/auth/cadastro", { method: "POST", corpo: dados });
}

export function loginUsuario(dados) {
  return requisicao("/auth/login", { method: "POST", corpo: dados });
}

export { renovarSessao };

export function fazerLogout() {
  return requisicao("/auth/logout", { method: "POST" });
}
