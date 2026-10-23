import { useCarregar } from "../../hooks/useCarregar";
import { listarCategorias } from "../../services/categoriasService";
import { listarMarcas } from "../../services/marcasService";
import { listarProdutos } from "../../services/produtosService";
import CarrosselProdutos from "../produto/CarrosselProdutos";
import GradeProdutos from "../produto/GradeProdutos";
import MensagemErro from "../ui/MensagemErro";
import Secao from "../ui/Secao";
import Beneficios from "./Beneficios";
import ChamadaCadastro from "./ChamadaCadastro";
import Colecoes from "./Colecoes";
import FamiliasOlfativas from "./FamiliasOlfativas";
import Hero from "./Hero";
import LetreiroMarcas from "./LetreiroMarcas";

// Home de quem não entrou na conta: apresenta a loja e convida a criar conta
export default function HomeVisitante() {
  const produtos = useCarregar(listarProdutos);
  const categorias = useCarregar(listarCategorias);
  const marcas = useCarregar(listarMarcas);

  // A API já entrega os produtos do mais novo para o mais antigo
  const lista = produtos.dados ?? [];
  const novidades = lista.slice(0, 8);
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

      <LetreiroMarcas marcas={marcas.dados ?? []} />

      <Secao rotulo="Acabaram de chegar" titulo="Novidades" link="/catalogo?ordenacao=novidades">
        {produtos.erro ? (
          <MensagemErro erro={produtos.erro} aoTentarDeNovo={produtos.recarregar} />
        ) : (
          <CarrosselProdutos produtos={novidades} carregando={produtos.carregando} />
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
