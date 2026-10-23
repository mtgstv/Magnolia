import { useCallback, useEffect, useState } from "react";

// Busca dados da API e controla carregamento e erro.
// "buscar" precisa ser estável: uma função de services/ ou criada com useCallback.
// "chave" (opcional): quando muda, busca de novo (ex.: a lista de favoritos mudou).
// Durante uma nova busca, "dados" continua com o resultado anterior (evita a tela piscar).
export function useCarregar(buscar, chave = null) {
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState({
    buscar: null,
    chave: null,
    tentativa: -1,
    dados: null,
    erro: null
  });

  useEffect(() => {
    let ativo = true;

    buscar().then(
      (dados) => {
        if (ativo) setResultado({ buscar, chave, tentativa, dados, erro: null });
      },
      (erro) => {
        if (ativo) setResultado({ buscar, chave, tentativa, dados: null, erro });
      }
    );

    return () => {
      ativo = false;
    };
  }, [buscar, chave, tentativa]);

  const recarregar = useCallback(() => setTentativa((atual) => atual + 1), []);
  const atualizado =
    resultado.buscar === buscar && resultado.chave === chave && resultado.tentativa === tentativa;

  return {
    dados: resultado.dados,
    erro: atualizado ? resultado.erro : null,
    carregando: !atualizado,
    recarregar
  };
}
