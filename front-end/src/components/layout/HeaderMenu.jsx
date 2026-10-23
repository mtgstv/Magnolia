import { Link } from 'react-router-dom'
import { Heart, Search, ShoppingBag } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { useFavoritos } from '../../hooks/useFavoritos'
import MenuConta from './MenuConta'

// Coleções e "Encontre seu perfume" levam às seções da home (/#colecoes e /#familias)
const links = [
    { texto: 'Nosso catálogo', href: '/catalogo' },
    { texto: 'Novidades', href: '/catalogo?ordenacao=novidades' },
    { texto: 'Coleções', href: '/#colecoes' },
    { texto: 'Encontre seu perfume', href: '/#familias' },
]

const classeIcone = 'size-[22px] md:size-[26px]'
const classeBotao = 'relative flex items-center gap-2 transition-colors duration-300 hover:text-destaque'

export default function HeaderMenu() {
    const { usuario } = useAuth()
    const { favoritos } = useFavoritos()
    const quantidadeCarrinho = 0

    return (
        // Telas grandes (xl): links | logo | ícones, tudo numa linha.
        // Telas menores: logo e ícones em cima e os links numa segunda linha,
        // para os textos não ficarem espremidos.
        <div className="conteudo py-4 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-y-4">
            {/* Menu da esquerda */}
            <nav aria-label="Principal" className="col-span-full row-start-2 justify-self-center xl:col-span-1 xl:col-start-1 xl:row-start-1 xl:justify-self-start">
                <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm xl:flex-nowrap 2xl:gap-x-8 2xl:text-base">
                    {links.map((link) => (
                        <li key={link.texto}>
                            <Link
                                to={link.href}
                                className="whitespace-nowrap hover:text-destaque transition-colors duration-300"
                            >
                                {link.texto}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Título */}
            <Link to="/" className="col-start-1 row-start-1 md:col-start-2 flex flex-col items-start md:items-center gap-1">
                <span className="text-3xl md:text-4xl font-bodoni hover:text-destaque transition-colors duration-500">Magnolia</span>
                <span className="text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap text-marca-media">Perfumaria botânica</span>
            </Link>

            {/* Menu de botões da direita */}
            <nav aria-label="Atalhos" className="col-start-2 row-start-1 md:col-start-3 justify-self-end">
                <ul className="flex items-center gap-4 md:gap-7">
                    <li>
                        {/* Abre o catálogo com o campo de busca já selecionado */}
                        <Link to="/catalogo" state={{ focarBusca: true }} aria-label="Pesquisar" title="Pesquisar" className={classeBotao}>
                            <Search className={classeIcone} strokeWidth={1.5} />
                        </Link>
                    </li>

                    <li>
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
                    </li>

                    <li>
                        <MenuConta />
                    </li>

                    <li>
                        <Link to="/carrinho" aria-label="Carrinho" title="Carrinho" className={classeBotao}>
                            <ShoppingBag className={classeIcone} strokeWidth={1.5} />
                            <span className="text-base md:text-lg">({quantidadeCarrinho})</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

/*
Menus interativos nos botões
Easter-eggs
Header transparente e que acompanha o scroll só até uma parte da tela, depois dessa parte ela se esconde e vira um ícone de bolinha no canto esquerdo
Adicionar uma leve sombra embaixo da header que aparece quando ela "descolar"
abrir barra de pesquisa quando apertar na lupa com animação
*/
