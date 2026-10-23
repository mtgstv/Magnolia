import { Citrus, Cookie, Droplets, Flame, Flower2, Leaf, TreePine } from "lucide-react";

// Ícone e descrição de cada família olfativa (usados na home e no menu do header).
// Uma família nova no banco aparece com FAMILIA_PADRAO.
export const FAMILIAS = {
  Floral: { icone: Flower2, descricao: "Rosas, jasmim e flores brancas" },
  Cítrico: { icone: Citrus, descricao: "Limão, bergamota e frescor" },
  Amadeirado: { icone: TreePine, descricao: "Sândalo, cedro e vetiver" },
  Oriental: { icone: Flame, descricao: "Especiarias, âmbar e baunilha" },
  Gourmand: { icone: Cookie, descricao: "Notas doces e envolventes" },
  Aromático: { icone: Leaf, descricao: "Ervas, lavanda e notas verdes" }
};

export const FAMILIA_PADRAO = { icone: Droplets, descricao: "" };

// Visual de cada coleção (categoria, pelo slug). Uma categoria nova usa COLECAO_PADRAO.
export const COLECOES = {
  feminino: { fundo: "from-pink-100 via-rose-50 to-white", detalhe: "text-pink-200", icone: Flower2 },
  masculino: { fundo: "from-green-100 via-stone-50 to-white", detalhe: "text-green-200", icone: TreePine },
  unissex: { fundo: "from-amber-100 via-orange-50 to-white", detalhe: "text-amber-200", icone: Droplets }
};

export const COLECAO_PADRAO = COLECOES.unissex;
