import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search } from "lucide-react";

import ImagemProduto from "../../components/produto/ImagemProduto";
import Botao from "../../components/ui/Botao";
import MensagemErro from "../../components/ui/MensagemErro";
import { useCarregar } from "../../hooks/useCarregar";
import { alterarAtivoAdmin, listarProdutosAdmin } from "../../services/adminService";
import { formatarPreco } from "../../utils/preco";
import { normalizarTexto } from "../../utils/texto";

// Abaixo disso, o estoque aparece em destaque
const ESTOQUE_BAIXO = 3;

function faixaDePreco(variantes) {
  const precos = variantes.map((v) => v.precoPromocional ?? v.preco);
  const menor = Math.min(...precos);
  const maior = Math.max(...precos);
  return menor === maior ? formatarPreco(menor) : `${formatarPreco(menor)} a ${formatarPreco(maior)}`;
}

export default function AdminProdutos() {
  const produtos = useCarregar(listarProdutosAdmin);
  const [busca, setBusca] = useState("");
  // Mudanças de "à venda" feitas aqui, por id (a lista não precisa ser buscada de novo)
  const [alterados, setAlterados] = useState({});
  const [erro, setErro] = useState(null);

  async function alternarAtivo(produto, ativo) {
    setErro(null);
    try {
      const atualizado = await alterarAtivoAdmin(produto.id, ativo);
      setAlterados((atual) => ({ ...atual, [produto.id]: atualizado }));
    } catch (falha) {
      setErro(falha);
    }
  }

  if (produtos.erro) {
    return <MensagemErro erro={produtos.erro} aoTentarDeNovo={produtos.recarregar} />;
  }

  const termo = normalizarTexto(busca.trim());
  const lista = (produtos.dados ?? [])
    .map((produto) => alterados[produto.id] ?? produto)
    .filter((produto) => !termo || normalizarTexto(`${produto.nome} ${produto.marca}`).includes(termo));

  return (
    <section aria-label="Perfumes">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar perfume</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por nome ou marca"
            className="h-12 w-full rounded-full border border-stone-300 bg-white pl-12 pr-5 outline-none transition placeholder:text-stone-400 focus:border-marca focus:ring-4 focus:ring-marca/15"
          />
        </label>
        <Botao to="/admin/produtos/novo">
          <Plus className="size-4" />
          Novo perfume
        </Botao>
      </div>

      {erro && <MensagemErro erro={erro} className="mt-4" />}

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-100 text-xs uppercase tracking-[0.15em] text-stone-500">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Perfume</th>
              <th scope="col" className="px-5 py-4 font-semibold">Preço</th>
              <th scope="col" className="px-5 py-4 font-semibold">Estoque</th>
              <th scope="col" className="px-5 py-4 font-semibold">À venda</th>
              <th scope="col" className="px-5 py-4"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {produtos.carregando
              ? [1, 2, 3].map((n) => (
                  <tr key={n}><td colSpan={5} className="px-5 py-4"><div className="h-12 animate-pulse rounded-xl bg-areia" /></td></tr>
                ))
              : lista.map((produto) => (
                  <tr key={produto.id} className={produto.ativo ? "" : "bg-stone-50 text-stone-500"}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ImagemProduto src={produto.imagemUrl} alt="" className="h-14 w-12 shrink-0 rounded-lg bg-areia object-cover" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">{produto.marca}</p>
                          <p className="font-medium text-stone-900">{produto.nome}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{faixaDePreco(produto.variantes)}</td>
                    <td className="px-5 py-3">
                      <ul className="flex flex-col gap-0.5">
                        {produto.variantes.map((v) => (
                          <li key={v.id} className={v.estoque < ESTOQUE_BAIXO ? "font-semibold text-oferta" : ""}>
                            {v.volumeMl} ml: {v.estoque === 0 ? "esgotado" : `${v.estoque} un.`}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={produto.ativo}
                          onChange={(evento) => alternarAtivo(produto, evento.target.checked)}
                          className="size-4 accent-marca"
                        />
                        {produto.ativo ? "Sim" : "Escondido"}
                      </label>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/admin/produtos/${produto.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-marca hover:bg-marca-clara"
                      >
                        <Pencil className="size-4" />
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!produtos.carregando && lista.length === 0 && (
          <p className="px-5 py-10 text-center text-stone-500">Nenhum perfume encontrado.</p>
        )}
      </div>
    </section>
  );
}
