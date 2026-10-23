import ProductCard from "./ProductCard";

// Grade de cards. Enquanto carrega (e ainda não há nada para mostrar), exibe cards "fantasmas".
// className define as colunas de cada tamanho de tela.
export default function GradeProdutos({
  produtos = [],
  carregando = false,
  quantidadeCarregando = 4,
  className = "grid-cols-2 lg:grid-cols-4"
}) {
  const mostrarEsqueleto = carregando && produtos.length === 0;

  return (
    <div className={`grid gap-x-4 gap-y-10 sm:gap-x-6 ${className}`} aria-busy={carregando || undefined}>
      {mostrarEsqueleto
        ? Array.from({ length: quantidadeCarregando }, (_, indice) => <CardCarregando key={indice} />)
        : produtos.map((produto) => <ProductCard key={produto.id} produto={produto} />)}
    </div>
  );
}

function CardCarregando() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[4/5] rounded-2xl bg-areia" />
      <div className="mt-4 h-3 w-1/3 rounded-full bg-areia" />
      <div className="mt-3 h-5 w-2/3 rounded-full bg-areia" />
      <div className="mt-3 h-4 w-1/4 rounded-full bg-areia" />
    </div>
  );
}
