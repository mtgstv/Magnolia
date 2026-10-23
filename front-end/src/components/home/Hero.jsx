import magnolia from '../../assets/magnolia.jpg'
import Botao from '../ui/Botao'

export default function Hero() {
    return (
        // A seção tem no mínimo 75% da tela, mas cresce se o cartão precisar de mais espaço,
        // então o cartão nunca passa para fora da imagem.
        <section className="relative flex w-full min-h-[75vh] py-12">
            {/* Camada 1: a imagem, cobrindo a seção inteira */}
            <img
                src={magnolia}
                alt="Flores de magnólia"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Camada 2: o degradê (só visual, sem conteúdo dentro) */}
            <div className="absolute inset-y-0 left-0 w-2/3 bg-linear-to-r from-white from-25% to-transparent" />

            {/* Camada 3: o cartão, alinhado com o resto do site e esticado até a altura da seção */}
            <div className="conteudo relative flex">
                <div className="w-full max-w-lg 2xl:max-w-xl p-8 md:p-10 rounded-2xl bg-marca-clara shadow-lg flex flex-col gap-4 justify-center">
                    <span className="text-xs uppercase tracking-[0.3em] text-marca-media">
                        Nova coleção
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bodoni leading-tight">
                        A essência da natureza
                    </h1>
                    <p className="text-stone-600">
                        Fragrâncias botânicas criadas a partir de flores selecionadas.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <Botao to="/catalogo">Conheça</Botao>
                        <Botao to="/cadastro" variante="secundario">Criar conta</Botao>
                    </div>
                </div>
            </div>
        </section>
    )
}

/*
Esse cartão que fica na esquerda vai ter que ter animação de fade e slide da direita pra esquerda
Botões <> bolinha com fundo branco transparente para parecer com hover dando slide dos cantos da tela para mudar os cards
Carrossel de imagens
*/
