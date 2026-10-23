import { requisicao } from "./api";

export function buscarPerfil(){
    return requisicao("/me", {
        credentials:"include",
    });
}

export function atualizarPerfil(dados){
    return requisicao("/me", {
        method:"PUT",
        credentials:"include",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
    });
}

export function listarEndereco(dados){
    return requisicao("/me/enderecos", {
        credentials:"include",
    })
}

export function cadastarEndereco(dados){
    return requisicao("/me/enderecos", {
        method: "POST",
        credentials: "include",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
    });

}