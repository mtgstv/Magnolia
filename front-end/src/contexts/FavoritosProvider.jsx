import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito
} from "../services/favoritosService";
import { FavoritosContext } from "./FavoritosContext";

const SEM_FAVORITOS = [];

// Guarda os favoritos do usuário logado para que qualquer coração do site
// (cards, página do produto, header) mostre o mesmo estado
export default function FavoritosProvider({ children }) {
  const { usuario } = useAuth();
  const [lista, setLista] = useState({ usuarioId: null, favoritos: SEM_FAVORITOS });
  // Aumenta a cada mudança confirmada pela API (quem depende dos favoritos busca de novo)
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!usuario) {
      return;
    }

    let ativo = true;
    listarFavoritos()
      .catch(() => SEM_FAVORITOS)
      .then((favoritos) => {
        if (ativo) {
          setLista({ usuarioId: usuario.id, favoritos });
        }
      });

    return () => {
      ativo = false;
    };
  }, [usuario]);

  // Ao sair (ou trocar de conta), a lista antiga deixa de valer na hora
  const listaEhDoUsuario = usuario != null && lista.usuarioId === usuario.id;
  const favoritos = listaEhDoUsuario ? lista.favoritos : SEM_FAVORITOS;
  const carregando = usuario != null && !listaEhDoUsuario;

  const ids = useMemo(() => new Set(favoritos.map((produto) => produto.id)), [favoritos]);
  const ehFavorito = useCallback((produtoId) => ids.has(produtoId), [ids]);

  // Atualiza a tela na hora e desfaz se a API recusar.
  // "produto" precisa estar no formato resumido dos cards (ver utils/produto.js).
  const alternarFavorito = useCallback(
    async (produto) => {
      const remover = ids.has(produto.id);
      const semEle = (lista) => lista.filter((item) => item.id !== produto.id);
      const comEle = (lista) => [produto, ...semEle(lista)];

      setLista((atual) => ({
        ...atual,
        favoritos: remover ? semEle(atual.favoritos) : comEle(atual.favoritos)
      }));

      try {
        if (remover) {
          await removerFavorito(produto.id);
        } else {
          await adicionarFavorito(produto.id);
        }
        setVersao((atual) => atual + 1);
      } catch (erro) {
        setLista((atual) => ({
          ...atual,
          favoritos: remover ? comEle(atual.favoritos) : semEle(atual.favoritos)
        }));
        throw erro;
      }
    },
    [ids]
  );

  const valor = useMemo(
    () => ({ favoritos, carregando, versao, ehFavorito, alternarFavorito }),
    [favoritos, carregando, versao, ehFavorito, alternarFavorito]
  );

  return <FavoritosContext value={valor}>{children}</FavoritosContext>;
}
