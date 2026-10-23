import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Trilha de navegação ("breadcrumb"): Início > Catálogo > ...
// O último item é a página atual e não tem link.
export default function Trilha({ itens }) {
  return (
    <nav aria-label="Você está em" className="text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {itens.map((item, indice) => {
          const ultimo = indice === itens.length - 1;

          return (
            <Fragment key={item.rotulo}>
              <li>
                {ultimo || !item.para ? (
                  <span aria-current={ultimo ? "page" : undefined} className={ultimo ? "text-stone-800" : ""}>
                    {item.rotulo}
                  </span>
                ) : (
                  <Link to={item.para} className="hover:text-marca">
                    {item.rotulo}
                  </Link>
                )}
              </li>
              {!ultimo && (
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
