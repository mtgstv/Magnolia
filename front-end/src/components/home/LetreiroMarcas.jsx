import { Link } from "react-router-dom";
import { Flower2 } from "lucide-react";

// Faixa com os nomes das marcas passando sem parar (para quando o mouse fica em cima).
// A lista aparece duas vezes seguidas: quando a primeira sai da tela, a segunda está
// no mesmo lugar, então a animação recomeça sem "pulo".
export default function LetreiroMarcas({ marcas }) {
  if (marcas.length === 0) return null;

  return (
    <section aria-label="Marcas" className="group/letreiro overflow-hidden border-y border-stone-200/80 bg-areia/60 py-6">
      <div className="flex w-max animate-letreiro group-hover/letreiro:[animation-play-state:paused]">
        {[0, 1].map((copia) => (
          <ul key={copia} className="flex shrink-0 items-center" aria-hidden={copia === 1 || undefined}>
            {marcas.map((marca) => (
              <li key={marca.id} className="flex items-center">
                <Link
                  to={`/catalogo?marca=${marca.slug}`}
                  tabIndex={copia === 1 ? -1 : undefined}
                  className="whitespace-nowrap px-8 font-bodoni text-2xl text-stone-500 transition-colors hover:text-marca"
                >
                  {marca.nome}
                </Link>
                <Flower2 className="size-4 text-destaque/60" strokeWidth={1.5} aria-hidden="true" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
