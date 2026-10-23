import { Link } from "react-router-dom";

import { formatarPreco, percentualDesconto, precoAtual, temDesconto } from "../../utils/preco";
import { formatarVolumes, nomeConcentracao } from "../../utils/produto";
import BotaoFavorito from "./BotaoFavorito";
import ImagemProduto from "./ImagemProduto";

// "produto" no formato de GET /produtos (preços em centavos)
export default function ProductCard({ produto }) {
  const emPromocao = temDesconto(produto);
  const linkProduto = `/produto/${produto.slug}`;

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-areia shadow-sm ring-1 ring-stone-900/5 transition-shadow duration-500 group-hover:shadow-xl group-hover:shadow-stone-900/10">
        {/* A foto também leva ao produto, mas fica fora do Tab: o nome já é o link acessível */}
        <Link to={linkProduto} tabIndex={-1} aria-hidden="true" className="block aspect-[4/5]">
          <ImagemProduto
            src={produto.imagem}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        </Link>

        {/* O desconto pode estar só em outro volume (ex.: no frasco maior): aí o selo diz "Até" */}
        {produto.descontoMaximo > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-oferta px-2.5 py-1 text-xs font-semibold text-white">
            {emPromocao ? `-${percentualDesconto(produto)}%` : `Até -${produto.descontoMaximo}%`}
          </span>
        )}

        {!produto.emEstoque && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-600">
            Esgotado
          </span>
        )}

        <BotaoFavorito produto={produto} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          {produto.marca}
        </span>

        <h3 className="mt-1 font-bodoni text-lg leading-snug text-stone-900">
          <Link to={linkProduto} className="transition-colors hover:text-marca">
            {produto.nome}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          {nomeConcentracao(produto.concentracao)} · {formatarVolumes(produto.volumes)}
        </p>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
          {produto.volumes.length > 1 && <span className="text-xs text-stone-500">a partir de</span>}
          <span className={`text-lg font-semibold ${emPromocao ? "text-oferta" : "text-stone-900"}`}>
            {formatarPreco(precoAtual(produto))}
          </span>
          {emPromocao && (
            <span className="text-sm text-stone-400 line-through">{formatarPreco(produto.preco)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
