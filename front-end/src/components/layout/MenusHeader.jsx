import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Heart, Search, ShoppingBag } from 'lucide-react'

import { useCarrinho } from '../../hooks/useCarrinho'
import { formatarPreco, precoAtual } from '../../utils/preco'
import { COLECAO_PADRAO, COLECOES, FAMILIA_PADRAO, FAMILIAS } from '../../utils/familias'
import BarraFreteGratis from '../carrinho/BarraFreteGratis'
import ImagemProduto from '../produto/ImagemProduto'

// Conteúdo dos menus que abrem ao passar o mouse nos botões do header.
// Os menus "largos" ocupam toda a largura embaixo do header; os outros são caixinhas
// alinhadas ao botão.

function contarPor(produtos, campo) {
    const totais = new Map()
    produtos.forEach((produto) => {
        const valor = produto[campo]
        if (valor) totais.set(valor, (totais.get(valor) ?? 0) + 1)
    })
    return totais
}

function plural(total, singular, varios) {
    return `${total} ${total === 1 ? singular : varios}`
}

// ---------- Moldura dos menus ----------

export function PainelLargo({ children }) {
    return (
        <div className="absolute inset-x-0 top-full hidden border-t border-stone-200/80 bg-fundo shadow-2xl shadow-stone-900/10 md:block">
            <div className="conteudo animate-surgir py-10">{children}</div>
        </div>
    )
}

// "lado": de que lado do botão a caixa fica alinhada
export function PainelCaixa({ children, className = 'w-80', lado = 'direita' }) {
    return (
        // pt-3 cria uma "ponte" invisível entre o botão e a caixa, para o mouse não "cair" no caminho
        <div className={`absolute top-full z-30 pt-3 ${lado === 'esquerda' ? 'left-0' : 'right-0'}`}>
            <div className={`max-w-[calc(100vw-2rem)] animate-surgir rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-2xl shadow-stone-900/15 ${className}`}>
                {children}
            </div>
        </div>
    )
}

function TituloColuna({ children }) {
    return <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-marca-media">{children}</p>
}

function LinkSimples({ to, children, detalhe }) {
    return (
        <Link to={to} className="group flex items-center justify-between gap-3 py-1.5 text-sm text-stone-700 transition-colors hover:text-marca">
            <span className="transition-transform duration-300 group-hover:translate-x-1">{children}</span>
            {detalhe && <span className="text-xs text-stone-400">{detalhe}</span>}
        </Link>
    )
}

function ProdutoMini({ produto }) {
    return (
        <Link to={`/produto/${produto.slug}`} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-marca-clara">
            <ImagemProduto src={produto.imagem} alt="" className="h-16 w-14 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">{produto.marca}</p>
                <p className="truncate font-bodoni text-base text-stone-900 group-hover:text-marca">{produto.nome}</p>
                <p className="text-sm font-semibold text-stone-800">{formatarPreco(precoAtual(produto))}</p>
            </div>
        </Link>
    )
}

// ---------- Menus dos links da esquerda ----------

export function PainelCatalogo({ categorias, marcas, produtos }) {
    const porCategoria = contarPor(produtos, 'categoriaSlug')
    const porMarca = contarPor(produtos, 'marcaSlug')
    const maiorDesconto = Math.max(0, ...produtos.map((produto) => produto.descontoMaximo ?? 0))

    return (
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr_1.5fr_1.4fr]">
            <div>
                <TituloColuna>Coleções</TituloColuna>
                <LinkSimples to="/catalogo" detalhe={produtos.length || null}>Todos os perfumes</LinkSimples>
                {categorias.map((categoria) => (
                    <LinkSimples key={categoria.id} to={`/catalogo?categoria=${categoria.slug}`} detalhe={porCategoria.get(categoria.slug)}>
                        {categoria.nome}
                    </LinkSimples>
                ))}
                <LinkSimples to="/catalogo?promocao=1">Ofertas</LinkSimples>
            </div>

            <div>
                <TituloColuna>Famílias olfativas</TituloColuna>
                {Object.keys(FAMILIAS).map((nome) => (
                    <LinkSimples key={nome} to={`/catalogo?familia=${encodeURIComponent(nome)}`}>{nome}</LinkSimples>
                ))}
            </div>

            <div className="hidden lg:block">
                <TituloColuna>Marcas</TituloColuna>
                <div className="grid grid-cols-2 gap-x-6">
                    {marcas.slice(0, 14).map((marca) => (
                        <LinkSimples key={marca.id} to={`/catalogo?marca=${marca.slug}`} detalhe={porMarca.get(marca.slug)}>
                            {marca.nome}
                        </LinkSimples>
                    ))}
                </div>
            </div>

            <Link to="/catalogo?promocao=1" className="group relative hidden min-h-56 overflow-hidden rounded-2xl lg:block">
                <img src="/images/promocoes/ofertas.jpg" alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-marca-escura/90 via-marca-escura/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-dourado">Ofertas da estação</p>
                    <p className="mt-1 font-bodoni text-2xl">
                        {maiorDesconto > 0 ? `Até ${maiorDesconto}% de desconto` : 'Preços especiais'}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium">
                        Ver ofertas <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </Link>
        </div>
    )
}

export function PainelNovidades({ produtos }) {
    return (
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_3fr]">
            <div>
                <TituloColuna>Acabaram de chegar</TituloColuna>
                <p className="font-bodoni text-3xl leading-tight text-stone-900">Os lançamentos da estação</p>
                <p className="mt-3 text-sm text-stone-600">Fragrâncias que acabaram de entrar no nosso catálogo.</p>
                <Link to="/catalogo?ordenacao=novidades" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-marca hover:text-destaque">
                    Ver todas as novidades <ArrowRight className="size-4" />
                </Link>
            </div>

            <ul className="grid grid-cols-2 gap-5 xl:grid-cols-4">
                {produtos.slice(0, 4).map((produto, posicao) => (
                    <li key={produto.id} className="animate-surgir" style={{ animationDelay: `${posicao * 70}ms` }}>
                        <Link to={`/produto/${produto.slug}`} className="group block">
                            <div className="overflow-hidden rounded-xl bg-areia">
                                <ImagemProduto src={produto.imagem} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">{produto.marca}</p>
                            <p className="font-bodoni text-lg text-stone-900 group-hover:text-marca">{produto.nome}</p>
                            <p className="text-sm font-semibold text-stone-800">{formatarPreco(precoAtual(produto))}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function PainelColecoes({ categorias, produtos }) {
    const porCategoria = contarPor(produtos, 'categoriaSlug')

    return (
        <ul className="grid gap-5 md:grid-cols-3">
            {categorias.map((categoria, posicao) => {
                const estilo = COLECOES[categoria.slug] ?? COLECAO_PADRAO
                const Icone = estilo.icone
                const total = porCategoria.get(categoria.slug) ?? 0

                return (
                    <li key={categoria.id} className="animate-surgir" style={{ animationDelay: `${posicao * 70}ms` }}>
                        <Link
                            to={`/catalogo?categoria=${categoria.slug}`}
                            className={`group relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl bg-linear-to-br p-6 ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lg ${estilo.fundo}`}
                        >
                            <Icone className={`absolute -right-6 -top-6 size-32 transition-transform duration-500 group-hover:rotate-12 ${estilo.detalhe}`} strokeWidth={0.75} aria-hidden="true" />
                            <p className="relative text-sm text-stone-600">{plural(total, 'perfume', 'perfumes')}</p>
                            <p className="relative font-bodoni text-3xl text-stone-900">{categoria.nome}</p>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}

export function PainelFamilias({ produtos }) {
    const porFamilia = contarPor(produtos, 'familiaOlfativa')

    return (
        <div className="grid gap-10 lg:grid-cols-[1fr_3fr]">
            <div>
                <TituloColuna>Encontre seu perfume</TituloColuna>
                <p className="font-bodoni text-3xl leading-tight text-stone-900">Comece pelo cheiro que você ama</p>
                <p className="mt-3 text-sm text-stone-600">Cada família reúne perfumes com notas parecidas. Escolha uma para ver as opções.</p>
            </div>

            <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {Object.keys(FAMILIAS).map((nome) => {
                    const { icone: Icone, descricao } = FAMILIAS[nome] ?? FAMILIA_PADRAO
                    const total = porFamilia.get(nome)

                    return (
                        <li key={nome}>
                            <Link
                                to={`/catalogo?familia=${encodeURIComponent(nome)}`}
                                className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destaque-clara text-destaque transition-colors group-hover:bg-destaque group-hover:text-white">
                                    <Icone className="size-5" strokeWidth={1.5} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block font-bodoni text-lg text-stone-900">{nome}</span>
                                    <span className="block truncate text-xs text-stone-500">
                                        {total ? `${plural(total, 'perfume', 'perfumes')} · ` : ''}
                                        {descricao}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

// ---------- Menus dos ícones da direita ----------

const BUSCAS_POPULARES = ['Floral', 'Amadeirado', 'Chanel', 'Dior', 'Baunilha', 'Cítrico']

export function PainelBusca({ aoBuscar, lado }) {
    const navigate = useNavigate()
    const [termo, setTermo] = useState('')

    function buscar(evento) {
        evento.preventDefault()
        const texto = termo.trim()
        navigate(texto ? `/catalogo?q=${encodeURIComponent(texto)}` : '/catalogo')
        aoBuscar()
    }

    return (
        <PainelCaixa className="w-96" lado={lado}>
            <form onSubmit={buscar} className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
                <input
                    type="search"
                    value={termo}
                    onChange={(evento) => setTermo(evento.target.value)}
                    placeholder="Nome, marca ou família"
                    aria-label="Buscar perfume"
                    autoFocus
                    className="h-11 w-full rounded-full border border-stone-300 bg-fundo pl-11 pr-4 text-sm outline-none transition focus:border-marca focus:ring-4 focus:ring-marca/15"
                />
            </form>

            <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Buscas populares</p>
            <div className="flex flex-wrap gap-2">
                {BUSCAS_POPULARES.map((busca) => (
                    <Link
                        key={busca}
                        to={`/catalogo?q=${encodeURIComponent(busca)}`}
                        className="rounded-full bg-marca-clara px-3 py-1.5 text-sm text-marca transition-colors hover:bg-marca hover:text-white"
                    >
                        {busca}
                    </Link>
                ))}
            </div>
        </PainelCaixa>
    )
}

export function PainelFavoritos({ usuario, favoritos }) {
    if (!usuario) {
        return (
            <PainelCaixa>
                <Heart className="size-6 text-destaque" strokeWidth={1.5} />
                <p className="mt-3 font-bodoni text-xl text-stone-900">Guarde o que você amou</p>
                <p className="mt-1 text-sm text-stone-600">Entre na sua conta para salvar seus perfumes favoritos.</p>
                <Link to="/login" className="mt-4 flex justify-center rounded-full bg-marca py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-escura">
                    Entrar
                </Link>
            </PainelCaixa>
        )
    }

    return (
        <PainelCaixa>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Seus favoritos ({favoritos.length})
            </p>
            {favoritos.length === 0 ? (
                <p className="mt-3 text-sm text-stone-600">Toque no coração de um perfume para salvá-lo aqui.</p>
            ) : (
                <div className="mt-2 -mx-2">
                    {favoritos.slice(0, 3).map((produto) => (
                        <ProdutoMini key={produto.id} produto={produto} />
                    ))}
                </div>
            )}
            <Link to={favoritos.length > 0 ? '/favoritos' : '/catalogo'} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-marca hover:text-destaque">
                {favoritos.length > 0 ? 'Ver todos os favoritos' : 'Explorar perfumes'} <ArrowRight className="size-4" />
            </Link>
        </PainelCaixa>
    )
}

export function PainelCarrinho() {
    const { itens, quantidadeTotal, resumo } = useCarrinho()

    if (itens.length === 0) {
        return (
            <PainelCaixa>
                <div className="flex flex-col items-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-marca-clara text-marca">
                        <ShoppingBag className="size-5" strokeWidth={1.5} />
                    </span>
                    <p className="mt-3 font-bodoni text-xl text-stone-900">Sua sacola está vazia</p>
                    <p className="mt-1 text-sm text-stone-600">Que tal começar pelas novidades da estação?</p>
                </div>
                <BarraFreteGratis subtotal={0} className="mt-5 rounded-xl bg-fundo p-4" />
                <Link to="/catalogo" className="mt-4 flex justify-center rounded-full bg-marca py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-escura">
                    Ver perfumes
                </Link>
            </PainelCaixa>
        )
    }

    return (
        <PainelCaixa className="w-96">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Sua sacola ({plural(quantidadeTotal, 'item', 'itens')})
            </p>
            <ul className="-mx-2 mt-2 max-h-64 overflow-y-auto">
                {itens.slice(0, 4).map((item) => (
                    <li key={item.varianteId}>
                        <Link to={`/produto/${item.slug}`} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-marca-clara">
                            <ImagemProduto src={item.imagem} alt="" className="h-16 w-14 shrink-0 rounded-lg object-cover" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-bodoni text-base text-stone-900 group-hover:text-marca">{item.nome}</p>
                                <p className="text-xs text-stone-500">{item.volumeMl} ml · {item.quantidade}x</p>
                            </div>
                            <p className="text-sm font-semibold text-stone-800">{formatarPreco(precoAtual(item) * item.quantidade)}</p>
                        </Link>
                    </li>
                ))}
            </ul>
            {itens.length > 4 && <p className="mt-1 text-xs text-stone-500">e mais {plural(itens.length - 4, 'perfume', 'perfumes')}...</p>}

            <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-semibold text-stone-900">{formatarPreco(resumo.subtotal)}</span>
            </div>
            <BarraFreteGratis subtotal={resumo.subtotal} className="mt-3 rounded-xl bg-fundo p-3" />

            <Link to="/carrinho" className="mt-4 flex justify-center rounded-full bg-marca py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-escura">
                Ver sacola e finalizar
            </Link>
        </PainelCaixa>
    )
}
