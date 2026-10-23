import { useCallback, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Check, Copy, PartyPopper, QrCode } from "lucide-react";

import SeloStatus from "../components/pedido/SeloStatus";
import ImagemProduto from "../components/produto/ImagemProduto";
import Botao from "../components/ui/Botao";
import MensagemErro from "../components/ui/MensagemErro";
import Trilha from "../components/ui/Trilha";
import { useCarregar } from "../hooks/useCarregar";
import { buscarPedido, simularPagamentoPix } from "../services/pedidoService";
import { formatarCep, formatarData } from "../utils/pedido";
import { formatarPreco } from "../utils/preco";
import NaoEncontrado from "./NaoEncontrado";

const classeCartao = "rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 sm:p-8";

// Detalhe de um pedido do cliente. Logo depois do checkout, abre com a mensagem de confirmação.
export default function Pedido() {
  const { numero } = useParams();
  const location = useLocation();
  const buscar = useCallback(() => buscarPedido(numero), [numero]);
  const carregado = useCarregar(buscar);
  // Depois de simular o Pix, mostra a versão atualizada sem buscar de novo
  const [atualizado, setAtualizado] = useState(null);

  if (carregado.erro?.status === 404) {
    return <NaoEncontrado titulo="Pedido não encontrado" mensagem="Confira o número do pedido em Meus pedidos." />;
  }
  if (carregado.erro) {
    return (
      <main className="conteudo py-16">
        <MensagemErro erro={carregado.erro} aoTentarDeNovo={carregado.recarregar} />
      </main>
    );
  }
  if (carregado.carregando) {
    return <main className="conteudo min-h-[60vh] animate-pulse pt-8" aria-busy="true" />;
  }

  const pedido = atualizado?.numero === numero ? atualizado : carregado.dados;
  const { endereco, pagamento } = pedido;
  const novo = Boolean(location.state?.novo);

  return (
    <main className="conteudo pt-8">
      <Trilha itens={[{ rotulo: "Início", para: "/" }, { rotulo: "Meus pedidos", para: "/pedidos" }, { rotulo: pedido.numero }]} />

      {novo && (
        <div className="mt-6 flex animate-surgir items-center gap-4 rounded-3xl bg-marca-clara p-6 text-marca-escura ring-1 ring-marca/15">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-marca text-white">
            <PartyPopper className="size-6" strokeWidth={1.5} />
          </span>
          <div>
            <p className="font-bodoni text-2xl">Pedido recebido!</p>
            <p className="text-sm">
              {pedido.status === "AGUARDANDO_PAGAMENTO"
                ? "Agora é só pagar o Pix abaixo para confirmar."
                : "Pagamento aprovado. Vamos preparar seus perfumes com carinho."}
            </p>
          </div>
        </div>
      )}

      <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-marca-media">Pedido {pedido.numero}</p>
          <h1 className="mt-2 font-bodoni text-4xl text-stone-900 md:text-5xl">Detalhes do pedido</h1>
          <p className="mt-2 text-stone-500">Feito em {formatarData(pedido.criadoEm)}</p>
        </div>
        <SeloStatus status={pedido.status} />
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px] xl:gap-12">
        <div className="flex flex-col gap-6">
          {pagamento.pixCopiaECola && (
            <PagamentoPix pedido={pedido} aoPagar={setAtualizado} />
          )}

          <section className={classeCartao}>
            <h2 className="font-bodoni text-2xl text-stone-900">Perfumes</h2>
            <ul className="mt-4 divide-y divide-stone-100">
              {pedido.itens.map((item) => (
                <li key={`${item.slug}-${item.volumeMl}`} className="flex items-center gap-4 py-4">
                  <ImagemProduto src={item.imagem} alt="" className="h-20 w-16 shrink-0 rounded-xl bg-areia object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">{item.marca}</p>
                    <Link to={`/produto/${item.slug}`} className="font-bodoni text-lg text-stone-900 hover:text-marca">
                      {item.nome}
                    </Link>
                    <p className="text-sm text-stone-500">{item.volumeMl} ml · {item.quantidade}x {formatarPreco(item.preco)}</p>
                  </div>
                  <p className="font-semibold text-stone-900">{formatarPreco(item.preco * item.quantidade)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className={classeCartao}>
            <h2 className="font-bodoni text-2xl text-stone-900">Resumo</h2>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <Linha rotulo="Subtotal" valor={formatarPreco(pedido.subtotal)} />
              {pedido.desconto > 0 && <Linha rotulo={`Cupom ${pedido.cupom}`} valor={`-${formatarPreco(pedido.desconto)}`} />}
              <Linha rotulo="Entrega" valor={pedido.frete === 0 ? "Grátis" : formatarPreco(pedido.frete)} />
              <div className="mt-2 flex items-baseline justify-between border-t border-stone-100 pt-4">
                <dt className="font-semibold text-stone-900">Total</dt>
                <dd className="font-bodoni text-3xl text-stone-900">{formatarPreco(pedido.total)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-stone-600">
              {pagamento.metodo === "PIX"
                ? "Pago com Pix"
                : `Cartão final ${pagamento.cartaoFinal} · ${pagamento.parcelas}x de ${formatarPreco(Math.ceil(pedido.total / pagamento.parcelas))}`}
            </p>
          </section>

          <section className={classeCartao}>
            <h2 className="font-bodoni text-2xl text-stone-900">Entrega</h2>
            <p className="mt-1 text-sm text-marca">
              {pedido.entrega.tipo === "EXPRESSA" ? "Entrega expressa" : "Entrega padrão"} · {pedido.entrega.prazo}
            </p>
            <address className="mt-4 text-sm not-italic leading-relaxed text-stone-700">
              {endereco.destinatario}
              <br />
              {endereco.rua}, {endereco.numero}
              {endereco.complemento && ` · ${endereco.complemento}`}
              <br />
              {endereco.bairro} · {endereco.cidade}/{endereco.uf}
              <br />
              CEP {formatarCep(endereco.cep)}
            </address>
          </section>

          <Botao to="/catalogo" variante="secundario">Continuar comprando</Botao>
        </aside>
      </div>
    </main>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <div className="flex justify-between">
      <dt className="text-stone-600">{rotulo}</dt>
      <dd className="font-medium text-stone-900">{valor}</dd>
    </div>
  );
}

function PagamentoPix({ pedido, aoPagar }) {
  const [copiado, setCopiado] = useState(false);
  const [simulando, setSimulando] = useState(false);
  const [erro, setErro] = useState(null);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pedido.pagamento.pixCopiaECola);
      setCopiado(true);
    } catch {
      setErro("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  }

  async function simular() {
    setSimulando(true);
    setErro(null);
    try {
      aoPagar(await simularPagamentoPix(pedido.numero));
    } catch (falha) {
      setErro(falha.message);
      setSimulando(false);
    }
  }

  return (
    <section className={`${classeCartao} ring-2 ring-dourado/60`}>
      <h2 className="flex items-center gap-3 font-bodoni text-2xl text-stone-900">
        <QrCode className="size-6 text-marca" strokeWidth={1.5} />
        Pague com Pix
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        Copie o código abaixo e cole na opção “Pix copia e cola” do app do seu banco. Valor: {formatarPreco(pedido.total)}.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <code className="min-w-0 flex-1 break-all rounded-2xl bg-fundo px-4 py-3 text-xs text-stone-700">
          {pedido.pagamento.pixCopiaECola}
        </code>
        <button
          type="button"
          onClick={copiar}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-marca px-5 py-3 text-sm font-semibold text-marca transition-colors hover:bg-marca hover:text-white"
        >
          {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copiado ? "Copiado" : "Copiar código"}
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-areia/70 px-4 py-3 text-sm text-stone-700">
        <strong>Ambiente de teste:</strong> este código não funciona em bancos. Para seguir o fluxo, simule o pagamento.
        <div className="mt-3">
          <Botao onClick={simular} disabled={simulando}>
            {simulando ? "Confirmando..." : "Simular pagamento"}
          </Botao>
        </div>
      </div>

      {erro && <p role="alert" className="mt-3 text-sm text-oferta">{erro}</p>}
    </section>
  );
}
