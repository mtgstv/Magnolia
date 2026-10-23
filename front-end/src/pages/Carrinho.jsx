import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, Gift, Lock, RotateCcw, ShieldCheck, ShoppingBag, Tag, Trash2, X } from "lucide-react";

import BarraFreteGratis from "../components/carrinho/BarraFreteGratis";
import CarrosselProdutos from "../components/produto/CarrosselProdutos";
import ImagemProduto from "../components/produto/ImagemProduto";
import Botao from "../components/ui/Botao";
import Revelar from "../components/ui/Revelar";
import Secao from "../components/ui/Secao";
import SeletorQuantidade from "../components/ui/SeletorQuantidade";
import Trilha from "../components/ui/Trilha";
import { useCarregar } from "../hooks/useCarregar";
import { useCarrinho } from "../hooks/useCarrinho";
import { listarProdutos } from "../services/produtosService";
import { formatarPreco, precoAtual, temDesconto } from "../utils/preco";

const GARANTIAS = [
  { icone: ShieldCheck, texto: "Produtos 100% originais" },
  { icone: RotateCcw, texto: "Troca grátis em até 7 dias" },
  { icone: Lock, texto: "Compra segura" }
];

const FORMAS_DE_PAGAMENTO = ["Pix", "Cartão de crédito", "Boleto"];

export default function Carrinho() {
  const { itens, quantidadeTotal } = useCarrinho();
  const produtos = useCarregar(listarProdutos);

  // Sugestões: perfumes que ainda não estão na sacola
  const idsNaSacola = new Set(itens.map((item) => item.produtoId));
  const sugestoes = (produtos.dados ?? []).filter((produto) => !idsNaSacola.has(produto.id)).slice(0, 8);

  return (
    <main>
      <div className="conteudo pt-8">
        <Trilha itens={[{ rotulo: "Início", para: "/" }, { rotulo: "Sacola" }]} />

        <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-marca-media">
              <span className="h-px w-8 bg-marca-media/60" aria-hidden="true" />
              Sua compra
            </p>
            <h1 className="mt-3 font-bodoni text-4xl text-stone-900 md:text-5xl">Sacola de compras</h1>
          </div>
          {itens.length > 0 && (
            <p className="text-sm text-stone-500">
              {quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"}
            </p>
          )}
        </header>

        {itens.length === 0 ? <SacolaVazia /> : <SacolaComItens />}
      </div>

      {(produtos.carregando || sugestoes.length > 0) && (
        <Secao
          rotulo={itens.length > 0 ? "Aproveite e leve também" : "Para começar"}
          titulo="Você também pode gostar"
          link="/catalogo"
        >
          <CarrosselProdutos produtos={sugestoes} carregando={produtos.carregando} />
        </Secao>
      )}
    </main>
  );
}

function SacolaVazia() {
  return (
    <Revelar className="mt-10 grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 md:grid-cols-2">
      <div className="flex flex-col items-start justify-center gap-4 p-8 sm:p-12">
        <span className="flex size-14 items-center justify-center rounded-full bg-marca-clara text-marca">
          <ShoppingBag className="size-6" strokeWidth={1.5} />
        </span>
        <h2 className="font-bodoni text-3xl text-stone-900 md:text-4xl">Sua sacola está vazia</h2>
        <p className="max-w-md text-stone-600">
          Explore nosso catálogo e encontre a fragrância que combina com você. Compras acima de R$ 299 têm frete grátis.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Botao to="/catalogo">Explorar perfumes</Botao>
          <Botao to="/catalogo?promocao=1" variante="secundario">
            Ver ofertas
          </Botao>
        </div>
      </div>
      <div className="relative min-h-64">
        <img
          src="/images/carrinho/presente.jpg"
          alt="Caixa de presente verde com laço"
          className="absolute inset-0 size-full object-cover object-[center_45%]"
        />
      </div>
    </Revelar>
  );
}

function SacolaComItens() {
  const { itens } = useCarrinho();

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px] xl:gap-12">
      {/* Itens */}
      <section aria-label="Itens da sacola">
        <ul className="divide-y divide-stone-200/80 overflow-hidden rounded-3xl bg-white shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5">
          {itens.map((item) => (
            <ItemSacola key={item.varianteId} item={item} />
          ))}
        </ul>

        <Link
          to="/catalogo"
          className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-marca hover:text-destaque"
        >
          <ArrowRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          Continuar comprando
        </Link>
      </section>

      {/* Resumo */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-6">
        <ResumoPedido />

        {/* Embalagem para presente */}
        <div className="relative overflow-hidden rounded-3xl text-white">
          <img src="/images/carrinho/presente.jpg" alt="" className="absolute inset-0 size-full object-cover object-[center_40%]" />
          <div className="absolute inset-0 bg-linear-to-r from-marca-escura/95 via-marca-escura/75 to-marca-escura/20" />
          <div className="relative flex items-center gap-4 p-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-dourado ring-1 ring-white/20">
              <Gift className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-bodoni text-xl">Vai presentear alguém?</p>
              <p className="text-sm text-green-100/85">Toda compra vai com embalagem de presente grátis.</p>
            </div>
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-3 text-center text-xs text-stone-600">
          {GARANTIAS.map(({ icone: Icone, texto }) => (
            <li key={texto} className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 p-3 ring-1 ring-stone-900/5">
              <Icone className="size-5 text-marca" strokeWidth={1.5} />
              {texto}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function ItemSacola({ item }) {
  const { alterarQuantidade, remover } = useCarrinho();
  const emPromocao = temDesconto(item);
  const linkProduto = `/produto/${item.slug}`;

  return (
    <li className="flex animate-surgir gap-4 p-4 sm:gap-6 sm:p-6">
      <Link to={linkProduto} className="shrink-0 overflow-hidden rounded-2xl bg-areia">
        <ImagemProduto
          src={item.imagem}
          alt=""
          className="h-32 w-24 object-cover transition-transform duration-500 hover:scale-105 sm:h-36 sm:w-28"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">{item.marca}</p>
            <Link to={linkProduto} className="mt-1 block font-bodoni text-xl leading-snug text-stone-900 hover:text-marca">
              {item.nome}
            </Link>
            <p className="mt-1 text-sm text-stone-500">{item.volumeMl} ml</p>
            {item.estoque < item.quantidade && (
              <p className="mt-1 text-sm font-medium text-oferta">
                {item.estoque === 0 ? "Esgotado: tire da sacola para finalizar" : item.estoque === 1 ? "Resta só 1 unidade" : `Restam só ${item.estoque} unidades`}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => remover(item.varianteId)}
            aria-label={`Remover ${item.nome} da sacola`}
            title="Remover"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-rose-50 hover:text-oferta"
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <SeletorQuantidade
            valor={item.quantidade}
            aoMudar={(nova) => alterarQuantidade(item.varianteId, nova)}
            rotulo={`Quantidade de ${item.nome}`}
            tamanho="pequeno"
            maximo={Math.max(1, item.estoque)}
          />

          <div className="text-right">
            {emPromocao && (
              <p className="text-xs text-stone-400 line-through">{formatarPreco(item.preco * item.quantidade)}</p>
            )}
            <p className={`text-lg font-semibold ${emPromocao ? "text-oferta" : "text-stone-900"}`}>
              {formatarPreco(precoAtual(item) * item.quantidade)}
            </p>
            {item.quantidade > 1 && (
              <p className="text-xs text-stone-500">{formatarPreco(precoAtual(item))} cada</p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function ResumoPedido() {
  const { itens, cupom, resumo, aplicarCupom, removerCupom } = useCarrinho();
  const [codigo, setCodigo] = useState("");
  const [erroCupom, setErroCupom] = useState(null);
  const [aplicando, setAplicando] = useState(false);
  const temEsgotado = itens.some((item) => item.estoque < item.quantidade);

  // A API confere o cupom e explica quando ele não vale (expirou, só na primeira compra...)
  async function enviarCupom(evento) {
    evento.preventDefault();
    if (!codigo.trim() || aplicando) return;

    setAplicando(true);
    try {
      await aplicarCupom(codigo);
      setCodigo("");
      setErroCupom(null);
    } catch (erro) {
      setErroCupom(erro.status === 400 ? `${erro.message} Experimente BEMVINDA10 ou PIX5.` : erro.message);
    } finally {
      setAplicando(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 sm:p-8">
      <h2 className="font-bodoni text-2xl text-stone-900">Resumo do pedido</h2>

      <BarraFreteGratis subtotal={resumo.subtotal} className="mt-5 rounded-2xl bg-fundo p-4" />

      {/* Cupom */}
      {cupom ? (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-marca/40 bg-marca-clara px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-marca-escura">
            <Tag className="size-4" strokeWidth={1.75} />
            <span>
              <strong className="tracking-wider">{cupom.codigo}</strong> · {cupom.descricao}
            </span>
          </p>
          <button
            type="button"
            onClick={removerCupom}
            aria-label="Remover cupom"
            className="flex size-7 items-center justify-center rounded-full text-stone-500 hover:bg-white hover:text-oferta"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={enviarCupom} className="mt-5">
          <label htmlFor="cupom" className="text-sm font-medium text-stone-700">
            Cupom de desconto
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="cupom"
              value={codigo}
              onChange={(evento) => {
                setCodigo(evento.target.value);
                setErroCupom(null);
              }}
              placeholder="Digite o código"
              aria-invalid={erroCupom ? true : undefined}
              aria-describedby={erroCupom ? "cupom-erro" : undefined}
              className="h-11 min-w-0 flex-1 rounded-full border border-stone-300 bg-stone-50/70 px-4 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-stone-400 focus:border-marca focus:bg-white focus:ring-4 focus:ring-marca/15"
            />
            <button
              type="submit"
              disabled={aplicando}
              className="h-11 rounded-full border border-marca px-5 text-sm font-semibold text-marca transition-colors hover:bg-marca hover:text-white"
            >
              Aplicar
            </button>
          </div>
          {erroCupom && (
            <p id="cupom-erro" className="mt-2 text-sm text-oferta">
              {erroCupom}
            </p>
          )}
        </form>
      )}

      {/* Valores */}
      <dl className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-600">Subtotal</dt>
          <dd className="font-medium text-stone-900">{formatarPreco(resumo.subtotal)}</dd>
        </div>
        {resumo.economiaPromocoes > 0 && (
          <div className="flex justify-between">
            <dt className="text-stone-600">Economia em promoções</dt>
            <dd className="font-medium text-oferta">-{formatarPreco(resumo.economiaPromocoes)}</dd>
          </div>
        )}
        {resumo.desconto > 0 && (
          <div className="flex justify-between">
            <dt className="text-stone-600">Cupom {cupom.codigo}</dt>
            <dd className="font-medium text-marca">-{formatarPreco(resumo.desconto)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-stone-600">Frete estimado</dt>
          <dd className={resumo.freteGratis ? "font-semibold text-marca" : "font-medium text-stone-900"}>
            {resumo.freteGratis ? "Grátis" : formatarPreco(resumo.frete)}
          </dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-stone-100 pt-4">
          <dt className="font-semibold text-stone-900">Total</dt>
          <dd className="font-bodoni text-3xl text-stone-900">{formatarPreco(resumo.total)}</dd>
        </div>
        <p className="-mt-1 text-right text-xs text-stone-500">
          ou 3x de {formatarPreco(Math.ceil(resumo.total / 3))} sem juros
        </p>
      </dl>

      {temEsgotado ? (
        <p role="status" className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm text-rose-800 ring-1 ring-rose-200">
          Algum perfume da sacola esgotou. Ajuste a quantidade ou tire-o da sacola para finalizar.
        </p>
      ) : (
        <Link
          to="/checkout"
          className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-marca py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-marca/20 transition-colors duration-300 hover:bg-marca-escura"
        >
          <Lock className="size-4" />
          Finalizar compra
        </Link>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <CreditCard className="size-4 text-stone-400" strokeWidth={1.5} />
        {FORMAS_DE_PAGAMENTO.map((forma) => (
          <span key={forma} className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-600">
            {forma}
          </span>
        ))}
      </div>
    </div>
  );
}
