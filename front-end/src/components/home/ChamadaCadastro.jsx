import { Link } from "react-router-dom";
import { Gift, Heart, Sparkles } from "lucide-react";

import Botao from "../ui/Botao";
import Revelar from "../ui/Revelar";

// O que a pessoa ganha ao criar a conta
const VANTAGENS = [
  { icone: Heart, titulo: "Lista de favoritos", texto: "Salve os perfumes que você amou e volte quando quiser." },
  { icone: Sparkles, titulo: "Sugestões para você", texto: "Recomendações com base no seu gosto." },
  { icone: Gift, titulo: "10% na primeira compra", texto: "Use o cupom de boas-vindas no pagamento." }
];

// Convite para criar conta (só na home de visitante): texto à esquerda e foto à direita
export default function ChamadaCadastro() {
  return (
    <section className="conteudo pt-14 md:pt-20">
      <Revelar className="grid overflow-hidden rounded-3xl bg-marca-escura text-white shadow-2xl shadow-marca-escura/20 lg:grid-cols-[1.1fr_1fr]">
        {/* Lado do texto */}
        <div className="relative px-8 py-12 sm:px-12 md:py-16 lg:px-16">
          {/* Pontilhado bem discreto no fundo verde */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]"
            aria-hidden="true"
          />

          <div className="relative">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-dourado">
              <span className="h-px w-8 bg-dourado/70" aria-hidden="true" />
              Clube Magnolia
            </p>
            <h2 className="mt-4 font-bodoni text-3xl leading-tight md:text-5xl">
              Sua coleção de perfumes, sempre com você
            </h2>
            <p className="mt-4 max-w-lg text-green-100/85">
              Crie sua conta grátis em menos de um minuto e aproveite benefícios feitos para quem ama perfumes.
            </p>

            <ul className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {VANTAGENS.map(({ icone: Icone, titulo, texto }) => (
                <li key={titulo} className="flex gap-3 xl:flex-col">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-dourado ring-1 ring-white/15">
                    <Icone className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{titulo}</p>
                    <p className="mt-0.5 text-sm text-green-100/70">{texto}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Botao to="/cadastro" variante="claro">
                Criar conta grátis
              </Botao>
              <Link to="/login" className="text-sm font-medium text-green-100 underline underline-offset-4 transition-colors hover:text-destaque">
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>

        {/* Lado da foto */}
        <div className="group relative min-h-72 overflow-hidden lg:min-h-full">
          <img
            src="/images/home/cadastro.jpg"
            alt="Frasco de perfume com rosas cor-de-rosa ao fundo"
            loading="lazy"
            className="absolute inset-0 size-full object-cover object-[center_60%] transition-transform duration-[1500ms] group-hover:scale-105"
          />
          {/* Junta a foto com o verde do lado do texto */}
          <div className="absolute inset-0 bg-linear-to-t from-marca-escura/70 via-transparent to-transparent lg:bg-linear-to-r lg:from-marca-escura lg:via-marca-escura/10 lg:to-transparent lg:via-30%" />

          {/* Cupom flutuando sobre a foto */}
          <div className="absolute bottom-6 right-6 rounded-2xl border border-white/30 bg-white/15 px-5 py-4 text-white shadow-xl backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">Cupom de boas-vindas</p>
            <p className="mt-1 font-bodoni text-2xl">10% off</p>
            <p className="mt-2 w-fit rounded-md border border-dashed border-dourado px-2 py-0.5 text-sm font-semibold tracking-wider text-dourado">
              BEMVINDA10
            </p>
          </div>
        </div>
      </Revelar>
    </section>
  );
}
