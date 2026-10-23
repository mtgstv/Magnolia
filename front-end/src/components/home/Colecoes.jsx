import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { COLECAO_PADRAO, COLECOES } from "../../utils/familias";
import Secao from "../ui/Secao";

export default function Colecoes({ categorias, produtos, carregando }) {
  return (
    <Secao id="colecoes" rotulo="Coleções" titulo="Para cada estilo, uma fragrância">
      <div className="grid gap-5 md:grid-cols-3">
        {carregando
          ? [1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-areia" />)
          : categorias.map((categoria) => {
              const estilo = COLECOES[categoria.slug] ?? COLECAO_PADRAO;
              const Icone = estilo.icone;
              const total = produtos.filter((produto) => produto.categoriaSlug === categoria.slug).length;

              return (
                <Link
                  key={categoria.id}
                  to={`/catalogo?categoria=${categoria.slug}`}
                  className={`group relative flex h-64 flex-col justify-end overflow-hidden rounded-3xl bg-linear-to-br p-8 ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${estilo.fundo}`}
                >
                  <Icone
                    className={`absolute -right-8 -top-8 size-48 transition-transform duration-500 group-hover:rotate-12 ${estilo.detalhe}`}
                    strokeWidth={0.75}
                    aria-hidden="true"
                  />
                  <p className="relative text-sm text-stone-600">
                    {total} {total === 1 ? "perfume" : "perfumes"}
                  </p>
                  <h3 className="relative font-bodoni text-4xl text-stone-900">{categoria.nome}</h3>
                  <span className="relative mt-3 inline-flex items-center gap-2 text-sm font-medium text-marca">
                    Explorar
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
      </div>
    </Secao>
  );
}
