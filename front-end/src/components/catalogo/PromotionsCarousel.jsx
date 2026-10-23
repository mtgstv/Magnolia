import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const TEMPO_TROCA = 6000;
const DISTANCIA_MINIMA_ARRASTE = 50;

// promocoes: lista de GET /promocoes ({ id, titulo, imagemUrl, link })
function PromotionsCarousel({ promocoes }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const inicioArrasteRef = useRef(null);
  const arrasteRecenteRef = useRef(false);

  const totalPromocoes = promocoes.length;
  // Se a lista diminuir, não deixa o índice apontar para fora dela
  const indice = totalPromocoes > 0 ? indiceAtual % totalPromocoes : 0;

  function avancar() {
    setIndiceAtual((atual) => (atual + 1) % totalPromocoes);
  }

  function voltar() {
    setIndiceAtual((atual) => (atual - 1 + totalPromocoes) % totalPromocoes);
  }

  function iniciarArraste(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    arrasteRecenteRef.current = false;
    inicioArrasteRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId
    };
  }

  function finalizarArraste(event) {
    const inicio = inicioArrasteRef.current;

    if (!inicio || inicio.pointerId !== event.pointerId) {
      return;
    }

    const diferencaX = event.clientX - inicio.x;
    const diferencaY = event.clientY - inicio.y;

    inicioArrasteRef.current = null;

    // Evita interpretar a rolagem vertical como um arraste horizontal.
    if (Math.abs(diferencaY) > Math.abs(diferencaX)) {
      return;
    }

    if (Math.abs(diferencaX) < DISTANCIA_MINIMA_ARRASTE) {
      return;
    }

    // O navegador dispara um click logo após o pointerup; ele não deve abrir o link.
    arrasteRecenteRef.current = true;

    if (diferencaX < 0) {
      avancar();
    } else {
      voltar();
    }
  }

  function cancelarArraste() {
    inicioArrasteRef.current = null;
  }

  function bloquearCliqueAposArraste(event) {
    if (arrasteRecenteRef.current) {
      event.preventDefault();
      event.stopPropagation();
      arrasteRecenteRef.current = false;
    }
  }

  useEffect(() => {
    if (pausado || totalPromocoes <= 1) {
      return;
    }

    const intervalo = setInterval(() => {
      setIndiceAtual((atual) => (atual + 1) % totalPromocoes);
    }, TEMPO_TROCA);

    return () => clearInterval(intervalo);
  }, [pausado, totalPromocoes]);

  if (totalPromocoes === 0) {
    return null;
  }

  return (
    <section
      className="group/carrossel relative"
      aria-label="Promoções"
      aria-roledescription="carrossel"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPausado(false);
        }
      }}
    >
      <div
        className="relative touch-pan-y overflow-hidden rounded-3xl"
        onPointerDown={iniciarArraste}
        onPointerUp={finalizarArraste}
        onPointerCancel={cancelarArraste}
        onClickCapture={bloquearCliqueAposArraste}
      >
        <div
          className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${indice * 100}%)` }}
        >
          {promocoes.map((promocao, posicao) => (
            <div
              key={promocao.id}
              className="w-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${posicao + 1} de ${totalPromocoes}`}
              aria-hidden={posicao !== indice}
              inert={posicao !== indice}
            >
              <Link
                to={promocao.link ?? "/catalogo"}
                draggable="false"
                className="relative block h-56 sm:h-64 lg:h-72"
              >
                <img
                  src={promocao.imagemUrl}
                  alt=""
                  draggable="false"
                  className="absolute inset-0 size-full select-none object-cover"
                />

                <div className="relative flex h-full max-w-xl flex-col justify-center gap-3 px-8 sm:px-14">
                  <span className="w-fit rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-marca">
                    Promoção
                  </span>
                  <p className="font-bodoni text-2xl leading-tight text-stone-900 sm:text-4xl">{promocao.titulo}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-marca">
                    Ver seleção
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {totalPromocoes > 1 && (
          <>
            <BotaoSeta lado="esquerda" aoClicar={voltar} rotulo="Promoção anterior" Icone={ChevronLeft} />
            <BotaoSeta lado="direita" aoClicar={avancar} rotulo="Próxima promoção" Icone={ChevronRight} />
          </>
        )}
      </div>

      {totalPromocoes > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {promocoes.map((promocao, posicao) => (
            <button
              key={promocao.id}
              type="button"
              onClick={() => setIndiceAtual(posicao)}
              aria-label={`Ir para promoção ${posicao + 1}`}
              aria-current={posicao === indice ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                posicao === indice ? "w-10 bg-marca" : "w-5 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// No celular as setas somem (lá se troca arrastando); no computador aparecem com o mouse em cima
function BotaoSeta({ lado, aoClicar, rotulo, Icone }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={rotulo}
      className={`absolute top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-stone-800 shadow-md backdrop-blur transition hover:bg-white sm:flex sm:opacity-0 sm:group-hover/carrossel:opacity-100 sm:focus-visible:opacity-100 ${
        lado === "esquerda" ? "left-4" : "right-4"
      }`}
    >
      <Icone className="size-5" />
    </button>
  );
}

export default PromotionsCarousel;
