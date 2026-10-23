import { useContext } from "react";

import { CarrinhoContext } from "../contexts/CarrinhoContext";

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext);

  if (!contexto) {
    throw new Error("useCarrinho precisa ser usado dentro do <CarrinhoProvider>.");
  }

  return contexto;
}
