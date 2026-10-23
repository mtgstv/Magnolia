import { useCarregar } from "../../hooks/useCarregar";
import { listarCategorias } from "../../services/categoriasService";
import { listarProdutos } from "../../services/produtosService";
import GradeProdutos from "../produto/GradeProdutos";
import MensagemErro from "../ui/MensagemErro";
import Secao from "../ui/Secao";
import Beneficios from "./Beneficios";
import ChamadaCadastro from "./ChamadaCadastro";
import Colecoes from "./Colecoes";
import FamiliasOlfativas from "./FamiliasOlfativas";
import Hero from "./Hero";

// Home de quem não entrou na conta: apresenta a loja e convida a criar conta
export default function HomeVisitante() {
  const produtos = useCarregar(listarProdutos);
  const categorias = useCarregar(listarCategorias);

  // A API já entrega os produtos do mais novo para o mais antigo
  const lista = produtos.dados ?? [];
  const novidades = lista.slice(0, 4);
  const ofertas = lista
    .filter((produto) => produto.descontoMaximo > 0)
    .sort((a, b) => b.descontoMaximo - a.descontoMaximo)
    .slice(0, 4);

  return (
    <main>
      <Hero />
      <Beneficios />

      <Colecoes
        categorias={categorias.dados ?? []}
        produtos={lista}
        carregando={categorias.carregando || produtos.carregando}
      />

      <Secao rotulo="Acabaram de chegar" titulo="Novidades" link="/catalogo?ordenacao=novidades">
        {produtos.erro ? (
          <MensagemErro erro={produtos.erro} aoTentarDeNovo={produtos.recarregar} />
        ) : (
          <GradeProdutos produtos={novidades} carregando={produtos.carregando} />
        )}
      </Secao>

      {(produtos.carregando || ofertas.length > 0) && (
        <Secao rotulo="Preços especiais" titulo="Ofertas da estação" link="/catalogo?promocao=1" className="pt-0 md:pt-0">
          <GradeProdutos produtos={ofertas} carregando={produtos.carregando} />
        </Secao>
      )}

      <FamiliasOlfativas produtos={lista} />
      <ChamadaCadastro />
    </main>
  );
}
