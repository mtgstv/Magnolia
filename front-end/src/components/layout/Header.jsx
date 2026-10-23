import { useCallback, useEffect, useRef, useState } from 'react'

import { useHeaderFlutuante } from '../../hooks/useHeaderFlutuante'
import HeaderMenu from './HeaderMenu'

// Tempo entre o mouse sair de um botão e o menu fechar (dá tempo de chegar até o menu)
const ATRASO_FECHAR = 180

// O header acompanha a rolagem (sticky). Ao rolar ele fica transparente com um leve desfoque,
// depois de um tempinho se esconde e volta quando o mouse chega perto do topo.
export default function Header() {
    // Qual menu suspenso está aberto (null = nenhum)
    const [menuAberto, setMenuAberto] = useState(null)
    const temporizador = useRef(null)
    const { refHeader, rolou, escondido } = useHeaderFlutuante(menuAberto !== null)

    const abrirMenu = useCallback((id) => {
        clearTimeout(temporizador.current)
        setMenuAberto(id)
    }, [])

    const fecharMenu = useCallback((imediato = false) => {
        clearTimeout(temporizador.current)
        if (imediato) {
            setMenuAberto(null)
        } else {
            temporizador.current = setTimeout(() => setMenuAberto(null), ATRASO_FECHAR)
        }
    }, [])

    // No celular o menu abre com toque: fecha ao tocar fora do header
    useEffect(() => {
        if (menuAberto === null) return

        const fecharSeTocarFora = (evento) => {
            if (!refHeader.current?.contains(evento.target)) fecharMenu(true)
        }
        document.addEventListener('pointerdown', fecharSeTocarFora)
        return () => document.removeEventListener('pointerdown', fecharSeTocarFora)
    }, [menuAberto, refHeader, fecharMenu])

    const transparente = rolou && menuAberto === null

    return (
        <header
            ref={refHeader}
            className={`sticky top-0 z-40 text-stone-900 transition-[translate,background-color,box-shadow,border-color] duration-500 ease-out focus-within:translate-y-0 ${
                transparente
                    ? 'border-b border-white/40 bg-fundo/70 shadow-lg shadow-stone-900/5 backdrop-blur-md'
                    : 'border-b border-stone-200/80 bg-fundo'
            } ${escondido ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <HeaderMenu menuAberto={menuAberto} abrirMenu={abrirMenu} fecharMenu={fecharMenu} />
        </header>
    )
}
