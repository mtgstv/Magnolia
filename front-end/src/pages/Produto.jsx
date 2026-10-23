import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check } from "lucide-react";

import BotaoFavorito from "../components/produto/BotaoFavorito";
import GradeProdutos from "../components/produto/GradeProdutos";
import ImagemProduto from "../components/produto/ImagemProduto";
import MensagemErro from "../components/ui/MensagemErro";
import Secao from "../components/ui/Secao";
import Trilha from "../components/ui/Trilha";
import { useCarregar } from "../hooks/useCarregar";
import { buscarProduto, listarProdutos } from "../services/produtosService";
import { formatarPreco, percentualDesconto, precoAtual, temDesconto } from "../utils/preco";
import { nomeConcentracao, resumoDoDetalhe } from "../utils/produto";
import NaoEncontrado from "./NaoEncontrado";

const NOTAS = [
  { campo: "notasTopo", titulo: "Topo", explicacao: "A primeira impressão, logo ao aplicar" },
  { campo: "notasCoracao", titulo: "Coração", explicacao: "O corpo do perfume, depois de alguns minutos" },
  { campo: "notasFundo", titulo: "Fundo", explicacao: "O que permanece na pele por mais tempo" }
];

function Produto() {
  const { slug } = useParams();
  const buscar = useCallback(() => buscarProduto(slug), [slug]);
  const produto = useCarregar(buscar);
  const todos = useCarregar(listarProdutos);

  const [varianteEscolhida, setVarianteEscolhida] = useState(null);
  const [imagemEscolhida, setImagemEscolhida] = useState(0);

  if (produto.erro?.status === 404) {
    return (
      <NaoEncontrado
        titulo="Perfume não encontrado"
        mensagem="Esse perfume não está mais disponível no nosso catálogo."
      />
    );
  }

  if (produto.erro) {
    return (
      <main className="conteudo py-16">
        <MensagemErro erro={produto.erro} aoTentarDeNovo={produto.recarregar} />
      </main>
    );
  }

  if (produto.carregando) {
    return <EsqueletoProduto />;
  }

  const dados = produto.dados;
  // Começa no primeiro volume com estoque. Ao trocar de perfume, o id escolhido não existe
  // nas variantes novas, então volta para o padrão sozinho.
  const variante =
    dados.variantes.find((item) => item.id === varianteEscolhida) ??
    dados.variantes.find((item) => item.emEstoque) ??
    dados.variantes[0];
  const imagem = dados.imagens[imagemEscolhida] ?? dados.imagens[0];
  const emPromocao = temDesconto(variante);

  // Primeiro os da mesma família olfativa, depois os da mesma categoria
  const outros = (todos.dados ?? []).filter((item) => item.id !== dados.id);
  const relacionados = [
    ...outros.filter((item) => item.familiaOlfativa === dados.familiaOlfativa),
    ...outros.filter(
      (item) => item.familiaOlfativa !== dados.familiaOlfativa && item.categoriaSlug === dados.categoriaSlug
    )
  ].slice(0, 4);

  return (
    <main>
      <div className="conteudo pt-8">
        <Trilha
          itens={[
            { rotulo: "Início", para: "/" },
            { rotulo: "Catálogo", para: "/catalogo" },
            { rotulo: dados.categoria, para: `/catalogo?categoria=${dados.categoriaSlug}` },
            { rotulo: dados.nome }
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Galeria */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-stone-100">
              <ImagemProduto
                src={imagem?.url}
                alt={imagem?.alt ?? dados.nome}
                className="size-full object-contain p-10 md:p-16"
              />
              {emPromocao && (
                <span className="absolute left-5 top-5 rounded-full bg-oferta px-3 py-1.5 text-sm font-semibold text-white">
                  -{percentualDesconto(variante)}%
                </span>
              )}
            </div>

            {dados.imagens.length > 1 && (
              <div className="mt-4 flex gap-3">
                {dados.imagens.map((item, indice) => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => setImagemEscolhida(indice)}
                    aria-label={`Ver imagem ${indice + 1}`}
                    className={`size-20 overflow-hidden rounded-xl bg-stone-100 ring-2 ${
                      item === imagem ? "ring-marca" : "ring-transparent"
                    }`}
                  >
                    <ImagemProduto src={item.url} alt="" className="size-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="flex flex-col">
            <Link
              to={`/catalogo?marca=${dados.marcaSlug}`}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 hover:text-marca"
            >
              {dados.marca}
            </Link>
            <h1 className="mt-2 font-bodoni text-4xl leading-tight text-stone-900 md:text-5xl">{dados.nome}</h1>
            <p className="mt-2 text-stone-500">
              {nomeConcentracao(dados.concentracao)}
              {dados.familiaOlfativa && ` · ${dados.familiaOlfativa}`}
            </p>

            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={`text-3xl font-semibold ${emPromocao ? "text-oferta" : "text-stone-900"}`}>
                {formatarPreco(precoAtual(variante))}
              </span>
              {emPromocao && (
                <>
                  <span className="text-lg text-stone-400 line-through">{formatarPreco(variante.preco)}</span>
                  <span className="text-sm font-medium text-oferta">
                    Economize {formatarPreco(variante.preco - variante.precoPromocional)}
                  </span>
                </>
              )}
            </div>

            <fieldset className="mt-8">
              <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-900">Volume</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {dados.variantes.map((item) => {
                  const selecionada = item.id === variante.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVarianteEscolhida(item.id)}
                      aria-pressed={selecionada}
                      className={`flex min-w-28 flex-col items-start rounded-2xl border px-4 py-3 text-left transition ${
                        selecionada
                          ? "border-marca bg-marca-clara ring-1 ring-marca"
                          : "border-stone-300 hover:border-stone-500"
                      }`}
                    >
                      <span className="font-medium text-stone-900">{item.volumeMl} ml</span>
                      <span className="text-sm text-stone-500">
                        {item.emEstoque ? formatarPreco(precoAtual(item)) : "Esgotado"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <p className={`mt-5 flex items-center gap-2 text-sm ${variante.emEstoque ? "text-marca" : "text-stone-500"}`}>
              {variante.emEstoque && <Check className="size-4" />}
              {variante.emEstoque ? "Em estoque" : "Este volume está esgotado no momento"}
            </p>

            <BotaoFavorito produto={resumoDoDetalhe(dados)} variante="completo" className="mt-6 sm:max-w-sm" />

            {dados.descricao && <p className="mt-10 leading-relaxed text-stone-600">{dados.descricao}</p>}

            <section className="mt-10">
              <h2 className="font-bodoni text-2xl text-stone-900">Notas olfativas</h2>
              <dl className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200">
                {NOTAS.filter((nota) => dados[nota.campo]).map((nota) => (
                  <div key={nota.campo} className="grid gap-1 px-5 py-4 sm:grid-cols-[140px_1fr] sm:gap-6">
                    <dt>
                      <span className="font-medium text-stone-900">{nota.titulo}</span>
                      <span className="block text-xs text-stone-500">{nota.explicacao}</span>
                    </dt>
                    <dd className="text-stone-700">{dados[nota.campo]}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <Secao rotulo="Da mesma família" titulo="Você também pode gostar">
          <GradeProdutos produtos={relacionados} />
        </Secao>
      )}
    </main>
  );
}

function EsqueletoProduto() {
  return (
    <main className="conteudo animate-pulse pt-8" aria-busy="true">
      <div className="h-4 w-64 rounded-full bg-stone-100" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-square rounded-3xl bg-stone-100" />
        <div className="flex flex-col gap-4">
          <div className="h-3 w-24 rounded-full bg-stone-100" />
          <div className="h-12 w-3/4 rounded-full bg-stone-100" />
          <div className="h-4 w-1/2 rounded-full bg-stone-100" />
          <div className="mt-4 h-9 w-40 rounded-full bg-stone-100" />
          <div className="mt-6 flex gap-3">
            <div className="h-16 w-28 rounded-2xl bg-stone-100" />
            <div className="h-16 w-28 rounded-2xl bg-stone-100" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Produto;
