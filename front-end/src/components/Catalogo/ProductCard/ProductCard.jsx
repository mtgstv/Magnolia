import { Link } from "react-router-dom";
import "./ProductCard.css";

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function ProductCard({ produto }) {
  const temDesconto =
    produto.precoPromocional != null &&
    produto.precoPromocional < produto.preco;

  const precoFinal = temDesconto
    ? produto.precoPromocional
    : produto.preco;

  const desconto = temDesconto
    ? Math.round(
        ((produto.preco - produto.precoPromocional) /
          produto.preco) *
          100
      )
    : 0;

  return (
    <article className="product-card">
      <Link
        to={`/produto/${produto.id}`}
        className="product-card__image-link"
        aria-label={`Ver detalhes de ${produto.nome}`}
      >
        <div className="product-card__image-container">
          {temDesconto && (
            <span className="product-card__discount">
              -{desconto}%
            </span>
          )}

          <img
            className="product-card__image"
            src={produto.imagem}
            alt={produto.nome}
            loading="lazy"
          />
        </div>
      </Link>

      <div className="product-card__content">
        <span className="product-card__brand">
          {produto.marca}
        </span>

        <h3 className="product-card__name">
          <Link to={`/produto/${produto.id}`}>
            {produto.nome}
          </Link>
        </h3>

        <span className="product-card__volume">
          {produto.volume}
        </span>

        <div className="product-card__prices">
          {temDesconto && (
            <span className="product-card__old-price">
              {formatarPreco(produto.preco)}
            </span>
          )}

          <span className="product-card__price">
            {formatarPreco(precoFinal)}
          </span>
        </div>

        <Link
          to={`/produto/${produto.id}`}
          className="product-card__button"
        >
          Ver produto
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;