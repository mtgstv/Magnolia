import { useEffect, useState } from 'react'

// Para mudar os textos da faixa, basta editar esta lista
const AVISOS = [
    'Pague com Pix, cartão de crédito ou boleto',
    'Crie sua conta e salve seus perfumes favoritos',
    'Encontre seu perfume pela família olfativa',
]

const TEMPO_POR_AVISO = 5000

// Faixa do topo: um aviso por vez, cada um "caindo" de cima e aparecendo aos poucos.
// Pausa com o mouse em cima, para dar tempo de ler.
export default function BarraAvisos() {
    const [indice, setIndice] = useState(0)
    const [pausado, setPausado] = useState(false)

    useEffect(() => {
        if (pausado) return

        const temporizador = setInterval(() => {
            setIndice((atual) => (atual + 1) % AVISOS.length)
        }, TEMPO_POR_AVISO)

        return () => clearInterval(temporizador)
    }, [pausado])

    return (
        <div
            className="overflow-hidden bg-marca-suave px-6 py-2 text-center text-sm text-marca-escura"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
        >
            <p key={indice} className="animate-aviso motion-reduce:animate-none">
                {AVISOS[indice]}
            </p>
        </div>
    )
}
