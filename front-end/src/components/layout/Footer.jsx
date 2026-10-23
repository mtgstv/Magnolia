import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const LINKS_LOJA = [
  { texto: "Catálogo completo", para: "/catalogo" },
  { texto: "Novidades", para: "/catalogo?ordenacao=novidades" },
  { texto: "Ofertas", para: "/catalogo?promocao=1" },
  { texto: "Coleções", para: "/#colecoes" },
  { texto: "Famílias olfativas", para: "/#familias" }
];

const FORMAS_DE_PAGAMENTO = ["Pix", "Cartão de crédito", "Boleto"];

export default function Footer() {
  const { usuario } = useAuth();
  const ano = new Date().getFullYear();

  const linksConta = usuario
    ? [{ texto: "Meus favoritos", para: "/favoritos" }]
    : [
        { texto: "Entrar", para: "/login" },
        { texto: "Criar conta", para: "/cadastro" },
        { texto: "Meus favoritos", para: "/favoritos" }
      ];

  return (
    <footer className="mt-20 bg-marca-escura text-green-50">
      <div className="conteudo grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex flex-col gap-1">
            <span className="font-bodoni text-4xl text-white">Magnolia</span>
            <span className="text-xs uppercase tracking-[0.3em] text-green-200">Perfumaria botânica</span>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-green-100/80">
            Fragrâncias escolhidas pelas suas notas naturais: flores, folhas, madeiras e frutas que
            contam histórias na pele.
          </p>
        </div>

        <ColunaLinks titulo="Loja" links={LINKS_LOJA} />
        <ColunaLinks titulo="Sua conta" links={linksConta} />

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-green-200">Pagamento</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {FORMAS_DE_PAGAMENTO.map((forma) => (
              <li key={forma} className="rounded-full border border-white/20 px-3 py-1 text-sm text-green-50">
                {forma}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="conteudo flex flex-col gap-2 py-6 text-xs text-green-100/70 sm:flex-row sm:justify-between">
          <p>© {ano} Magnolia Perfumaria Botânica. Todos os direitos reservados.</p>
          <p>Projeto acadêmico · Maturidade de Software</p>
        </div>
      </div>
    </footer>
  );
}

function ColunaLinks({ titulo, links }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-green-200">{titulo}</h2>
      <ul className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.texto}>
            <Link to={link.para} className="text-sm text-green-50 transition-colors hover:text-destaque">
              {link.texto}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
