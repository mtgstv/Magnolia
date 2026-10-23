import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BadgeCheck, MessageSquare, Star, Trash2 } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { removerAvaliacaoAdmin } from "../../services/adminService";
import { removerAvaliacao, salvarAvaliacao } from "../../services/avaliacoesService";
import Botao from "../ui/Botao";
import EstadoVazio from "../ui/EstadoVazio";
import MensagemErro from "../ui/MensagemErro";

// Cinco estrelas, preenchidas até a nota (arredondada)
export function Estrelas({ nota, className = "size-4" }) {
  const cheias = Math.round(nota);
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${nota.toLocaleString("pt-BR")} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${className} ${n <= cheias ? "fill-dourado text-dourado" : "text-stone-300"}`} strokeWidth={1.5} />
      ))}
    </span>
  );
}

// Seção de avaliações da página do produto.
// "avaliacoes": resultado de useCarregar(listarAvaliacoes) feito na página (que também mostra a média no topo).
export default function Avaliacoes({ slug, avaliacoes }) {
  const { usuario } = useAuth();
  const dados = avaliacoes.dados;

  if (avaliacoes.erro) {
    return <MensagemErro erro={avaliacoes.erro} aoTentarDeNovo={avaliacoes.recarregar} />;
  }
  if (!dados) {
    return <div className="h-40 animate-pulse rounded-3xl bg-areia" aria-busy="true" />;
  }

  const minha = dados.avaliacoes.find((avaliacao) => avaliacao.minha);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5">
          {dados.total === 0 ? (
            <p className="text-stone-600">Ainda não há avaliações. Seja a primeira pessoa a contar o que achou!</p>
          ) : (
            <>
              <p className="flex items-baseline gap-2">
                <span className="font-bodoni text-5xl text-stone-900">{dados.media.toLocaleString("pt-BR")}</span>
                <span className="text-stone-500">de 5</span>
              </p>
              <Estrelas nota={dados.media} className="size-5" />
              <p className="mt-1 text-sm text-stone-500">
                {dados.total} {dados.total === 1 ? "avaliação" : "avaliações"}
              </p>
              <ul className="mt-5 flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((nota) => {
                  const quantidade = dados.distribuicao[nota] ?? 0;
                  return (
                    <li key={nota} className="flex items-center gap-3 text-sm text-stone-600">
                      <span className="w-3">{nota}</span>
                      <Star className="size-3.5 fill-dourado text-dourado" />
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                        <span className="block h-full rounded-full bg-dourado" style={{ width: `${(quantidade / dados.total) * 100}%` }} />
                      </span>
                      <span className="w-6 text-right">{quantidade}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {usuario ? (
          <FormularioAvaliacao key={minha?.id ?? "nova"} slug={slug} minha={minha} aoSalvar={avaliacoes.recarregar} />
        ) : (
          <ConvidarParaEntrar />
        )}
      </div>

      {dados.total === 0 ? (
        <EstadoVazio icone={MessageSquare} titulo="Sem avaliações por enquanto" texto="As opiniões de quem comprou aparecem aqui." />
      ) : (
        <ul className="flex flex-col divide-y divide-stone-200">
          {dados.avaliacoes.map((avaliacao) => (
            <ItemAvaliacao key={avaliacao.id} avaliacao={avaliacao} admin={usuario?.papel === "ADMIN"} aoRemover={avaliacoes.recarregar} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ConvidarParaEntrar() {
  const location = useLocation();
  return (
    <p className="rounded-2xl bg-marca-clara px-5 py-4 text-sm text-marca-escura ring-1 ring-marca/15">
      <Link to="/login" state={{ de: location, aviso: "Entre na sua conta para avaliar este perfume." }}
        className="font-semibold underline underline-offset-4">
        Entre na sua conta
      </Link>{" "}
      para avaliar este perfume.
    </p>
  );
}

function ItemAvaliacao({ avaliacao, admin, aoRemover }) {
  async function remover() {
    if (!window.confirm("Apagar esta avaliação?")) return;
    await removerAvaliacaoAdmin(avaliacao.id).catch(() => null);
    aoRemover();
  }

  return (
    <li className="py-6 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Estrelas nota={avaliacao.nota} />
        {avaliacao.titulo && <p className="font-medium text-stone-900">{avaliacao.titulo}</p>}
        {admin && (
          <button type="button" onClick={remover} title="Apagar avaliação (admin)"
            className="ml-auto flex size-8 items-center justify-center rounded-full text-stone-400 hover:bg-rose-50 hover:text-oferta">
            <Trash2 className="size-4" />
            <span className="sr-only">Apagar avaliação</span>
          </button>
        )}
      </div>
      {avaliacao.comentario && <p className="mt-2 whitespace-pre-line leading-relaxed text-stone-700">{avaliacao.comentario}</p>}
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
        <span className="font-medium text-stone-700">{avaliacao.autor}{avaliacao.minha && " (você)"}</span>
        <span>{new Date(avaliacao.criadoEm).toLocaleDateString("pt-BR")}</span>
        {avaliacao.compraVerificada && (
          <span className="inline-flex items-center gap-1 font-medium text-marca">
            <BadgeCheck className="size-3.5" />
            Compra verificada
          </span>
        )}
      </p>
    </li>
  );
}

function FormularioAvaliacao({ slug, minha, aoSalvar }) {
  const [nota, setNota] = useState(minha?.nota ?? 0);
  const [titulo, setTitulo] = useState(minha?.titulo ?? "");
  const [comentario, setComentario] = useState(minha?.comentario ?? "");
  const [aberto, setAberto] = useState(!minha);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function enviar(evento) {
    evento.preventDefault();
    if (nota === 0) {
      setErro("Escolha de 1 a 5 estrelas.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await salvarAvaliacao(slug, { nota, titulo, comentario });
      aoSalvar();
      setEnviando(false);
      setAberto(false);
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  async function apagar() {
    setEnviando(true);
    await removerAvaliacao(slug).catch(() => null);
    aoSalvar();
  }

  if (!aberto) {
    return (
      <div className="flex flex-wrap gap-3">
        <Botao variante="secundario" onClick={() => setAberto(true)}>Editar minha avaliação</Botao>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5">
      <p className="font-bodoni text-xl text-stone-900">{minha ? "Editar sua avaliação" : "Avalie este perfume"}</p>

      <fieldset>
        <legend className="text-sm font-medium text-stone-700">Sua nota</legend>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setNota(n)} aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
              aria-pressed={nota === n} className="rounded-full p-1 transition hover:scale-110">
              <Star className={`size-7 ${n <= nota ? "fill-dourado text-dourado" : "text-stone-300"}`} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Título (opcional)
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={100} placeholder="Resuma sua opinião"
          className="h-11 rounded-xl border border-stone-300 bg-stone-50/70 px-4 font-normal text-stone-900 outline-none transition focus:border-marca focus:bg-white focus:ring-4 focus:ring-marca/15" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-700">
        Comentário (opcional)
        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={2000} rows={4}
          placeholder="Como é a fixação? Em que ocasiões você usa?"
          className="rounded-xl border border-stone-300 bg-stone-50/70 px-4 py-3 font-normal text-stone-900 outline-none transition focus:border-marca focus:bg-white focus:ring-4 focus:ring-marca/15" />
      </label>

      {erro && <p role="alert" className="text-sm text-oferta">{erro}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Botao type="submit" disabled={enviando}>{enviando ? "Enviando..." : "Publicar avaliação"}</Botao>
        {minha && (
          <button type="button" onClick={apagar} disabled={enviando} className="text-sm text-stone-500 underline underline-offset-4 hover:text-oferta">
            Apagar
          </button>
        )}
      </div>
    </form>
  );
}
