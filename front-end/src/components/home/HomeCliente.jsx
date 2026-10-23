import { Heart } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useCarregar } from "../../hooks/useCarregar";
import { useFavoritos } from "../../hooks/useFavoritos";
import { listarRecomendacoes } from "../../services/favoritosService";
import { listarProdutos } from "../../services/produtosService";
import CarrosselProdutos from "../produto/CarrosselProdutos";
import GradeProdutos from "../produto/GradeProdutos";
import Botao from "../ui/Botao";
import EstadoVazio from "../ui/EstadoVazio";
import MensagemErro from "../ui/MensagemErro";
import Secao from "../ui/Secao";
import BoasVindas from "./BoasVindas";
import FamiliasOlfativas from "./FamiliasOlfativas";

// Home de quem está logado: favoritos, recomendações e novidades
export default function HomeCliente() {
  const { usuario } = useAuth();
  const { favoritos, carregando: carregandoFavoritos, versao } = useFavoritos();
  const produtos = useCarregar(listarProdutos);

  // As recomendações dependem dos favoritos: busca de novo quando a API confirma uma mudança
  const recomendacoes = useCarregar(listarRecomendacoes, versao);

  const lista = produtos.dados ?? [];

  return (
    <main>
      <BoasVindas usuario={usuario} totalFavoritos={favoritos.length} />

      <Secao rotulo="Sua seleção" titulo="Seus favoritos" link={favoritos.length > 0 ? "/favoritos" : null}>
        {!carregandoFavoritos && favoritos.length === 0 ? (
          <EstadoVazio
            icone={Heart}
            titulo="Sua lista ainda está vazia"
            texto="Toque no coração de um perfume para salvá-lo aqui. Depois é só voltar quando quiser."
          >
            <Botao to="/catalogo">Explorar perfumes</Botao>
          </EstadoVazio>
        ) : (
          <GradeProdutos produtos={favoritos.slice(0, 4)} carregando={carregandoFavoritos} />
        )}
      </Secao>

      <Secao
        rotulo={favoritos.length > 0 ? "Com base nos seus favoritos" : "Para começar"}
        titulo="Recomendados para você"
        className="pt-0 md:pt-0"
      >
        {recomendacoes.erro ? (
          <MensagemErro erro={recomendacoes.erro} aoTentarDeNovo={recomendacoes.recarregar} />
        ) : (
          <GradeProdutos produtos={recomendacoes.dados?.slice(0, 4)} carregando={recomendacoes.carregando} />
        )}
      </Secao>

      <Secao rotulo="Acabaram de chegar" titulo="Novidades" link="/catalogo?ordenacao=novidades" className="pt-0 md:pt-0">
        {produtos.erro ? (
          <MensagemErro erro={produtos.erro} aoTentarDeNovo={produtos.recarregar} />
        ) : (
          <CarrosselProdutos produtos={lista.slice(0, 8)} carregando={produtos.carregando} />
        )}
      </Secao>

      <FamiliasOlfativas produtos={lista} />
    </main>
  );
}
