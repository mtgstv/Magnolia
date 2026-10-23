import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Cabeçalho padrão das seções: rótulo pequeno + título + link opcional à direita
export default function Secao({ id, rotulo, titulo, link, textoLink = "Ver todos", className = "", children }) {
  return (
    <section id={id} className={`conteudo scroll-mt-6 py-14 md:py-20 ${className}`}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div>
          {rotulo && (
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-marca-media">{rotulo}</p>
          )}
          <h2 className="mt-2 font-bodoni text-3xl text-stone-900 md:text-4xl">{titulo}</h2>
        </div>

        {link && (
          <Link
            to={link}
            className="group inline-flex items-center gap-2 text-sm font-medium text-marca transition-colors hover:text-destaque"
          >
            {textoLink}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}
