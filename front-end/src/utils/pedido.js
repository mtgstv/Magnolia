// Textos e formatos usados no checkout e nas páginas de pedidos

export const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export const STATUS_PEDIDO = {
  AGUARDANDO_PAGAMENTO: { rotulo: "Aguardando pagamento", classe: "bg-amber-50 text-amber-800 ring-amber-200" },
  PAGO: { rotulo: "Pagamento aprovado", classe: "bg-marca-clara text-marca-escura ring-marca/20" },
  ENVIADO: { rotulo: "A caminho", classe: "bg-sky-50 text-sky-800 ring-sky-200" },
  ENTREGUE: { rotulo: "Entregue", classe: "bg-marca-clara text-marca-escura ring-marca/20" },
  CANCELADO: { rotulo: "Cancelado", classe: "bg-stone-100 text-stone-600 ring-stone-200" }
};

// "01310100" -> "01310-100"
export function formatarCep(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);
  return numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
}

// "4111111111111111" -> "4111 1111 1111 1111"
export function formatarCartao(valor) {
  return valor.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

// "1240" -> "12/40"
export function formatarValidade(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 4);
  return numeros.length > 2 ? `${numeros.slice(0, 2)}/${numeros.slice(2)}` : numeros;
}

export function formatarData(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
