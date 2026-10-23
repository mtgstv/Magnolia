import { Link } from "react-router-dom";
import { Flower2 } from "lucide-react";

import Botao from "../ui/Botao";

// Convite para criar conta (só na home de visitante)
export default function ChamadaCadastro() {
  return (
    <section className="conteudo pt-14 md:pt-20">
      <div className="relative overflow-hidden rounded-3xl bg-marca px-8 py-14 text-white md:px-16 md:py-20">
        <Flower2
          className="absolute -bottom-16 -right-12 size-80 text-white/10"
          strokeWidth={0.6}
          aria-hidden="true"
        />

        <div className="relative max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-green-200">Sua lista de desejos</p>
          <h2 className="mt-3 font-bodoni text-3xl leading-tight md:text-5xl">
            Crie sua conta e guarde os perfumes que você amou
          </h2>
          <p className="mt-4 text-green-100">
            Salve favoritos, receba recomendações com base no seu gosto e encontre tudo num só lugar.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Botao to="/cadastro" variante="claro">
              Criar conta grátis
            </Botao>
            <Link to="/login" className="text-sm font-medium underline underline-offset-4 hover:text-destaque">
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
