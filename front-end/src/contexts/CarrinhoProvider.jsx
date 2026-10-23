import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import * as api from "../services/carrinhoService";
import { CarrinhoContext } from "./CarrinhoContext";

// Antes a sacola ficava no navegador com esta chave; o que sobrou lá é levado para a API uma vez
const CHAVE_ANTIGA = "magnolia:carrinho";

const VAZIO = {
  itens: [],
  cupom: null,
  resumo: { subtotal: 0, economiaPromocoes: 0, desconto: 0, frete: 0, freteGratis: false, faltaParaFreteGratis: 0, total: 0 }
};

async function levarSacolaAntigaParaApi() {
  let antiga;
  try {
    antiga = JSON.parse(localStorage.getItem(CHAVE_ANTIGA));
    localStorage.removeItem(CHAVE_ANTIGA);
  } catch {
    return;
  }
  for (const item of antiga?.itens ?? []) {
    // Um perfume que esgotou ou saiu do catálogo simplesmente fica de fora
    await api.adicionarItem(item.varianteId, item.quantidade).catch(() => null);
  }
}

// A sacola fica guardada na API: a do visitante é achada por um cookie e, ao fazer login,
// passa para a conta (e aparece em qualquer aparelho). Os totais (subtotal, cupom, frete) vêm calculados da API.
// Cada item: { varianteId, produtoId, slug, nome, marca, imagem, volumeMl, preco, precoPromocional, quantidade, estoque }
export default function CarrinhoProvider({ children }) {
  const { usuario, verificando } = useAuth();
  const [carrinho, setCarrinho] = useState(VAZIO);
  const [carregando, setCarregando] = useState(true);
  // Só a resposta do pedido mais recente vale (cliques rápidos no + podem voltar fora de ordem)
  const ultimoPedido = useRef(0);

  const aplicar = useCallback(async (chamada) => {
    const numero = ++ultimoPedido.current;
    const resposta = await chamada();
    if (numero === ultimoPedido.current) {
      setCarrinho(resposta);
    }
    return resposta;
  }, []);

  const recarregar = useCallback(
    () => aplicar(api.buscarCarrinho).catch(() => null).finally(() => setCarregando(false)),
    [aplicar]
  );

  // Busca de novo ao entrar ou sair da conta (a API junta a sacola de visitante com a da conta)
  const usuarioId = usuario?.id ?? null;
  useEffect(() => {
    if (verificando) return;
    levarSacolaAntigaParaApi().then(recarregar);
  }, [verificando, usuarioId, recarregar]);

  const adicionar = useCallback(
    (item, quantidade = 1) => aplicar(() => api.adicionarItem(item.varianteId, quantidade)),
    [aplicar]
  );

  // A tela muda na hora; se a API recusar, volta ao que está salvo nela
  const mudarNaHora = useCallback(
    (mudanca, chamada) => {
      setCarrinho((atual) => ({ ...atual, itens: mudanca(atual.itens) }));
      return aplicar(chamada).catch(recarregar);
    },
    [aplicar, recarregar]
  );

  const alterarQuantidade = useCallback(
    (varianteId, quantidade) =>
      mudarNaHora(
        (itens) => itens.map((item) => (item.varianteId === varianteId ? { ...item, quantidade } : item)),
        () => api.atualizarItem(varianteId, quantidade)
      ),
    [mudarNaHora]
  );

  const remover = useCallback(
    (varianteId) =>
      mudarNaHora(
        (itens) => itens.filter((item) => item.varianteId !== varianteId),
        () => api.removerItem(varianteId)
      ),
    [mudarNaHora]
  );

  // Se o cupom não valer, a API explica o motivo no erro
  const aplicarCupom = useCallback((codigo) => aplicar(() => api.aplicarCupom(codigo.trim())), [aplicar]);
  const removerCupom = useCallback(() => aplicar(api.removerCupom).catch(recarregar), [aplicar, recarregar]);

  const valor = useMemo(() => {
    const { itens, cupom, resumo } = carrinho;
    return {
      itens,
      cupom,
      resumo,
      carregando,
      quantidadeTotal: itens.reduce((soma, item) => soma + item.quantidade, 0),
      adicionar,
      alterarQuantidade,
      remover,
      aplicarCupom,
      removerCupom,
      recarregar
    };
  }, [carrinho, carregando, adicionar, alterarQuantidade, remover, aplicarCupom, removerCupom, recarregar]);

  return <CarrinhoContext value={valor}>{children}</CarrinhoContext>;
}
