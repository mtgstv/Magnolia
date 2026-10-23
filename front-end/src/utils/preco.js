// Os preços chegam em centavos (ex.: 89990 = R$ 899,90)
export function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function precoAtual(produto) {
  return produto.precoPromocional ?? produto.preco;
}

export function temDesconto(produto) {
  return (
    produto.precoPromocional != null &&
    produto.precoPromocional < produto.preco
  );
}

export function percentualDesconto(produto) {
  if (!temDesconto(produto)) {
    return 0;
  }

  return Math.round(
    ((produto.preco - produto.precoPromocional) / produto.preco) * 100
  );
}
