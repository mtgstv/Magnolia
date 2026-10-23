import { requisicao } from "./api";

export function criarPedido(dados){
    return requisicao("/pedido",{
        method:"POST",
        credentials:"include",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados),
    });
}

export function listarPedidos(){
    return requisicao("/pedido", {
        credentials: "include",

    });
}

export function buscarPedido(id){
    return requisicao(`/pedido/${encodeURIComponent(id)}`,{
        credentials: "include",
    });
}