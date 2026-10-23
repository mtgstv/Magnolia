import { useEffect } from "react";
import { X } from "lucide-react";

import Botao from "../ui/Botao";

// Painel lateral com os filtros, usado em telas menores que lg.
// aoFechar precisa ser estável (useCallback).
export default function GavetaFiltros({ aberta, aoFechar, aoLimpar, totalResultados, children }) {
  useEffect(() => {
    if (!aberta) return;

    const fecharComEsc = (evento) => {
      if (evento.key === "Escape") aoFechar();
    };

    // Trava a rolagem da página enquanto a gaveta está aberta
    document.addEventListener("keydown", fecharComEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", fecharComEsc);
      document.body.style.overflow = "";
    };
  }, [aberta, aoFechar]);

  if (!aberta) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
      <div className="absolute inset-0 bg-stone-900/40" onClick={aoFechar} />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="font-bodoni text-2xl">Filtros</h2>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar filtros"
            className="flex size-10 items-center justify-center rounded-full hover:bg-stone-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        <div className="flex gap-3 border-t border-stone-200 px-6 py-4">
          <Botao variante="secundario" onClick={aoLimpar}>
            Limpar
          </Botao>
          <Botao className="flex-1" onClick={aoFechar}>
            Ver {totalResultados} {totalResultados === 1 ? "perfume" : "perfumes"}
          </Botao>
        </div>
      </div>
    </div>
  );
}
