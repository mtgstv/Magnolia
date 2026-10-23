import magnolia from '../../assets/magnolia.jpg'

export default function Hero() {
    return (
        <div>
            <section className="relative w-full h-[75vh]">
                {/* Camada 1: a imagem */}
                <img
                    src={magnolia}
                    alt="Flores de magnólia"
                    className="w-full h-full object-cover"
                />

                {/* Camada 2: o degradê (só visual, sem conteúdo dentro) */}
                <div className="absolute inset-y-0 left-0 w-2/3 bg-linear-to-r from-white from-25% to-transparent" />

                {/* Camada 3: área do cartão, ocupando o 1/3 esquerdo da imagem */}
                <div className="absolute inset-y-0 left-0 w-1/3 flex items-center justify-center">

                    {/* O cartão */}
                    <div className="w-full h-160 p-8 ml-16 rounded-2xl bg-green-50 shadow-lg flex flex-col gap-4 justify-center">
                        <span className="text-xs font-inter uppercase tracking-[0.3em] text-green-700">
                            Nova coleção
                        </span>
                        <h2 className="text-4xl font-bodoni leading-tight">
                            A essência da natureza
                        </h2>
                        <p className="font-inter text-gray-600">
                            Fragrâncias botânicas criadas a partir de flores selecionadas.
                        </p>
                        <a
                            href="#catalogo"
                            className="self-start mt-2 px-6 py-3 rounded-full bg-green-800 text-white font-inter text-sm uppercase tracking-widest hover:bg-pink-400 transition-colors duration-300"
                        >
                            Conheça
                        </a>
                    </div>

                </div>
            </section >
        </div >
    )
}

/* 
Esse cartão que fica na esquerda vai ter que ter animação de fade e slide da direita pra esquerda
Botões <> bolinha com fundo branco transparente para parecer com hover dando slide dos cantos da tela para mudar os cards
Carrossel de imagens
Padronizar a paleta de cores com variáveis
*/