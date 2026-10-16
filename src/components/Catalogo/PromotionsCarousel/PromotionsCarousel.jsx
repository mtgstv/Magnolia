import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import produtosPromocao from "../../../data/productsPromocao";
import "./PromotionsCarousel.css";

const TEMPO_TROCA = 5000;
const DISTANCIA_MINIMA_ARRASTE = 50;

function PromotionsCarousel() {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const inicioArrasteRef = useRef(null);
  const intervaloRef = useRef(null);

  const totalPromocoes = produtosPromocao.length;

  function avancar() {
    setIndiceAtual((indice) => (indice + 1) % totalPromocoes);
  }

  function voltar() {
    setIndiceAtual(
      (indice) => (indice - 1 + totalPromocoes) % totalPromocoes
    );
  }

  function irPara(indice) {
    setIndiceAtual(indice);
  }

  function iniciarArraste(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    inicioArrasteRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      arrastando: false
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

    if (diferencaX < 0) {
      avancar();
    } else {
      voltar();
    }
  }

  function cancelarArraste() {
    inicioArrasteRef.current = null;
  }

  useEffect(() => {
    if (totalPromocoes === 0 || pausado || totalPromocoes === 1) {
      return;
    }

    intervaloRef.current = setInterval(() => {
      setIndiceAtual((indice) => (indice + 1) % totalPromocoes);
    }, TEMPO_TROCA);

    return () => {
      clearInterval(intervaloRef.current);
    };
  }, [pausado, totalPromocoes]);

  if (totalPromocoes === 0) {
    return null;
  }

  return (
    <section
      className="promotions-carousel"
      aria-label="Ofertas especiais"
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
        className="promotions-carousel__viewport"
        onPointerDown={iniciarArraste}
        onPointerUp={finalizarArraste}
        onPointerCancel={cancelarArraste}
      >
        <div
          className="promotions-carousel__track"
          style={{
            transform: `translateX(-${indiceAtual * 100}%)`
          }}
        >
          {produtosPromocao.map((produto, indice) => (
            <div
              className="promotions-carousel__slide"
              key={produto.id}
              aria-hidden={indice !== indiceAtual}
              inert={indice !== indiceAtual}
            >
              <Link
                to={produto.link}
                className="promotions-carousel__link"
                draggable="false"
                aria-label={`Ver promoção: ${produto.nome}`}
                tabIndex={indice === indiceAtual ? 0 : -1}
              >
                <img
                  className="promotions-carousel__image"
                  src={produto.imagem}
                  alt={`Promoção: ${produto.nome}`}
                  draggable="false"
                />
              </Link>
            </div>
          ))}
        </div>

        {totalPromocoes > 1 && (
          <div className="promotions-carousel__controls">
            <button
              type="button"
              className="promotions-carousel__button promotions-carousel__button--prev"
              onClick={voltar}
              aria-label="Promoção anterior"
            >
              &#10094;
            </button>

            <button
              type="button"
              className="promotions-carousel__button promotions-carousel__button--next"
              onClick={avancar}
              aria-label="Próxima promoção"
            >
              &#10095;
            </button>
          </div>
        )}
      </div>

      {totalPromocoes > 1 && (
        <div
          className="promotions-carousel__indicators"
          aria-label="Selecionar promoção"
        >
          {produtosPromocao.map((produto, indice) => (
            <button
              key={produto.id}
              type="button"
              className={`promotions-carousel__indicator ${
                indice === indiceAtual
                  ? "promotions-carousel__indicator--active"
                  : ""
              }`}
              onClick={() => irPara(indice)}
              aria-label={`Ir para promoção ${indice + 1}`}
              aria-current={indice === indiceAtual ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PromotionsCarousel;