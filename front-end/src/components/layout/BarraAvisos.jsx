import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Gift, Percent, Sparkles, Tag, Truck } from 'lucide-react'

// Promoções de exemplo da faixa do topo. Para mudar, basta editar esta lista.
// "cupom" é opcional: quando existe, aparece num selinho dourado.
const PROMOCOES = [
    { icone: Gift, texto: '10% off na primeira compra com o cupom', cupom: 'BEMVINDA10', para: '/cadastro' },
    { icone: Truck, texto: 'Frete grátis para todo o Brasil em compras acima de R$ 299', para: '/catalogo' },
    { icone: Sparkles, texto: 'Semana Floral: até 30% off em perfumes florais', para: '/catalogo?familia=Floral' },
    { icone: Percent, texto: 'Pague no Pix e ganhe 5% de desconto extra', cupom: 'PIX5', para: '/catalogo' },
    { icone: Tag, texto: 'Leve 2 perfumes e ganhe uma miniatura de presente', para: '/catalogo?promocao=1' },
]

const TEMPO_POR_AVISO = 4500

// Faixa do topo: uma promoção por vez, cada uma "caindo" de cima e aparecendo aos poucos.
// Pausa com o mouse em cima, para dar tempo de ler.
export default function BarraAvisos() {
    const [indice, setIndice] = useState(0)
    const [pausado, setPausado] = useState(false)

    useEffect(() => {
        if (pausado) return

        const temporizador = setInterval(() => {
            setIndice((atual) => (atual + 1) % PROMOCOES.length)
        }, TEMPO_POR_AVISO)

        return () => clearInterval(temporizador)
    }, [pausado, indice])

    const irPara = (novo) => setIndice((novo + PROMOCOES.length) % PROMOCOES.length)
    const { icone: Icone, texto, cupom, para } = PROMOCOES[indice]

    return (
        <div
            // relative z-50: fica acima do header (z-40), então o header desliza por baixo da faixa
            className="relative z-50 bg-marca-escura text-white"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
        >
            <div className="conteudo flex h-10 items-center justify-between gap-3 text-xs sm:text-sm">
                <button type="button" onClick={() => irPara(indice - 1)} aria-label="Promoção anterior" className="text-white/70 transition hover:text-white">
                    <ChevronLeft className="size-4" />
                </button>

                <Link
                    key={indice}
                    to={para}
                    className="flex min-w-0 animate-aviso items-center gap-2 hover:underline hover:underline-offset-4"
                    aria-live="polite"
                >
                    <Icone className="size-4 shrink-0 text-dourado" strokeWidth={1.75} />
                    <span className="truncate">{texto}</span>
                    {cupom && (
                        <span className="shrink-0 rounded-md border border-dashed border-dourado/80 px-2 py-0.5 font-semibold tracking-wider text-dourado">
                            {cupom}
                        </span>
                    )}
                </Link>

                <button type="button" onClick={() => irPara(indice + 1)} aria-label="Próxima promoção" className="text-white/70 transition hover:text-white">
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    )
}
