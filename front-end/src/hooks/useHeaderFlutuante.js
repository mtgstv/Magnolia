import { useEffect, useRef, useState } from "react";

// A partir de quantos pixels de rolagem o header "descola" e fica transparente
const LIMITE_ROLAGEM = 40;
// Quanto tempo parado até o header se esconder
const TEMPO_PARA_ESCONDER = 1800;
// Mouse a menos disso do topo da tela faz o header voltar
const DISTANCIA_DO_TOPO = 90;

// Controla o header que acompanha a rolagem:
// - no topo da página ele fica normal;
// - ao rolar, fica transparente e acompanha a tela;
// - depois de um tempinho parado, se esconde;
// - depois de escondido, só volta quando o mouse chega perto do topo (rolar não traz de volta);
// - em telas de toque (sem mouse), volta ao rolar para cima, senão não haveria como alcançá-lo.
// "travado": enquanto for true (ex.: um menu aberto), o header não se esconde.
export function useHeaderFlutuante(travado) {
  const refHeader = useRef(null);
  const [rolou, setRolou] = useState(() => window.scrollY > LIMITE_ROLAGEM);
  const [escondido, setEscondido] = useState(false);

  const temporizador = useRef(null);
  const travadoRef = useRef(travado);
  const mousePerto = useRef(false);
  const agendarRef = useRef(null);
  const escondidoRef = useRef(false);

  useEffect(() => {
    function cancelar() {
      clearTimeout(temporizador.current);
    }

    function definirEscondido(valor) {
      escondidoRef.current = valor;
      setEscondido(valor);
    }

    function agendarEsconder() {
      cancelar();
      if (window.scrollY <= LIMITE_ROLAGEM || travadoRef.current || mousePerto.current) return;
      temporizador.current = setTimeout(() => definirEscondido(true), TEMPO_PARA_ESCONDER);
    }

    const semMouse = window.matchMedia("(hover: none)").matches;
    let ultimaPosicao = window.scrollY;

    function aoRolar() {
      const posicao = window.scrollY;
      const subindo = posicao < ultimaPosicao;
      ultimaPosicao = posicao;
      setRolou(posicao > LIMITE_ROLAGEM);

      if (posicao <= LIMITE_ROLAGEM || (semMouse && subindo)) {
        // Voltou ao topo (ou, no celular, rolou para cima): mostra de novo
        definirEscondido(false);
      }

      // Escondido continua escondido; visível, recomeça a contar o tempo
      if (!escondidoRef.current) agendarEsconder();
    }

    function aoMoverMouse(evento) {
      // Enquanto o header está visível, a "zona perto do topo" vai até um pouco abaixo dele
      const baseHeader = refHeader.current?.getBoundingClientRect().bottom ?? 0;
      const perto = evento.clientY < Math.max(DISTANCIA_DO_TOPO, baseHeader + 24);

      if (perto && !mousePerto.current) {
        mousePerto.current = true;
        cancelar();
        definirEscondido(false);
      } else if (!perto && mousePerto.current) {
        mousePerto.current = false;
        agendarEsconder();
      }
    }

    // Guardado para o efeito do "travado" (abaixo) também poder chamar
    agendarRef.current = agendarEsconder;

    agendarEsconder();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("mousemove", aoMoverMouse, { passive: true });
    return () => {
      cancelar();
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("mousemove", aoMoverMouse);
    };
  }, []);

  // Menu aberto: não esconde. Menu fechou: volta a contar o tempo.
  useEffect(() => {
    travadoRef.current = travado;
    if (travado) {
      clearTimeout(temporizador.current);
    } else {
      agendarRef.current?.();
    }
  }, [travado]);

  return { refHeader, rolou, escondido: rolou && escondido };
}
