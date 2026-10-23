import { Link } from 'react-router-dom'
import { ChevronDown, Heart, Search, ShoppingBag } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { useCarregar } from '../../hooks/useCarregar'
import { useCarrinho } from '../../hooks/useCarrinho'
import { useFavoritos } from '../../hooks/useFavoritos'
import { listarCategorias } from '../../services/categoriasService'
import { listarMarcas } from '../../services/marcasService'
import { listarProdutos } from '../../services/produtosService'
import FlorMagnolia from '../ui/FlorMagnolia'
import MenuConta from './MenuConta'
import {
    PainelBusca,
    PainelCarrinho,
    PainelCatalogo,
    PainelColecoes,
    PainelFamilias,
    PainelFavoritos,
    PainelLargo,
    PainelNovidades,
} from './MenusHeader'

// Coleções e "Encontre seu perfume" levam às seções da home (/#colecoes e /#familias).
// "id" diz qual menu largo abre ao passar o mouse.
const links = [
    { id: 'catalogo', texto: 'Nosso catálogo', href: '/catalogo' },
    { id: 'novidades', texto: 'Novidades', href: '/catalogo?ordenacao=novidades' },
    { id: 'colecoes', texto: 'Coleções', href: '/#colecoes' },
    { id: 'familias', texto: 'Encontre seu perfume', href: '/#familias' },
]

const classeIcone = 'size-[22px] md:size-[26px]'
const classeBotao = 'relative flex items-center gap-2 transition-colors duration-300 hover:text-destaque'

export default function HeaderMenu({ menuAberto, abrirMenu, fecharMenu }) {
    const { usuario } = useAuth()
    const { favoritos } = useFavoritos()
    const { quantidadeTotal: quantidadeCarrinho } = useCarrinho()

    // Dados usados dentro dos menus
    const produtos = useCarregar(listarProdutos).dados ?? []
    const categorias = useCarregar(listarCategorias).dados ?? []
    const marcas = useCarregar(listarMarcas).dados ?? []

    // Props comuns a todos os itens com menu
    const controle = { menuAberto, abrirMenu, fecharMenu }

    function painelDoLink(id) {
        switch (id) {
            case 'catalogo':
                return <PainelCatalogo categorias={categorias} marcas={marcas} produtos={produtos} />
            case 'novidades':
                return <PainelNovidades produtos={produtos} />
            case 'colecoes':
                return <PainelColecoes categorias={categorias} produtos={produtos} />
            default:
                return <PainelFamilias produtos={produtos} />
        }
    }

    return (
        // Duas linhas, com a logo sempre no centro:
        // 1ª linha: busca (esquerda) | logo | favoritos, conta e carrinho (direita)
        // 2ª linha: links do menu, centralizados embaixo da logo
        // No celular a busca vira um ícone junto dos outros, e a logo vai para a esquerda.
        <div className="conteudo">
            <div className="grid grid-cols-[1fr_auto] items-center pb-4 pt-6 md:grid-cols-[1fr_auto_1fr] md:pb-5 md:pt-7">
                {/* Busca (só em telas médias para cima) */}
                <ul className="hidden justify-self-start md:flex">
                    <ItemComMenu id="busca" {...controle} painel={<PainelBusca lado="esquerda" aoBuscar={() => fecharMenu(true)} />}>
                        {/* Abre o catálogo com o campo de busca já selecionado */}
                        <Link
                            to="/catalogo"
                            state={{ focarBusca: true }}
                            className="flex h-10 w-48 items-center gap-3 rounded-full border border-stone-300/80 bg-white/60 px-4 text-sm text-stone-500 transition-colors duration-300 hover:border-destaque hover:text-stone-700 lg:w-60"
                        >
                            <Search className="size-[18px] shrink-0" strokeWidth={1.75} />
                            Buscar perfumes
                        </Link>
                    </ItemComMenu>
                </ul>

                {/* Título */}
                <Link to="/" className="group/titulo col-start-1 row-start-1 flex flex-col items-start gap-1 md:col-start-2 md:items-center">
                    {/* A flor "brota" do "o" (span próprio); fica solta, então não tira o título do centro */}
                    <span className="relative font-bodoni text-3xl leading-9 text-marca-escura transition-colors duration-500 group-hover/titulo:text-destaque md:text-4xl md:leading-10">
                        Magn
                        <span className="relative">
                            o
                            <FlorMagnolia className="absolute left-1/2 top-[0.7em] w-[0.62em] -translate-x-1/2 -translate-y-full origin-bottom transition-[rotate] duration-500 group-hover/titulo:rotate-[10deg]" />
                        </span>
                        lia
                    </span>
                    <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.2em] text-marca-media md:tracking-[0.3em]">Perfumaria botânica</span>
                </Link>

                {/* Botões da direita */}
                <nav aria-label="Atalhos" className="col-start-2 row-start-1 justify-self-end md:col-start-3">
                    <ul className="flex items-center gap-3 sm:gap-5 md:gap-6">
                        <li className="md:hidden">
                            <Link to="/catalogo" state={{ focarBusca: true }} aria-label="Pesquisar" title="Pesquisar" className={classeBotao}>
                                <Search className={classeIcone} strokeWidth={1.5} />
                            </Link>
                        </li>

                        <ItemComMenu id="favoritos" {...controle} painel={<PainelFavoritos usuario={usuario} favoritos={favoritos} />}>
                            <Link
                                to="/favoritos"
                                aria-label={usuario && favoritos.length > 0 ? `Meus favoritos (${favoritos.length})` : 'Meus favoritos'}
                                title="Meus favoritos"
                                className={classeBotao}
                            >
                                <Heart className={classeIcone} strokeWidth={1.5} />
                                {usuario && favoritos.length > 0 && (
                                    <span className="absolute -right-2 -top-1.5 flex size-[18px] items-center justify-center rounded-full bg-destaque text-[10px] font-semibold text-white">
                                        {favoritos.length}
                                    </span>
                                )}
                            </Link>
                        </ItemComMenu>

                        <ItemComMenu id="conta" {...controle}>
                            <MenuConta aberto={menuAberto === 'conta'} abrir={() => abrirMenu('conta')} fechar={() => fecharMenu(true)} />
                        </ItemComMenu>

                        <ItemComMenu id="carrinho" {...controle} painel={<PainelCarrinho />}>
                            <Link to="/carrinho" aria-label="Carrinho" title="Carrinho" className={classeBotao}>
                                <ShoppingBag className={classeIcone} strokeWidth={1.5} />
                                <span className="hidden text-base sm:inline md:text-lg">({quantidadeCarrinho})</span>
                            </Link>
                        </ItemComMenu>
                    </ul>
                </nav>
            </div>

            {/* Links do menu, centralizados embaixo da logo */}
            <nav aria-label="Principal" className="border-t border-stone-200/70">
                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2.5 text-sm font-medium sm:gap-x-10 2xl:text-[15px]">
                    {links.map((link) => (
                        <ItemComMenu key={link.id} id={link.id} {...controle} painel={<PainelLargo>{painelDoLink(link.id)}</PainelLargo>} largo>
                            <Link
                                to={link.href}
                                aria-expanded={menuAberto === link.id}
                                className={`group/link relative flex items-center gap-1 whitespace-nowrap py-1 transition-colors duration-300 hover:text-marca ${
                                    menuAberto === link.id ? 'text-marca' : ''
                                }`}
                            >
                                {link.texto}
                                <ChevronDown
                                    className={`hidden size-3.5 transition-transform duration-300 md:block ${menuAberto === link.id ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                                {/* Linha que cresce embaixo do link ativo */}
                                <span
                                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-marca transition-transform duration-300 ${
                                        menuAberto === link.id ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'
                                    }`}
                                    aria-hidden="true"
                                />
                            </Link>
                        </ItemComMenu>
                    ))}
                </ul>
            </nav>
        </div>
    )
}

// Item do header que abre um menu ao passar o mouse (ou ao chegar nele com o Tab).
// "largo": o menu ocupa toda a largura embaixo do header, então o <li> não pode ser "relative".
function ItemComMenu({ id, menuAberto, abrirMenu, fecharMenu, painel, largo = false, children }) {
    const aberto = menuAberto === id

    return (
        <li
            className={largo ? '' : 'relative'}
            onMouseEnter={() => abrirMenu(id)}
            onMouseLeave={() => fecharMenu()}
            onFocus={() => abrirMenu(id)}
            onBlur={(evento) => {
                if (!evento.currentTarget.contains(evento.relatedTarget)) fecharMenu(true)
            }}
            onKeyDown={(evento) => {
                if (evento.key === 'Escape') fecharMenu(true)
            }}
            onClick={(evento) => {
                // Clicou num link (do botão ou de dentro do menu): fecha o menu
                if (evento.target.closest('a')) fecharMenu(true)
            }}
        >
            {children}
            {aberto && painel}
        </li>
    )
}
