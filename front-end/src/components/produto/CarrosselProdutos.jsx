import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import GradeProdutos from "./GradeProdutos";
import ProductCard from "./ProductCard";

// Fileira de cards que rola para o lado: setas no computador, arrastar com o dedo no celular
export default function CarrosselProdutos({ produtos = [], carregando = false }) {
  const trilho = useRef(null);

  if (carregando && produtos.length === 0) {
    return <GradeProdutos carregando />;
  }

  // Anda quase uma "tela" do carrossel por clique
  function rolar(direcao) {
    const elemento = trilho.current;
    elemento?.scrollBy({ left: direcao * elemento.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="group/carrossel relative">
      <ul
        ref={trilho}
        className="sem-barra -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 sm:gap-6"
      >
        {produtos.map((produto) => (
          <li key={produto.id} className="w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]">
            <ProductCard produto={produto} />
          </li>
        ))}
      </ul>

      <BotaoSeta lado="esquerda" aoClicar={() => rolar(-1)} rotulo="Anteriores" Icone={ChevronLeft} />
      <BotaoSeta lado="direita" aoClicar={() => rolar(1)} rotulo="Próximos" Icone={ChevronRight} />
    </div>
  );
}

function BotaoSeta({ lado, aoClicar, rotulo, Icone }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={rotulo}
      className={`absolute top-[38%] z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-lg ring-1 ring-stone-200 backdrop-blur transition duration-300 hover:bg-marca hover:text-white sm:flex sm:opacity-0 sm:group-hover/carrossel:opacity-100 sm:focus-visible:opacity-100 ${
        lado === "esquerda" ? "-left-3 lg:-left-5" : "-right-3 lg:-right-5"
      }`}
    >
      <Icone className="size-5" />
    </button>
  );
}
