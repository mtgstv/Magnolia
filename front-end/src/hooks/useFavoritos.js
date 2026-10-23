import { useContext } from "react";

import { FavoritosContext } from "../contexts/FavoritosContext";

export function useFavoritos() {
  const contexto = useContext(FavoritosContext);

  if (!contexto) {
    throw new Error("useFavoritos precisa ser usado dentro do <FavoritosProvider>.");
  }

  return contexto;
}
