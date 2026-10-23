import { Link, useLocation } from "react-router-dom";
import { Check, Gift, Lock } from "lucide-react";

import FlorMagnolia from "../ui/FlorMagnolia";

// Foto e textos do lado esquerdo de cada tela
const VARIANTES = {
  entrar: {
    foto: "/images/conta/entrar.jpg",
    foco: "object-[70%_center]",
    rotulo: "Bem-vindo de volta",
    frase: "“Cada perfume guarda uma memória.”",
    vantagens: ["Seus favoritos te esperando", "Sugestões feitas para o seu gosto", "Novidades e ofertas em primeira mão"]
  },
  cadastro: {
    foto: "/images/conta/cadastro.jpg",
    foco: "object-center",
    rotulo: "Clube Magnolia",
    frase: "“Encontre a fragrância que conta a sua história.”",
    vantagens: ["Lista de favoritos para salvar o que você amou", "Recomendações com base no seu gosto", "10% off na primeira compra"]
  }
};

const ABAS = [
  { id: "entrar", texto: "Entrar", para: "/login" },
  { id: "cadastro", texto: "Criar conta", para: "/cadastro" }
];

// Moldura das telas de login e cadastro: foto com textos à esquerda e formulário à direita.
// No celular a foto vira uma faixa menor em cima do formulário.
export default function LayoutAutenticacao({ variante = "entrar", titulo, subtitulo, children }) {
  const location = useLocation();
  const { foto, foco, rotulo, frase, vantagens } = VARIANTES[variante];

  return (
    <main className="py-10 md:py-16">
      <div className="conteudo">
        <div className="mx-auto grid max-w-6xl animate-surgir overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-stone-900/10 ring-1 ring-stone-900/5 lg:grid-cols-[1.05fr_1fr]">
          {/* Lado da foto */}
          <div className="group/titulo relative flex min-h-56 flex-col justify-between overflow-hidden p-8 text-white sm:p-10 lg:min-h-[680px]">
            <img
              src={foto}
              alt=""
              className={`absolute inset-0 size-full animate-zoom-lento object-cover ${foco}`}
            />
            <div className="absolute inset-0 bg-linear-to-t from-marca-escura/95 via-marca-escura/45 to-marca-escura/10" />

            <Link to="/" className="relative w-fit">
              <span className="relative font-bodoni text-3xl">
                Magn
                <span className="relative">
                  o
                  <FlorMagnolia className="absolute left-1/2 top-[0.7em] w-[0.62em] -translate-x-1/2 -translate-y-full origin-bottom transition-[rotate] duration-500 group-hover/titulo:rotate-[10deg]" />
                </span>
                lia
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.3em] text-green-100/80">Perfumaria botânica</span>
            </Link>

            <div className="relative mt-10">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-dourado">
                <span className="h-px w-8 bg-dourado/70" aria-hidden="true" />
                {rotulo}
              </p>
              <p className="mt-4 max-w-md font-bodoni text-3xl leading-snug md:text-4xl">{frase}</p>

              <ul className="mt-8 hidden flex-col gap-3 lg:flex">
                {vantagens.map((vantagem) => (
                  <li key={vantagem} className="flex items-center gap-3 text-sm text-green-50/90">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                    {vantagem}
                  </li>
                ))}
              </ul>

              {variante === "cadastro" && (
                <p className="mt-8 hidden w-fit items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm backdrop-blur-md lg:flex">
                  <Gift className="size-5 text-dourado" strokeWidth={1.75} />
                  Cupom de boas-vindas
                  <span className="rounded-md border border-dashed border-dourado px-2 py-0.5 font-semibold tracking-wider text-dourado">
                    BEMVINDA10
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Lado do formulário */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 lg:py-14">
            {/* Troca entre entrar e criar conta (leva junto o "de onde veio", para voltar depois) */}
            <nav aria-label="Entrar ou criar conta" className="grid grid-cols-2 rounded-full bg-areia/70 p-1 text-sm font-semibold">
              {ABAS.map((aba) => (
                <Link
                  key={aba.id}
                  to={aba.para}
                  state={location.state}
                  aria-current={aba.id === variante ? "page" : undefined}
                  className={`rounded-full py-2.5 text-center transition-colors duration-300 ${
                    aba.id === variante ? "bg-white text-marca shadow-sm" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {aba.texto}
                </Link>
              ))}
            </nav>

            <h1 className="mt-10 font-bodoni text-4xl text-stone-900">{titulo}</h1>
            {subtitulo && <p className="mt-2 text-stone-500">{subtitulo}</p>}

            <div className="mt-8">{children}</div>

            <p className="mt-10 flex items-center justify-center gap-2 border-t border-stone-100 pt-6 text-xs text-stone-500">
              <Lock className="size-3.5" strokeWidth={2} />
              Seus dados ficam protegidos e nunca são compartilhados.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
