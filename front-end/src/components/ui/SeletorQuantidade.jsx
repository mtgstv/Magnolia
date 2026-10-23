import { Minus, Plus } from "lucide-react";

import { QUANTIDADE_MAXIMA } from "../../utils/carrinho";

// Botões de - e + com o número no meio. "tamanho": "normal" (página do produto) ou "pequeno" (carrinho).
// "maximo" (opcional): limite menor que o padrão, ex.: quando restam poucas unidades no estoque.
export default function SeletorQuantidade({ valor, aoMudar, rotulo = "Quantidade", tamanho = "normal", maximo = QUANTIDADE_MAXIMA }) {
  const altura = tamanho === "pequeno" ? "h-9" : "h-12";
  const largura = tamanho === "pequeno" ? "w-9" : "w-11";

  return (
    <div className={`inline-flex ${altura} items-center rounded-full border border-stone-300 bg-white`} role="group" aria-label={rotulo}>
      <button
        type="button"
        onClick={() => aoMudar(valor - 1)}
        disabled={valor <= 1}
        aria-label="Diminuir quantidade"
        className={`flex ${altura} ${largura} items-center justify-center rounded-full text-stone-600 transition hover:text-marca disabled:opacity-30`}
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold text-stone-900" aria-live="polite">
        {valor}
      </span>
      <button
        type="button"
        onClick={() => aoMudar(valor + 1)}
        disabled={valor >= Math.min(maximo, QUANTIDADE_MAXIMA)}
        aria-label="Aumentar quantidade"
        className={`flex ${altura} ${largura} items-center justify-center rounded-full text-stone-600 transition hover:text-marca disabled:opacity-30`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
