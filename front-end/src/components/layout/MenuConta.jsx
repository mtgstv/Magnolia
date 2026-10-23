import { startTransition, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogOut, User } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { primeiroNome } from '../../utils/texto'

const classeIcone = 'size-[22px] md:size-[26px]'

// Visitante: link "Entrar". Logado: nome + menu com favoritos e "Sair".
export default function MenuConta() {
    const { usuario, sair } = useAuth()
    const navigate = useNavigate()
    const [aberto, setAberto] = useState(false)
    const refMenu = useRef(null)

    // Fecha o menu ao clicar fora dele ou apertar Esc
    useEffect(() => {
        if (!aberto) return

        const fecharSeClicarFora = (evento) => {
            if (!refMenu.current?.contains(evento.target)) setAberto(false)
        }
        const fecharComEsc = (evento) => {
            if (evento.key === 'Escape') setAberto(false)
        }

        document.addEventListener('mousedown', fecharSeClicarFora)
        document.addEventListener('keydown', fecharComEsc)
        return () => {
            document.removeEventListener('mousedown', fecharSeClicarFora)
            document.removeEventListener('keydown', fecharComEsc)
        }
    }, [aberto])

    if (!usuario) {
        return (
            <Link
                to="/login"
                title="Entrar"
                className="flex items-center gap-2 transition-colors duration-300 hover:text-destaque"
            >
                <User className={classeIcone} strokeWidth={1.5} />
                <span className="sr-only text-sm font-medium xl:not-sr-only">Entrar</span>
            </Link>
        )
    }

    // Ir para a home e deslogar na mesma renderização: assim uma página privada
    // (ex.: favoritos) não manda a pessoa para o login, e a home de cliente não chega a abrir
    function encerrarSessao() {
        setAberto(false)
        startTransition(() => {
            navigate('/')
            sair()
        })
    }

    return (
        <div ref={refMenu} className="relative">
            <button
                type="button"
                onClick={() => setAberto((atual) => !atual)}
                aria-expanded={aberto}
                aria-haspopup="menu"
                title="Minha conta"
                className="flex items-center gap-2 transition-colors duration-300 hover:text-destaque"
            >
                <User className={classeIcone} strokeWidth={1.5} />
                <span className="sr-only text-sm font-medium xl:not-sr-only">
                    Olá, {primeiroNome(usuario.nome)}
                </span>
            </button>

            {aberto && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-30 mt-3 w-64 rounded-2xl border border-stone-200 bg-white p-2 text-left shadow-xl"
                >
                    <div className="border-b border-stone-100 px-3 pb-3 pt-2">
                        <p className="font-medium text-stone-900">{usuario.nome}</p>
                        <p className="truncate text-sm text-stone-500">{usuario.email}</p>
                    </div>

                    <Link
                        to="/favoritos"
                        role="menuitem"
                        onClick={() => setAberto(false)}
                        className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-marca-clara"
                    >
                        <Heart className="size-4" strokeWidth={1.5} />
                        Meus favoritos
                    </Link>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={encerrarSessao}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-marca-clara"
                    >
                        <LogOut className="size-4" strokeWidth={1.5} />
                        Sair
                    </button>
                </div>
            )}
        </div>
    )
}
