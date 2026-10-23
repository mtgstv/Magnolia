import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Ao trocar de página, volta para o topo. Em links com âncora (ex.: /#colecoes),
// rola até a seção, esperando ela aparecer caso dependa de dados da API.
export default function RolagemAutomatica() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    let quadro;
    let tentativas = 0;

    const rolarAteASecao = () => {
      const secao = document.getElementById(decodeURIComponent(hash.slice(1)));

      if (secao) {
        secao.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (tentativas++ < 120) {
        // Tenta de novo no próximo quadro, por até ~2 segundos
        quadro = requestAnimationFrame(rolarAteASecao);
      }
    };

    rolarAteASecao();
    return () => cancelAnimationFrame(quadro);
  }, [pathname, hash]);

  return null;
}
