import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";

import SeloStatus from "../components/pedido/SeloStatus";
import ImagemProduto from "../components/produto/ImagemProduto";
import Botao from "../components/ui/Botao";
import EstadoVazio from "../components/ui/EstadoVazio";
import MensagemErro from "../components/ui/MensagemErro";
import Trilha from "../components/ui/Trilha";
import { useCarregar } from "../hooks/useCarregar";
import { listarPedidos } from "../services/pedidoService";
import { formatarData } from "../utils/pedido";
import { formatarPreco } from "../utils/preco";

// Histórico de compras do cliente logado (ver RotaPrivada)
export default function Pedidos() {
  const pedidos = useCarregar(listarPedidos);
  const lista = pedidos.dados ?? [];

  return (
    <main className="conteudo pt-8">
      <Trilha itens={[{ rotulo: "Início", para: "/" }, { rotulo: "Meus pedidos" }]} />

      <header className="mt-10">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-marca-media">Suas compras</p>
        <h1 className="mt-2 font-bodoni text-4xl text-stone-900 md:text-5xl">Meus pedidos</h1>
      </header>

      <div className="mt-10">
        {pedidos.erro ? (
          <MensagemErro erro={pedidos.erro} aoTentarDeNovo={pedidos.recarregar} />
        ) : pedidos.carregando ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            {[1, 2].map((n) => <div key={n} className="h-32 animate-pulse rounded-3xl bg-areia" />)}
          </div>
        ) : lista.length === 0 ? (
          <EstadoVazio icone={Package} titulo="Você ainda não fez nenhum pedido" texto="Quando você comprar, seus pedidos aparecem aqui.">
            <Botao to="/catalogo">Explorar perfumes</Botao>
          </EstadoVazio>
        ) : (
          <ul className="flex flex-col gap-4">
            {lista.map((pedido) => (
              <li key={pedido.numero}>
                <Link
                  to={`/pedidos/${pedido.numero}`}
                  className="group flex flex-wrap items-center gap-5 rounded-3xl bg-white p-5 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 transition hover:ring-marca/30 sm:p-6"
                >
                  <div className="flex -space-x-3">
                    {pedido.itens.slice(0, 3).map((item) => (
                      <ImagemProduto
                        key={`${item.slug}-${item.volumeMl}`}
                        src={item.imagem}
                        alt=""
                        className="size-16 rounded-2xl bg-areia object-cover ring-4 ring-white"
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900">{pedido.numero}</p>
                    <p className="text-sm text-stone-500">
                      {formatarData(pedido.criadoEm)} ·{" "}
                      {pedido.itens.reduce((soma, item) => soma + item.quantidade, 0)} item(ns)
                    </p>
                  </div>
                  <SeloStatus status={pedido.status} />
                  <p className="font-bodoni text-2xl text-stone-900">{formatarPreco(pedido.total)}</p>
                  <ChevronRight className="size-5 text-stone-400 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
