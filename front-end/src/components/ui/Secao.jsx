import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Revelar from "./Revelar";

// Cabeçalho padrão das seções: rótulo pequeno + título + link opcional à direita.
// scroll-mt-28: ao rolar até a seção (/#colecoes), o título não fica embaixo do header fixo.
export default function Secao({ id, rotulo, titulo, link, textoLink = "Ver todos", className = "", children }) {
  return (
    <section id={id} className={`conteudo scroll-mt-28 py-14 md:py-20 ${className}`}>
      <Revelar className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div>
          {rotulo && (
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-marca-media">
              <span className="h-px w-8 bg-marca-media/60" aria-hidden="true" />
              {rotulo}
            </p>
          )}
          <h2 className="mt-3 font-bodoni text-3xl text-stone-900 md:text-4xl">{titulo}</h2>
        </div>

        {link && (
          <Link
            to={link}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-marca transition-colors hover:text-destaque"
          >
            {textoLink}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </Revelar>

      <Revelar atraso={120}>{children}</Revelar>
    </section>
  );
}
