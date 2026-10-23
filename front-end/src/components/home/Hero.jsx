import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import magnolia from '../../assets/magnolia.jpg'
import Botao from '../ui/Botao'

// Cada slide do carrossel do topo. Para trocar textos ou fotos, basta editar esta lista.
// "foco" diz qual parte da foto deve aparecer (a parte da esquerda fica coberta pelo degradê).
const SLIDES = [
    {
        imagem: magnolia,
        foco: 'object-[70%_center]',
        rotulo: 'Nova coleção',
        titulo: 'A essência da natureza',
        texto: 'Fragrâncias botânicas criadas a partir de flores selecionadas.',
        botao: { texto: 'Conheça', para: '/catalogo' },
    },
    {
        imagem: '/images/promocoes/semana-floral.jpg',
        foco: 'object-[75%_center]',
        rotulo: 'Semana floral',
        titulo: 'Flores que ficam na pele',
        texto: 'Rosas, jasmim e flores brancas com até 30% de desconto.',
        botao: { texto: 'Ver florais', para: '/catalogo?familia=Floral' },
    },
    {
        imagem: '/images/promocoes/novidades.jpg',
        foco: 'object-[80%_center]',
        rotulo: 'Acabaram de chegar',
        titulo: 'Novidades da estação',
        texto: 'Conheça os lançamentos que acabaram de entrar no nosso catálogo.',
        botao: { texto: 'Ver novidades', para: '/catalogo?ordenacao=novidades' },
    },
]

const TEMPO_POR_SLIDE = 7000

export default function Hero() {
    const [indice, setIndice] = useState(0)
    const [pausado, setPausado] = useState(false)

    useEffect(() => {
        if (pausado) return

        const temporizador = setInterval(() => {
            setIndice((atual) => (atual + 1) % SLIDES.length)
        }, TEMPO_POR_SLIDE)

        return () => clearInterval(temporizador)
    }, [pausado, indice])

    const irPara = (novo) => setIndice((novo + SLIDES.length) % SLIDES.length)
    const slide = SLIDES[indice]

    return (
        // A seção tem no mínimo 75% da tela, mas cresce se o cartão precisar de mais espaço,
        // então o cartão nunca passa para fora da imagem.
        <section
            className="relative flex min-h-[78vh] w-full overflow-hidden py-6 md:py-8"
            aria-roledescription="carrossel"
            aria-label="Destaques"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
        >
            {/* Camada 1: as fotos, uma em cima da outra; só a atual fica visível */}
            {SLIDES.map((item, posicao) => (
                <img
                    key={item.titulo}
                    src={item.imagem}
                    alt=""
                    className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${item.foco} ${
                        posicao === indice ? 'animate-zoom-lento opacity-100' : 'opacity-0'
                    }`}
                />
            ))}

            {/* Camada 2: o degradê. Fica sólido na esquerda, onde está o cartão, e some antes da foto */}
            <div className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-fundo from-20% via-fundo/80 via-40% to-transparent to-65% md:w-2/3 md:from-40% md:via-55% md:to-95%" />

            {/* Camada 3: o cartão, colado na esquerda da tela (não no centro do site)
                e com a altura do hero, sem sair dele */}
            <div className="relative flex w-full px-4 pb-10 sm:px-6 md:pb-0 lg:px-8 xl:px-12">
                <div
                    key={indice}
                    className="flex w-full max-w-md animate-deslizar flex-col justify-center gap-5 rounded-3xl border border-marca-suave bg-marca-clara/85 p-8 shadow-xl shadow-marca-escura/10 backdrop-blur-sm md:p-10 xl:max-w-lg"
                    aria-live="polite"
                >
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-marca-media">
                        {slide.rotulo}
                    </span>
                    <h1 className="font-bodoni text-4xl leading-tight text-stone-900 md:text-5xl">
                        {slide.titulo}
                    </h1>
                    <p className="text-stone-700">{slide.texto}</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <Botao to={slide.botao.para}>{slide.botao.texto}</Botao>
                        <Botao to="/cadastro" variante="secundario">Criar conta</Botao>
                    </div>
                </div>
            </div>

            {/* Setas: no canto de baixo, longe do cartão */}
            <div className="absolute bottom-4 right-6 z-10 hidden gap-2 md:flex lg:right-10">
                <BotaoSeta aoClicar={() => irPara(indice - 1)} rotulo="Destaque anterior" Icone={ChevronLeft} />
                <BotaoSeta aoClicar={() => irPara(indice + 1)} rotulo="Próximo destaque" Icone={ChevronRight} />
            </div>

            {/* Bolinhas: mostram em qual slide estamos */}
            <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
                {SLIDES.map((item, posicao) => (
                    <button
                        key={item.titulo}
                        type="button"
                        onClick={() => irPara(posicao)}
                        aria-label={`Ir para o destaque ${posicao + 1}`}
                        aria-current={posicao === indice ? 'true' : undefined}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            posicao === indice ? 'w-10 bg-marca' : 'w-5 bg-white/80 hover:bg-white'
                        }`}
                    />
                ))}
            </div>
        </section>
    )
}

function BotaoSeta({ aoClicar, rotulo, Icone }) {
    return (
        <button
            type="button"
            onClick={aoClicar}
            aria-label={rotulo}
            className="flex size-11 items-center justify-center rounded-full bg-white/70 text-stone-800 shadow-md backdrop-blur transition duration-300 hover:scale-105 hover:bg-white"
        >
            <Icone className="size-5" />
        </button>
    )
}
