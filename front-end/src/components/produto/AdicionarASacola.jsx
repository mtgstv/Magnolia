import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ShoppingBag } from "lucide-react";

import { useCarrinho } from "../../hooks/useCarrinho";
import SeletorQuantidade from "../ui/SeletorQuantidade";

const TEMPO_CONFIRMACAO = 4000;

// Quantidade + botão "Adicionar à sacola" da página do produto.
// "variante": o volume escolhido (do detalhe de GET /produtos/{slug}).
export default function AdicionarASacola({ variante }) {
  const { adicionar } = useCarrinho();
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  // A mensagem "Adicionado" some sozinha depois de alguns segundos
  useEffect(() => {
    if (!adicionado) return;
    const temporizador = setTimeout(() => setAdicionado(false), TEMPO_CONFIRMACAO);
    return () => clearTimeout(temporizador);
  }, [adicionado]);

  // A sacola fica na API: espera a resposta para confirmar (ou mostrar o motivo, ex.: esgotou)
  async function adicionarNaSacola() {
    setEnviando(true);
    setErro(null);
    try {
      await adicionar({ varianteId: variante.id }, quantidade);
      setQuantidade(1);
      setAdicionado(true);
    } catch (falha) {
      setAdicionado(false);
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <SeletorQuantidade valor={quantidade} aoMudar={setQuantidade} />
        <button
          type="button"
          onClick={adicionarNaSacola}
          disabled={!variante.emEstoque || enviando}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-marca px-8 text-sm font-semibold uppercase tracking-widest text-white transition-colors duration-300 hover:bg-marca-escura disabled:cursor-not-allowed disabled:bg-stone-300 sm:flex-none"
        >
          <ShoppingBag className="size-4" />
          {!variante.emEstoque ? "Esgotado" : enviando ? "Adicionando..." : "Adicionar à sacola"}
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
          {erro}
        </p>
      )}

      {adicionado && (
        <p
          role="status"
          className="mt-4 flex animate-surgir items-center gap-3 rounded-2xl bg-marca-clara px-4 py-3 text-sm text-marca-escura ring-1 ring-marca/15"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-marca text-white">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          Adicionado à sua sacola!
          <Link to="/carrinho" className="ml-auto font-semibold underline underline-offset-4 hover:text-destaque">
            Ver sacola
          </Link>
        </p>
      )}
    </div>
  );
}
