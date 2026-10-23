import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import ImagemProduto from "../../components/produto/ImagemProduto";
import Botao from "../../components/ui/Botao";
import CampoFormulario from "../../components/ui/CampoFormulario";
import MensagemErro from "../../components/ui/MensagemErro";
import { useCarregar } from "../../hooks/useCarregar";
import { buscarProdutoAdmin, criarMarcaAdmin, salvarProdutoAdmin } from "../../services/adminService";
import { listarCategorias } from "../../services/categoriasService";
import { listarMarcas } from "../../services/marcasService";
import { centavosParaTexto, textoParaCentavos } from "../../utils/admin";
import { FAMILIAS } from "../../utils/familias";

const classeCartao = "rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 sm:p-8";
const classeSelect =
  "h-12 w-full rounded-xl border border-stone-300 bg-stone-50/70 px-4 text-stone-900 outline-none transition focus:border-marca focus:bg-white focus:ring-4 focus:ring-marca/15";

const NOVO = {
  nome: "", slug: "", marcaId: "", categoriaId: "", concentracao: "EDP", descricao: "", familiaOlfativa: "",
  notasTopo: "", notasCoracao: "", notasFundo: "", imagemUrl: "", ativo: true,
  variantes: [{ chave: 1, id: null, volumeMl: "50", sku: "", preco: "", precoPromocional: "", estoque: "0" }]
};

// O formulário trabalha com textos (como o usuário digita); a API recebe números e centavos
function paraFormulario(produto) {
  return {
    ...produto,
    slug: produto.slug ?? "",
    descricao: produto.descricao ?? "",
    familiaOlfativa: produto.familiaOlfativa ?? "",
    notasTopo: produto.notasTopo ?? "",
    notasCoracao: produto.notasCoracao ?? "",
    notasFundo: produto.notasFundo ?? "",
    imagemUrl: produto.imagemUrl ?? "",
    variantes: produto.variantes.map((v) => ({
      chave: v.id,
      id: v.id,
      volumeMl: String(v.volumeMl),
      sku: v.sku,
      preco: centavosParaTexto(v.preco),
      precoPromocional: centavosParaTexto(v.precoPromocional),
      estoque: String(v.estoque)
    }))
  };
}

// Cadastro (/admin/produtos/novo) e edição (/admin/produtos/:id) de um perfume
export default function AdminProdutoForm() {
  const { id } = useParams();
  const buscar = useCallback(() => (id ? buscarProdutoAdmin(id) : Promise.resolve(null)), [id]);
  const produto = useCarregar(buscar);
  const marcas = useCarregar(listarMarcas);
  const categorias = useCarregar(listarCategorias);

  if (produto.erro) return <MensagemErro erro={produto.erro} aoTentarDeNovo={produto.recarregar} />;
  if (produto.carregando || marcas.carregando || categorias.carregando) {
    return <div className="h-96 animate-pulse rounded-3xl bg-areia" aria-busy="true" />;
  }

  return (
    <Formulario
      key={id ?? "novo"}
      inicial={produto.dados ? paraFormulario(produto.dados) : NOVO}
      marcasIniciais={marcas.dados ?? []}
      categorias={categorias.dados ?? []}
    />
  );
}

function Formulario({ inicial, marcasIniciais, categorias }) {
  const navigate = useNavigate();
  const [dados, setDados] = useState(inicial);
  const [marcas, setMarcas] = useState(marcasIniciais);
  const [novaMarca, setNovaMarca] = useState(null);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  function alterar(evento) {
    const { name, value, type, checked } = evento.target;
    setDados((atual) => ({ ...atual, [name]: type === "checkbox" ? checked : value }));
    setErros((atual) => ({ ...atual, [name]: undefined }));
    setSalvo(false);
  }

  function alterarVariante(chave, campo, valor) {
    setDados((atual) => ({
      ...atual,
      variantes: atual.variantes.map((v) => (v.chave === chave ? { ...v, [campo]: valor } : v))
    }));
    setSalvo(false);
  }

  function adicionarVariante() {
    setDados((atual) => ({
      ...atual,
      variantes: [...atual.variantes, { chave: Date.now(), id: null, volumeMl: "", sku: "", preco: "", precoPromocional: "", estoque: "0" }]
    }));
  }

  function removerVariante(chave) {
    setDados((atual) => ({ ...atual, variantes: atual.variantes.filter((v) => v.chave !== chave) }));
  }

  async function cadastrarMarca() {
    if (!novaMarca?.trim()) return;
    try {
      const marca = await criarMarcaAdmin(novaMarca.trim());
      setMarcas((atual) => [...atual, marca].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      setDados((atual) => ({ ...atual, marcaId: marca.id }));
      setNovaMarca(null);
    } catch (falha) {
      setErroGeral(falha.message);
    }
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErroGeral(null);

    const variantes = dados.variantes.map((v) => ({
      id: v.id,
      volumeMl: Number(v.volumeMl),
      sku: v.sku,
      preco: textoParaCentavos(v.preco),
      precoPromocional: textoParaCentavos(v.precoPromocional),
      estoque: Number(v.estoque)
    }));
    if (variantes.some((v) => Number.isNaN(v.preco) || Number.isNaN(v.precoPromocional) || v.preco == null)) {
      setErroGeral("Confira os preços dos volumes (ex.: 649,90).");
      return;
    }

    setSalvando(true);
    try {
      const salvoNaApi = await salvarProdutoAdmin(dados.id, {
        ...dados,
        marcaId: dados.marcaId ? Number(dados.marcaId) : null,
        categoriaId: dados.categoriaId ? Number(dados.categoriaId) : null,
        variantes
      });
      setErros({});
      if (dados.id) {
        setDados(paraFormulario(salvoNaApi));
        setSalvo(true);
      } else {
        navigate(`/admin/produtos/${salvoNaApi.id}`, { replace: true });
      }
    } catch (falha) {
      setErros(falha.campos ?? {});
      setErroGeral(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form noValidate onSubmit={salvar} className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-marca hover:text-destaque">
          <ArrowLeft className="size-4" />
          Voltar para a lista
        </Link>

        <section className={classeCartao}>
          <h2 className="font-bodoni text-2xl text-stone-900">{dados.id ? `Editar ${inicial.nome}` : "Novo perfume"}</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <CampoFormulario id="nome" name="nome" rotulo="Nome" value={dados.nome} onChange={alterar} erro={erros.nome} />
            <CampoFormulario id="slug" name="slug" rotulo="Endereço (slug)" value={dados.slug} onChange={alterar} erro={erros.slug}
              dica="Deixe vazio para gerar a partir do nome" placeholder="ex.: libre-eau-de-parfum" />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="marcaId" className="text-sm font-medium text-stone-700">Marca</label>
              {novaMarca == null ? (
                <div className="flex gap-2">
                  <select id="marcaId" name="marcaId" value={dados.marcaId} onChange={alterar} className={classeSelect}>
                    <option value="">Escolha</option>
                    {marcas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                  <button type="button" onClick={() => setNovaMarca("")} title="Cadastrar marca"
                    className="shrink-0 rounded-xl border border-stone-300 px-3 text-stone-600 hover:border-marca hover:text-marca">
                    <Plus className="size-4" />
                    <span className="sr-only">Cadastrar marca</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={novaMarca} onChange={(e) => setNovaMarca(e.target.value)} placeholder="Nome da nova marca" autoFocus
                    className={classeSelect} />
                  <Botao onClick={cadastrarMarca} className="shrink-0 px-4">Salvar</Botao>
                  <button type="button" onClick={() => setNovaMarca(null)} className="text-sm text-stone-500 underline">Cancelar</button>
                </div>
              )}
              {erros.marcaId && <p className="text-sm text-oferta">{erros.marcaId}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoriaId" className="text-sm font-medium text-stone-700">Categoria</label>
              <select id="categoriaId" name="categoriaId" value={dados.categoriaId} onChange={alterar} className={classeSelect}>
                <option value="">Escolha</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              {erros.categoriaId && <p className="text-sm text-oferta">{erros.categoriaId}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="concentracao" className="text-sm font-medium text-stone-700">Concentração</label>
              <select id="concentracao" name="concentracao" value={dados.concentracao} onChange={alterar} className={classeSelect}>
                <option value="EDP">Eau de Parfum</option>
                <option value="EDT">Eau de Toilette</option>
                <option value="PARFUM">Parfum</option>
              </select>
            </div>

            <CampoFormulario id="familiaOlfativa" name="familiaOlfativa" rotulo="Família olfativa" list="familias"
              value={dados.familiaOlfativa} onChange={alterar} erro={erros.familiaOlfativa} />
            <datalist id="familias">
              {Object.keys(FAMILIAS).map((familia) => <option key={familia} value={familia} />)}
            </datalist>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="descricao" className="text-sm font-medium text-stone-700">Descrição</label>
              <textarea id="descricao" name="descricao" rows={3} value={dados.descricao} onChange={alterar}
                className="w-full rounded-xl border border-stone-300 bg-stone-50/70 px-4 py-3 text-stone-900 outline-none transition focus:border-marca focus:bg-white focus:ring-4 focus:ring-marca/15" />
            </div>

            <CampoFormulario id="notasTopo" name="notasTopo" rotulo="Notas de topo" value={dados.notasTopo} onChange={alterar} erro={erros.notasTopo} />
            <CampoFormulario id="notasCoracao" name="notasCoracao" rotulo="Notas de coração" value={dados.notasCoracao} onChange={alterar} erro={erros.notasCoracao} />
            <CampoFormulario id="notasFundo" name="notasFundo" rotulo="Notas de fundo" value={dados.notasFundo} onChange={alterar} erro={erros.notasFundo} />
          </div>
        </section>

        <section className={classeCartao}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bodoni text-2xl text-stone-900">Volumes, preços e estoque</h2>
            <button type="button" onClick={adicionarVariante}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-marca hover:bg-marca-clara">
              <Plus className="size-4" /> Volume
            </button>
          </div>
          <p className="mt-1 text-sm text-stone-500">Preços em reais (ex.: 649,90). Deixe a promoção vazia para vender pelo preço normal.</p>

          <div className="mt-5 flex flex-col gap-4">
            {dados.variantes.map((v, indice) => (
              <fieldset key={v.chave} className="grid gap-3 rounded-2xl border border-stone-200 p-4 sm:grid-cols-[90px_1fr_110px_110px_90px_auto]">
                <legend className="sr-only">Volume {indice + 1}</legend>
                <CampoVariante rotulo="ml" valor={v.volumeMl} aoMudar={(x) => alterarVariante(v.chave, "volumeMl", x)} inputMode="numeric" />
                <CampoVariante rotulo="SKU" valor={v.sku} aoMudar={(x) => alterarVariante(v.chave, "sku", x)} />
                <CampoVariante rotulo="Preço" valor={v.preco} aoMudar={(x) => alterarVariante(v.chave, "preco", x)} inputMode="decimal" />
                <CampoVariante rotulo="Promoção" valor={v.precoPromocional} aoMudar={(x) => alterarVariante(v.chave, "precoPromocional", x)} inputMode="decimal" />
                <CampoVariante rotulo="Estoque" valor={v.estoque} aoMudar={(x) => alterarVariante(v.chave, "estoque", x)} inputMode="numeric" />
                <button type="button" onClick={() => removerVariante(v.chave)} disabled={dados.variantes.length === 1}
                  aria-label={`Remover volume ${indice + 1}`} title="Remover volume"
                  className="flex size-11 items-center justify-center self-end rounded-full text-stone-400 transition hover:bg-rose-50 hover:text-oferta disabled:opacity-30">
                  <Trash2 className="size-4" />
                </button>
              </fieldset>
            ))}
          </div>
        </section>
      </div>

      <aside className={`${classeCartao} flex flex-col gap-5 lg:sticky lg:top-6`}>
        <div className="overflow-hidden rounded-2xl bg-areia">
          <ImagemProduto src={dados.imagemUrl || null} alt="Prévia da foto" className="aspect-square w-full object-cover" />
        </div>
        <CampoFormulario id="imagemUrl" name="imagemUrl" rotulo="Foto (endereço)" value={dados.imagemUrl} onChange={alterar}
          erro={erros.imagemUrl} placeholder="/images/produtos/nome.jpg" dica="Arquivos em front-end/public/images/produtos" />

        <label className="flex items-center gap-3 rounded-2xl bg-fundo px-4 py-3 text-sm text-stone-700">
          <input type="checkbox" name="ativo" checked={dados.ativo} onChange={alterar} className="size-4 accent-marca" />
          À venda na loja
        </label>

        {erroGeral && (
          <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">{erroGeral}</p>
        )}
        {salvo && (
          <p role="status" className="rounded-2xl bg-marca-clara px-4 py-3 text-sm text-marca-escura ring-1 ring-marca/15">Alterações salvas.</p>
        )}

        <Botao type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar perfume"}</Botao>
        {dados.id && dados.ativo && (
          <Link to={`/produto/${dados.slug}`} className="text-center text-sm font-medium text-marca underline underline-offset-4">
            Ver na loja
          </Link>
        )}
      </aside>
    </form>
  );
}

function CampoVariante({ rotulo, valor, aoMudar, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
      {rotulo}
      <input
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50/70 px-3 text-sm text-stone-900 outline-none transition focus:border-marca focus:bg-white focus:ring-4 focus:ring-marca/15"
        {...props}
      />
    </label>
  );
}
