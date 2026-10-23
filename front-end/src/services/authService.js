import {requisicao} from "./api";

export function cadastrarUsuario(dados) {

    return requisicao("/auth/cadastro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });
}

export function loginUsuario(dados) {

    return requisicao("/auth/login",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials:"include",
        body: JSON.stringify(dados)
    });
}

export function renovarSessao(){
    return requisicao("/auth/refresh",{

        method: "POST",
        credentials:"include",

    });
}

export function fazerLogout(){

    return requisicao("/auth/logout",{
        method: "POST",
        credentials:"include"
    });
}