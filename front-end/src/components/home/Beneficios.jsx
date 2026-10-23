import { CreditCard, Heart, Leaf, Sparkles } from "lucide-react";

const BENEFICIOS = [
  { icone: Sparkles, titulo: "Curadoria botânica", texto: "Fragrâncias escolhidas pelas notas naturais" },
  { icone: Leaf, titulo: "Busca por família", texto: "Floral, cítrico, amadeirado e muito mais" },
  { icone: Heart, titulo: "Lista de favoritos", texto: "Salve os perfumes que você amou" },
  { icone: CreditCard, titulo: "Pix, cartão ou boleto", texto: "Escolha como prefere pagar" }
];

export default function Beneficios() {
  return (
    <section aria-label="Por que comprar na Magnolia" className="border-b border-stone-200">
      <ul className="conteudo grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFICIOS.map(({ icone: Icone, titulo, texto }) => (
          <li key={titulo} className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-marca-clara text-marca">
              <Icone className="size-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-medium text-stone-900">{titulo}</p>
              <p className="text-sm text-stone-500">{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
