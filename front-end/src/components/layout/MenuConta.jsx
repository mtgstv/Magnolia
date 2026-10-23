import { startTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LayoutDashboard, LogOut, Package, Sparkles, User } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { primeiroNome } from '../../utils/texto'
import { PainelCaixa } from './MenusHeader'

const classeIcone = 'size-[22px] md:size-[26px]'
const classeBotao = 'flex items-center gap-2 transition-colors duration-300 hover:text-destaque'
const classeItem = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-marca-clara'

// Visitante: link "Entrar" com menu para entrar ou criar conta.
// Logado: nome + menu com favoritos, pedidos (e o painel, para admin) e "Sair".
// "aberto"/"abrir"/"fechar" vêm do header, que controla todos os menus.
export default function MenuConta({ aberto, abrir, fechar }) {
    const { usuario, sair } = useAuth()
    const navigate = useNavigate()

    // Ir para a home e deslogar na mesma renderização: assim uma página privada
    // (ex.: favoritos) não manda a pessoa para o login, e a home de cliente não chega a abrir
    function encerrarSessao() {
        fechar()
        startTransition(() => {
            navigate('/')
            sair()
        })
    }

    if (!usuario) {
        return (
            <>
                <Link to="/login" title="Entrar" className={classeBotao}>
                    <User className={classeIcone} strokeWidth={1.5} />
                    <span className="sr-only text-sm font-medium xl:not-sr-only">Entrar</span>
                </Link>

                {aberto && (
                    <PainelCaixa className="w-72">
                        <p className="font-bodoni text-xl text-stone-900">Bem-vindo à Magnolia</p>
                        <p className="mt-1 text-sm text-stone-600">Entre para salvar favoritos e receber sugestões feitas para você.</p>
                        <Link to="/login" className="mt-4 flex justify-center rounded-full bg-marca py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-escura">
                            Entrar
                        </Link>
                        <Link to="/cadastro" className="mt-2 flex justify-center rounded-full border border-marca py-2.5 text-sm font-semibold text-marca transition-colors hover:bg-marca hover:text-white">
                            Criar conta grátis
                        </Link>
                        <p className="mt-4 flex items-center gap-2 text-xs text-stone-500">
                            <Sparkles className="size-3.5 text-dourado" />
                            Cupom BEMVINDA10 na primeira compra
                        </p>
                    </PainelCaixa>
                )}
            </>
        )
    }

    return (
        <>
            {/* No celular não existe "passar o mouse": o toque abre o menu */}
            <button
                type="button"
                onClick={abrir}
                aria-expanded={aberto}
                aria-haspopup="menu"
                title="Minha conta"
                className={classeBotao}
            >
                <User className={classeIcone} strokeWidth={1.5} />
                <span className="sr-only text-sm font-medium xl:not-sr-only">
                    Olá, {primeiroNome(usuario.nome)}
                </span>
            </button>

            {aberto && (
                <PainelCaixa className="w-64 p-2!">
                    <div role="menu">
                        <div className="border-b border-stone-100 px-3 pb-3 pt-2">
                            <p className="font-medium text-stone-900">{usuario.nome}</p>
                            <p className="truncate text-sm text-stone-500">{usuario.email}</p>
                        </div>

                        <Link to="/favoritos" role="menuitem" className={`mt-1 ${classeItem}`}>
                            <Heart className="size-4" strokeWidth={1.5} />
                            Meus favoritos
                        </Link>

                        <Link to="/pedidos" role="menuitem" className={classeItem}>
                            <Package className="size-4" strokeWidth={1.5} />
                            Meus pedidos
                        </Link>

                        {usuario.papel === 'ADMIN' && (
                            <Link to="/admin" role="menuitem" className={classeItem}>
                                <LayoutDashboard className="size-4" strokeWidth={1.5} />
                                Painel admin
                            </Link>
                        )}

                        <button type="button" role="menuitem" onClick={encerrarSessao} className={classeItem}>
                            <LogOut className="size-4" strokeWidth={1.5} />
                            Sair
                        </button>
                    </div>
                </PainelCaixa>
            )}
        </>
    )
}
