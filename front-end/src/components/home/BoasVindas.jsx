import { Heart } from "lucide-react";

import magnolia from "../../assets/magnolia.jpg";
import { primeiroNome } from "../../utils/texto";
import Botao from "../ui/Botao";

// Topo da home de quem está logado (no lugar do Hero de visitante)
export default function BoasVindas({ usuario, totalFavoritos }) {
  return (
    <section className="relative overflow-hidden">
      <img src={magnolia} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-r from-white via-white/90 to-white/10" />

      <div className="conteudo relative py-16 md:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-marca-media">Sua Magnolia</p>
        <h1 className="mt-3 font-bodoni text-4xl text-stone-900 md:text-6xl">
          Olá, {primeiroNome(usuario.nome)}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-stone-600">
          {totalFavoritos > 0
            ? "Que bom ter você de volta. Separamos sugestões com base nos perfumes que você salvou."
            : "Que bom ter você aqui. Toque no coração dos perfumes para montar sua lista e receber sugestões."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Botao to="/favoritos">
            <Heart className="size-4" strokeWidth={1.5} />
            Meus favoritos ({totalFavoritos})
          </Botao>
          <Botao to="/catalogo" variante="secundario">
            Explorar catálogo
          </Botao>
        </div>
      </div>
    </section>
  );
}
