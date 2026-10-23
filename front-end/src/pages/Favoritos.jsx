import { Heart } from "lucide-react";

import GradeProdutos from "../components/produto/GradeProdutos";
import Botao from "../components/ui/Botao";
import EstadoVazio from "../components/ui/EstadoVazio";
import Trilha from "../components/ui/Trilha";
import { useFavoritos } from "../hooks/useFavoritos";

// Só para quem está logado (ver RotaPrivada em routes/)
export default function Favoritos() {
  const { favoritos, carregando } = useFavoritos();

  return (
    <main className="conteudo pt-8">
      <Trilha itens={[{ rotulo: "Início", para: "/" }, { rotulo: "Meus favoritos" }]} />

      <header className="mt-10">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-marca-media">Sua seleção</p>
        <h1 className="mt-2 font-bodoni text-4xl text-stone-900 md:text-5xl">Meus favoritos</h1>
        {!carregando && favoritos.length > 0 && (
          <p className="mt-3 text-stone-500">
            {favoritos.length} {favoritos.length === 1 ? "perfume salvo" : "perfumes salvos"}
          </p>
        )}
      </header>

      <div className="mt-10">
        {!carregando && favoritos.length === 0 ? (
          <EstadoVazio
            icone={Heart}
            titulo="Você ainda não salvou nenhum perfume"
            texto="Toque no coração de um perfume no catálogo para guardá-lo aqui."
          >
            <Botao to="/catalogo">Explorar catálogo</Botao>
          </EstadoVazio>
        ) : (
          <GradeProdutos
            produtos={favoritos}
            carregando={carregando}
            className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          />
        )}
      </div>
    </main>
  );
}
