import { NavLink } from "react-router-dom";
import { LayoutDashboard, Megaphone, Package } from "lucide-react";

const ABAS = [
  { para: "/admin", rotulo: "Perfumes", icone: Package, fim: true },
  { para: "/admin/promocoes", rotulo: "Promoções", icone: Megaphone }
];

// Moldura das páginas do painel: título e abas (Perfumes, Promoções)
export default function LayoutAdmin({ children }) {
  return (
    <main className="conteudo pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-marca-media">
            <LayoutDashboard className="size-4" strokeWidth={1.75} />
            Painel admin
          </p>
          <h1 className="mt-2 font-bodoni text-4xl text-stone-900 md:text-5xl">Gerenciar a loja</h1>
        </div>
        <nav aria-label="Seções do painel" className="flex gap-2 rounded-full bg-white p-1 ring-1 ring-stone-900/10">
          {ABAS.map(({ para, rotulo, icone: Icone, fim }) => (
            <NavLink
              key={para}
              to={para}
              end={fim}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-marca text-white" : "text-stone-600 hover:text-marca"
                }`
              }
            >
              <Icone className="size-4" strokeWidth={1.75} />
              {rotulo}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="mt-8">{children}</div>
    </main>
  );
}
