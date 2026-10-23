import { Link } from "react-router-dom";
import { FAMILIA_PADRAO, FAMILIAS } from "../../utils/familias";
import Secao from "../ui/Secao";

// "Encontre seu perfume": atalhos para o catálogo filtrado por família olfativa
export default function FamiliasOlfativas({ produtos }) {
  const totais = new Map();
  produtos.forEach((produto) => {
    if (produto.familiaOlfativa) {
      totais.set(produto.familiaOlfativa, (totais.get(produto.familiaOlfativa) ?? 0) + 1);
    }
  });

  // Antes de os produtos chegarem, mostra as famílias conhecidas (sem contagem)
  const nomes = totais.size > 0 ? [...totais.keys()].sort((a, b) => totais.get(b) - totais.get(a)) : Object.keys(FAMILIAS);

  return (
    <div className="bg-marca-clara">
      <Secao id="familias" rotulo="Encontre seu perfume" titulo="Escolha pela família olfativa">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {nomes.map((nome) => {
            const { icone: Icone, descricao } = FAMILIAS[nome] ?? FAMILIA_PADRAO;
            const total = totais.get(nome);

            return (
              <li key={nome}>
                <Link
                  to={`/catalogo?familia=${encodeURIComponent(nome)}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-destaque-clara text-destaque transition-colors group-hover:bg-destaque group-hover:text-white">
                    <Icone className="size-5" strokeWidth={1.5} />
                  </span>
                  <span className="font-bodoni text-xl text-stone-900">{nome}</span>
                  {descricao && <span className="text-sm text-stone-500">{descricao}</span>}
                  {total && (
                    <span className="mt-auto text-xs font-medium text-marca">
                      {total} {total === 1 ? "perfume" : "perfumes"}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </Secao>
    </div>
  );
}
