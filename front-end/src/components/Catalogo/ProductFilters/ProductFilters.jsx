import "./ProductFilters.css";

function ProductFilters({
  busca,
  setBusca,
  marca,
  setMarca,
  categoria,
  setCategoria,
  precoMinimo,
  setPrecoMinimo,
  precoMaximo,
  setPrecoMaximo,
  ordenacao,
  setOrdenacao,
  marcas = [],
  categorias = [],
  limparFiltros
}) {
  return (
    <section className="product-filters">
      <div className="product-filters__header">
        <div>
          <h2>Encontre seu perfume</h2>
          <p>Encontre a fragrância ideal para você.</p>
        </div>

        <button
          type="button"
          className="product-filters__clear"
          onClick={limparFiltros}
        >
          Limpar filtros
        </button>
      </div>

      <div className="product-filters__fields">
        <div className="product-filters__field product-filters__search">
          <label htmlFor="busca-perfume">Buscar perfume</label>

          <input
            id="busca-perfume"
            type="search"
            placeholder="Digite o nome do perfume..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <div className="product-filters__field">
          <label htmlFor="marca-perfume">Marca</label>

          <select
            id="marca-perfume"
            value={marca}
            onChange={(event) => setMarca(event.target.value)}
          >
            <option value="">Todas as marcas</option>

            {marcas.map((nomeMarca) => (
              <option key={nomeMarca} value={nomeMarca}>
                {nomeMarca}
              </option>
            ))}
          </select>
        </div>

        <div className="product-filters__field">
          <label htmlFor="categoria-perfume">Categoria</label>

          <select
            id="categoria-perfume"
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
          >
            <option value="">Todas as categorias</option>

            {categorias.map((nomeCategoria) => (
              <option key={nomeCategoria} value={nomeCategoria}>
                {nomeCategoria}
              </option>
            ))}
          </select>
        </div>

        <div className="product-filters__field product-filters__price">
          <label>Faixa de preço (R$)</label>

          <div className="product-filters__price-inputs">
            <input
              type="number"
              placeholder="Mínimo"
              aria-label="Preço mínimo"
              min="0"
              value={precoMinimo}
              onChange={(event) => setPrecoMinimo(event.target.value)}
            />

            <span>até</span>

            <input
              type="number"
              placeholder="Máximo"
              aria-label="Preço máximo"
              min="0"
              value={precoMaximo}
              onChange={(event) => setPrecoMaximo(event.target.value)}
            />
          </div>
        </div>

        <div className="product-filters__field">
          <label htmlFor="ordenacao-perfume">Ordenar por</label>

          <select
            id="ordenacao-perfume"
            value={ordenacao}
            onChange={(event) => setOrdenacao(event.target.value)}
          >
            <option value="relevancia">Relevância</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
            <option value="nome-az">Nome: A–Z</option>
            <option value="nome-za">Nome: Z–A</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export default ProductFilters;