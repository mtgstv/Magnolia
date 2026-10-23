import { requisicao } from "./api";

export function buscarCarrinho(){

    return requisicao("/carrinho", {
        credentials:"include",
    });
}

export function adicionarItem(){
    return requisicao("/carrinho/itens", {
        method: "POST",
        credentials:"include",
        headers:{
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(dados),


    });
}

export function atualizarItem(id, dados){
    return requisicao(`/carrinho/itens/${encodeURIComponent(id)}`, {

        method: "PATCH",
        credentials: "include",
        headers:{
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(dados),
    });
}

export function removeritem(){
    return requisicao(`/carrinho/itens/${encodeURIComponent(id)}`,{
        method:"DELETE",
        credentials:"include",
    });
}

export function aplicarCupom(dados){
    return requisicao("carrinho/cupom", {
        method:"POST",
        credentials:"include",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados), 
    });
}