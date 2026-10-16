import { useMemo, useState } from "react";

import PromotionsCarousel from "../components/Catalogo/PromotionsCarousel/PromotionsCarousel";
import ProductCard from "../components/Catalogo/ProductCard/ProductCard";
import ProductFilters from "../components/Catalogo/ProductFilters/ProductFilters";

import produtos from "../data/products";

import "./Catalogo.css";

function Catalogo() {
  const [busca, setBusca] = useState("");
  const [marca, setMarca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precoMinimo, setPrecoMinimo] = useState("");
  const [precoMaximo, setPrecoMaximo] = useState("");
  const [ordenacao, setOrdenacao] = useState("relevancia");

  const marcas = useMemo(
    () => [...new Set(produtos.map((produto) => produto.marca))].sort(),
    []
  );

  const categorias = useMemo(
    () => [...new Set(produtos.map((produto) => produto.categoria))].sort(),
    []
  );

  const produtosFiltrados = useMemo(() => {
    const termoBusca = busca.trim().toLowerCase();

    const resultado = produtos.filter((produto) => {
      const correspondeBusca =
        produto.nome.toLowerCase().includes(termoBusca) ||
        produto.marca.toLowerCase().includes(termoBusca);

      const correspondeMarca =
        marca === "" || produto.marca === marca;

      const correspondeCategoria =
        categoria === "" || produto.categoria === categoria;

      const preco = produto.precoPromocional ?? produto.preco;

      const correspondePrecoMinimo =
        precoMinimo === "" || preco >= Number(precoMinimo);

      const correspondePrecoMaximo =
        precoMaximo === "" || preco <= Number(precoMaximo);

      return (
        correspondeBusca &&
        correspondeMarca &&
        correspondeCategoria &&
        correspondePrecoMinimo &&
        correspondePrecoMaximo
      );
    });

    switch (ordenacao) {
      case "menor-preco":
        resultado.sort(
          (a, b) =>
            (a.precoPromocional ?? a.preco) -
            (b.precoPromocional ?? b.preco)
        );
        break;

      case "maior-preco":
        resultado.sort(
          (a, b) =>
            (b.precoPromocional ?? b.preco) -
            (a.precoPromocional ?? a.preco)
        );
        break;

      case "nome-az":
        resultado.sort((a, b) => a.nome.localeCompare(b.nome));
        break;

      case "nome-za":
        resultado.sort((a, b) => b.nome.localeCompare(a.nome));
        break;

      default:
        break;
    }

    return resultado;
  }, [
    busca,
    marca,
    categoria,
    precoMinimo,
    precoMaximo,
    ordenacao
  ]);

  function limparFiltros() {
    setBusca("");
    setMarca("");
    setCategoria("");
    setPrecoMinimo("");
    setPrecoMaximo("");
    setOrdenacao("relevancia");
  }

  return (
    <main className="catalogo">
      <PromotionsCarousel />

      <ProductFilters
        busca={busca}
        setBusca={setBusca}
        marca={marca}
        setMarca={setMarca}
        categoria={categoria}
        setCategoria={setCategoria}
        precoMinimo={precoMinimo}
        setPrecoMinimo={setPrecoMinimo}
        precoMaximo={precoMaximo}
        setPrecoMaximo={setPrecoMaximo}
        ordenacao={ordenacao}
        setOrdenacao={setOrdenacao}
        marcas={marcas}
        categorias={categorias}
        limparFiltros={limparFiltros}
      />

      <section className="catalogo__products">
        <div className="catalogo__products-header">
          <h2>Nossos perfumes</h2>

          <span>
            {produtosFiltrados.length}{" "}
            {produtosFiltrados.length === 1
              ? "produto encontrado"
              : "produtos encontrados"}
          </span>
        </div>

        {produtosFiltrados.length > 0 ? (
          <div className="catalogo__grid">
            {produtosFiltrados.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <div className="catalogo__empty">
            <h3>Nenhum perfume encontrado</h3>

            <p>
              Tente alterar os filtros ou buscar por outro nome.
            </p>

            <button type="button" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Catalogo;