import { createContext } from "react";

// Valor: { itens, cupom, resumo, carregando, quantidadeTotal, adicionar, alterarQuantidade, remover,
// aplicarCupom, removerCupom, recarregar } (ver CarrinhoProvider)
export const CarrinhoContext = createContext(null);
