import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import Botao from "../../components/ui/Botao";
import CampoFormulario from "../../components/ui/CampoFormulario";
import MensagemErro from "../../components/ui/MensagemErro";
import { useCarregar } from "../../hooks/useCarregar";
import { listarPromocoesAdmin, removerPromocaoAdmin, salvarPromocaoAdmin } from "../../services/adminService";
import { campoDataParaIso, isoParaCampoData } from "../../utils/admin";

const classeCartao = "rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 sm:p-8";

function novaPromocao() {
  const hoje = new Date();
  const daquiUmMes = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    id: null, titulo: "", imagemUrl: "/images/promocoes/", link: "/catalogo?promocao=1",
    inicio: isoParaCampoData(hoje.toISOString()), fim: isoParaCampoData(daquiUmMes.toISOString()), ordem: "1"
  };
}

function formatarPeriodo(promocao) {
  const opcoes = { day: "2-digit", month: "short", year: "numeric" };
  return `${new Date(promocao.inicio).toLocaleDateString("pt-BR", opcoes)} até ${new Date(promocao.fim).toLocaleDateString("pt-BR", opcoes)}`;
}

// Banners do carrossel do catálogo: cada um aparece só entre o início e o fim
export default function AdminPromocoes() {
  const promocoes = useCarregar(listarPromocoesAdmin);
  const [editando, setEditando] = useState(null);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function editar(promocao) {
    setErros({});
    setErroGeral(null);
    setEditando(
      promocao
        ? { ...promocao, link: promocao.link ?? "", inicio: isoParaCampoData(promocao.inicio), fim: isoParaCampoData(promocao.fim), ordem: String(promocao.ordem) }
        : novaPromocao()
    );
  }

  function alterar(evento) {
    const { name, value } = evento.target;
    setEditando((atual) => ({ ...atual, [name]: value }));
    setErros((atual) => ({ ...atual, [name]: undefined }));
  }

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErroGeral(null);
    try {
      await salvarPromocaoAdmin(editando.id, {
        ...editando,
        inicio: campoDataParaIso(editando.inicio),
        fim: campoDataParaIso(editando.fim),
        ordem: Number(editando.ordem) || 0
      });
      setEditando(null);
      promocoes.recarregar();
    } catch (falha) {
      setErros(falha.campos ?? {});
      setErroGeral(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(promocao) {
    if (!window.confirm(`Apagar a promoção "${promocao.titulo}"?`)) return;
    try {
      await removerPromocaoAdmin(promocao.id);
      promocoes.recarregar();
    } catch (falha) {
      setErroGeral(falha.message);
    }
  }

  if (promocoes.erro) return <MensagemErro erro={promocoes.erro} aoTentarDeNovo={promocoes.recarregar} />;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <section aria-label="Promoções" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-stone-500">Os banners aparecem no topo do catálogo, na ordem indicada.</p>
          <Botao onClick={() => editar(null)} className="shrink-0">
            <Plus className="size-4" />
            Nova
          </Botao>
        </div>

        {erroGeral && !editando && <MensagemErro erro={{ message: erroGeral }} />}

        {(promocoes.dados ?? []).map((promocao) => (
          <article key={promocao.id} className="flex flex-wrap items-center gap-4 overflow-hidden rounded-3xl bg-white p-4 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5">
            <img src={promocao.imagemUrl} alt="" className="h-20 w-36 shrink-0 rounded-2xl bg-areia object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-900">{promocao.titulo}</p>
              <p className="text-sm text-stone-500">{formatarPeriodo(promocao)} · ordem {promocao.ordem}</p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${promocao.ativa ? "bg-marca-clara text-marca" : "bg-stone-100 text-stone-500"}`}>
                {promocao.ativa ? "No ar" : "Fora do ar"}
              </span>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => editar(promocao)} aria-label={`Editar ${promocao.titulo}`}
                className="flex size-10 items-center justify-center rounded-full text-marca hover:bg-marca-clara">
                <Pencil className="size-4" />
              </button>
              <button type="button" onClick={() => remover(promocao)} aria-label={`Apagar ${promocao.titulo}`}
                className="flex size-10 items-center justify-center rounded-full text-stone-400 hover:bg-rose-50 hover:text-oferta">
                <Trash2 className="size-4" />
              </button>
            </div>
          </article>
        ))}
        {promocoes.carregando && <div className="h-28 animate-pulse rounded-3xl bg-areia" />}
      </section>

      {editando && (
        <form noValidate onSubmit={salvar} className={`${classeCartao} flex flex-col gap-5 lg:sticky lg:top-6`}>
          <h2 className="font-bodoni text-2xl text-stone-900">{editando.id ? "Editar promoção" : "Nova promoção"}</h2>
          <CampoFormulario id="titulo" name="titulo" rotulo="Título" value={editando.titulo} onChange={alterar} erro={erros.titulo} />
          <CampoFormulario id="imagemUrl" name="imagemUrl" rotulo="Imagem (endereço)" value={editando.imagemUrl} onChange={alterar}
            erro={erros.imagemUrl} dica="Arquivos em front-end/public/images/promocoes" />
          <CampoFormulario id="link" name="link" rotulo="Link ao clicar (opcional)" value={editando.link} onChange={alterar} erro={erros.link} />
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoFormulario id="inicio" name="inicio" type="datetime-local" rotulo="Início" value={editando.inicio} onChange={alterar} erro={erros.inicio} />
            <CampoFormulario id="fim" name="fim" type="datetime-local" rotulo="Fim" value={editando.fim} onChange={alterar} erro={erros.fim} />
          </div>
          <CampoFormulario id="ordem" name="ordem" type="number" rotulo="Ordem no carrossel" value={editando.ordem} onChange={alterar} />

          {erroGeral && (
            <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">{erroGeral}</p>
          )}
          <div className="flex gap-3">
            <Botao type="submit" disabled={salvando} className="flex-1">{salvando ? "Salvando..." : "Salvar"}</Botao>
            <Botao variante="secundario" onClick={() => setEditando(null)}>Cancelar</Botao>
          </div>
        </form>
      )}
    </div>
  );
}
