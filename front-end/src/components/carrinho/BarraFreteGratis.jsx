import { Truck } from "lucide-react";

import { FRETE_GRATIS_A_PARTIR_DE } from "../../utils/carrinho";
import { formatarPreco } from "../../utils/preco";

// Mostra quanto falta para o frete grátis, com uma barrinha que vai enchendo
export default function BarraFreteGratis({ subtotal, className = "" }) {
  const falta = Math.max(0, FRETE_GRATIS_A_PARTIR_DE - subtotal);
  const progresso = Math.min(100, (subtotal / FRETE_GRATIS_A_PARTIR_DE) * 100);

  return (
    <div className={className}>
      <p className="flex items-start gap-2 text-sm text-stone-700">
        <Truck className="mt-0.5 size-4 shrink-0 text-marca" strokeWidth={1.75} />
        {falta > 0 ? (
          <span>
            Faltam <strong className="text-stone-900">{formatarPreco(falta)}</strong> para o frete grátis
          </span>
        ) : (
          <span className="font-semibold text-marca">Oba! Seu frete é grátis</span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full rounded-full bg-marca transition-[width] duration-700 ease-out" style={{ width: `${progresso}%` }} />
      </div>
    </div>
  );
}
