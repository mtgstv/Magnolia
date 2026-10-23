import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import FiltrosAtivos from "../components/catalogo/FiltrosAtivos";
import GavetaFiltros from "../components/catalogo/GavetaFiltros";
import ProductFilters from "../components/catalogo/ProductFilters";
import PromotionsCarousel from "../components/catalogo/PromotionsCarousel";
import GradeProdutos from "../components/produto/GradeProdutos";
import Botao from "../components/ui/Botao";
import EstadoVazio from "../components/ui/EstadoVazio";
import MensagemErro from "../components/ui/MensagemErro";
import Trilha from "../components/ui/Trilha";
import { useCarregar } from "../hooks/useCarregar";
import { listarCategorias } from "../services/categoriasService";
import { listarMarcas } from "../services/marcasService";
import { listarProdutos } from "../services/produtosService";
import { listarPromocoes } from "../services/promocoesService";
import {
  filtrarProdutos,
  lerFiltros,
  ORDENACOES,
  paraParams,
  semFiltros
} from "../utils/filtrosCatalogo";

function contarPor(produtos, campo) {
  const totais = new Map();
  produtos.forEach((produto) => {
    const valor = produto[campo];
    if (valor) totais.set(valor, (totais.get(valor) ?? 0) + 1);
  });
  return totais;
}

// Atualiza a URL sem passar pelo React Router. Pelo roteador, a mudança seria aplicada numa
// transição do React e os campos "voltariam" ao valor antigo por um instante (a caixinha
// desmarcava sozinha e a busca podia perder letras). replaceState: digitar não enche o histórico.
function espelharNaUrl(filtros) {
  const busca = paraParams(filtros).toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${busca ? `?${busca}` : ""}`);
}

function Catalogo() {
  const location = useLocation();

  // Navegar até o catálogo "de fora" (link do header ou da home, voltar do navegador)
  // gera uma nova location.key e recria os filtros a partir da URL
  return (
    <ConteudoCatalogo
      key={location.key}
      urlInicial={location.search}
      focarBusca={Boolean(location.state?.focarBusca)}
    />
  );
}

function ConteudoCatalogo({ urlInicial, focarBusca }) {
  const [filtros, setFiltros] = useState(() => lerFiltros(new URLSearchParams(urlInicial)));
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const produtos = useCarregar(listarProdutos);
  const marcas = useCarregar(listarMarcas);
  const categorias = useCarregar(listarCategorias);
  const promocoes = useCarregar(listarPromocoes);

  function atualizar(mudancas) {
    const novos = { ...filtros, ...mudancas };
    setFiltros(novos);
    espelharNaUrl(novos);
  }

  function limparFiltros() {
    atualizar({ ...lerFiltros(new URLSearchParams()), ordenacao: filtros.ordenacao });
  }

  const fecharFiltros = useCallback(() => setFiltrosAbertos(false), []);

  const lista = produtos.dados ?? [];
  const listaCategorias = categorias.dados ?? [];
  const listaMarcas = marcas.dados ?? [];
  const resultado = filtrarProdutos(lista, filtros);

  const contagens = {
    categorias: contarPor(lista, "categoriaSlug"),
    marcas: contarPor(lista, "marcaSlug"),
    familias: contarPor(lista, "familiaOlfativa")
  };
  const familias = [...contagens.familias.keys()].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const quantidadeFiltros =
    (filtros.categoria ? 1 : 0) +
    filtros.marcas.length +
    filtros.familias.length +
    (filtros.precoMinimo || filtros.precoMaximo ? 1 : 0) +
    (filtros.somentePromocao ? 1 : 0);

  const titulo =
    listaCategorias.find((categoria) => categoria.slug === filtros.categoria)?.nome ??
    (filtros.familias.length === 1 ? filtros.familias[0] : null) ??
    (filtros.somentePromocao ? "Ofertas" : "Todos os perfumes");

  function filtrosLaterais(prefixo) {
    return (
      <ProductFilters
        prefixo={prefixo}
        filtros={filtros}
        atualizar={atualizar}
        categorias={listaCategorias}
        marcas={listaMarcas}
        familias={familias}
        contagens={contagens}
      />
    );
  }

  return (
    <main className="conteudo pt-8">
      <Trilha itens={[{ rotulo: "Início", para: "/" }, { rotulo: "Catálogo" }]} />

      <div className="mt-6">
        {promocoes.carregando ? (
          <div className="h-56 animate-pulse rounded-3xl bg-stone-100 sm:h-64 lg:h-72" />
        ) : (
          promocoes.dados?.length > 0 && <PromotionsCarousel promocoes={promocoes.dados} />
        )}
      </div>

      <header className="mt-12">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-marca-media">Catálogo</p>
        <h1 className="mt-2 font-bodoni text-4xl text-stone-900 md:text-5xl">{titulo}</h1>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[250px_1fr] xl:gap-14">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-6">
            <div className="flex items-center justify-between pb-5">
              <h2 className="text-lg font-medium text-stone-900">Filtrar</h2>
              {!semFiltros(filtros) && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-800"
                >
                  Limpar
                </button>
              )}
            </div>
            {filtrosLaterais("lateral")}
          </div>
        </aside>

        <section aria-label="Perfumes">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar perfume</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={filtros.busca}
                onChange={(evento) => atualizar({ busca: evento.target.value })}
                placeholder="Buscar por nome, marca ou família"
                autoFocus={focarBusca}
                className="h-12 w-full rounded-full border border-stone-300 bg-white pl-12 pr-5 outline-none transition placeholder:text-stone-400 focus:border-marca focus:ring-4 focus:ring-marca/15"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFiltrosAbertos(true)}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-stone-300 px-5 text-sm font-medium hover:border-marca hover:text-marca lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filtros
                {quantidadeFiltros > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-marca text-[11px] text-white">
                    {quantidadeFiltros}
                  </span>
                )}
              </button>

              <label className="relative flex-1 sm:flex-none">
                <span className="sr-only">Ordenar por</span>
                <select
                  value={filtros.ordenacao}
                  onChange={(evento) => atualizar({ ordenacao: evento.target.value })}
                  className="h-12 w-full appearance-none rounded-full border border-stone-300 bg-white pl-5 pr-11 text-sm font-medium outline-none transition focus:border-marca focus:ring-4 focus:ring-marca/15"
                >
                  {ORDENACOES.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
              </label>
            </div>
          </div>

          <p className="mt-5 text-sm text-stone-500" aria-live="polite">
            {produtos.carregando && lista.length === 0
              ? "Carregando perfumes..."
              : `${resultado.length} ${resultado.length === 1 ? "perfume encontrado" : "perfumes encontrados"}`}
          </p>

          <div className="mt-3">
            <FiltrosAtivos
              filtros={filtros}
              atualizar={atualizar}
              categorias={listaCategorias}
              marcas={listaMarcas}
              aoLimpar={limparFiltros}
            />
          </div>

          <div className="mt-8">
            {produtos.erro ? (
              <MensagemErro erro={produtos.erro} aoTentarDeNovo={produtos.recarregar} />
            ) : !produtos.carregando && resultado.length === 0 ? (
              <EstadoVazio
                icone={Search}
                titulo="Nenhum perfume encontrado"
                texto="Tente remover algum filtro ou buscar por outro nome."
              >
                <Botao onClick={limparFiltros}>Limpar filtros</Botao>
              </EstadoVazio>
            ) : (
              <GradeProdutos
                produtos={resultado}
                carregando={produtos.carregando}
                quantidadeCarregando={6}
                className="grid-cols-2 xl:grid-cols-3"
              />
            )}
          </div>
        </section>
      </div>

      <GavetaFiltros
        aberta={filtrosAbertos}
        aoFechar={fecharFiltros}
        aoLimpar={limparFiltros}
        totalResultados={resultado.length}
      >
        {filtrosLaterais("gaveta")}
      </GavetaFiltros>
    </main>
  );
}

export default Catalogo;
