import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useFavoritos } from "../../hooks/useFavoritos";

// variante "icone": coração redondo sobre a foto (cards)
// variante "completo": botão com texto (página do produto)
// "produto" precisa estar no formato resumido dos cards (ver utils/produto.js)
export default function BotaoFavorito({ produto, variante = "icone", className = "" }) {
  const { usuario } = useAuth();
  const { ehFavorito, alternarFavorito } = useFavoritos();
  const navigate = useNavigate();
  const [falhou, setFalhou] = useState(false);

  const favorito = usuario != null && ehFavorito(produto.id);

  useEffect(() => {
    if (!falhou) return;
    const temporizador = setTimeout(() => setFalhou(false), 3000);
    return () => clearTimeout(temporizador);
  }, [falhou]);

  async function aoClicar(evento) {
    evento.preventDefault();

    // Visitante vai para o login e volta para esta página depois de entrar.
    // window.location (e não o useLocation) porque o catálogo atualiza os filtros direto na URL.
    if (!usuario) {
      const { pathname, search, hash } = window.location;
      navigate("/login", {
        state: { de: { pathname, search, hash }, aviso: "Entre na sua conta para salvar seus perfumes favoritos." }
      });
      return;
    }

    setFalhou(false);
    try {
      await alternarFavorito(produto);
    } catch {
      setFalhou(true);
    }
  }

  const coracao = (
    <Heart
      className={`size-5 transition-colors ${favorito ? "fill-destaque text-destaque" : ""}`}
      strokeWidth={1.5}
    />
  );

  const aviso = falhou && (
    <span
      role="status"
      className="absolute right-0 top-full z-10 mt-2 w-max rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white"
    >
      Não foi possível salvar. Tente de novo.
    </span>
  );

  if (variante === "completo") {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={aoClicar}
          aria-pressed={favorito}
          className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium uppercase tracking-widest transition-colors ${
            favorito
              ? "border-destaque bg-destaque-clara text-stone-900"
              : "border-stone-300 text-stone-800 hover:border-marca hover:text-marca"
          }`}
        >
          {coracao}
          {favorito ? "Salvo nos favoritos" : "Salvar nos favoritos"}
        </button>
        {aviso}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={aoClicar}
        aria-pressed={favorito}
        aria-label={favorito ? `Remover ${produto.nome} dos favoritos` : `Salvar ${produto.nome} nos favoritos`}
        title={favorito ? "Remover dos favoritos" : "Salvar nos favoritos"}
        className={`relative flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 ${
          favorito ? "" : "text-stone-700 hover:text-destaque"
        }`}
      >
        {coracao}
        {aviso}
      </button>
    </div>
  );
}
