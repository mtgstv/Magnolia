import { Search, User, ShoppingBag } from 'lucide-react'

const links = [
    { texto: 'Nosso catálogo', href: '#catalogo' },
    { texto: 'Novidades', href: '#novidades' },
    { texto: 'Coleções', href: '#colecoes' },
    { texto: 'Encontre seu perfume', href: '#encontre-seu-perfume' },
]

const buttons = [
    { texto: 'Pesquisar', href: '#pesquisar', Icone: Search },
    { texto: 'Minha conta', href: '#perfil', Icone: User },
    { texto: 'Carrinho', href: '#carrinho', Icone: ShoppingBag },
]

export default function HeaderMenu() {
    const quantidadeCarrinho = 0

    return (
        <div className="max-w-6x1 mx-auto px-4 py-4 grid grid-cols-[1fr_auto_1fr] items-center justify-between">
            {/* Menu da esquerda */}
            <nav className="justify-self-start">
                <ul className="flex gap-8 font-inter">
                    {links.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className="hover:text-pink-400 transition-colors duration-300"
                            >
                                {link.texto}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Título */}
            <a href="#inicio" className="flex flex-col items-center gap-1">
                <span className="text-4xl font-bodoni hover:text-pink-400 transition-colors duration-500">Magnolia</span>
                <span className="text-xs font-inter uppercase tracking-[0.3em] text-green-600">Perfumaria botânica</span>
            </a>

            {/* Menu de botões da direita */}
            <nav className="justify-self-end">
                <ul className="flex items-center gap-8">
                    {buttons.map((button) => (
                        <li key={button.href}>
                            <a
                                href={button.href}
                                aria-label={button.texto}
                                title={button.texto}
                                className="flex items-center gap-2 hover:text-pink-400 transition-colors duration-300"
                            >
                                <button.Icone size={26} strokeWidth={1.5} />

                                {button.href === '#carrinho' && (
                                    <span className="text-lg font-inter">({quantidadeCarrinho})</span>
                                )}
                            </a>
                        </li>
                    ))}
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