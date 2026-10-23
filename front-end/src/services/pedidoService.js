import { requisicao } from "./api";

// dados: { endereco, frete: "PADRAO" | "EXPRESSA", pagamento: { metodo: "PIX" | "CARTAO", cartao? } }
export function criarPedido(dados) {
  return requisicao("/pedidos", { method: "POST", corpo: dados });
}

export function listarPedidos() {
  return requisicao("/pedidos");
}

export function buscarPedido(numero) {
  return requisicao(`/pedidos/${encodeURIComponent(numero)}`);
}

// Só existe porque o pagamento é de teste: confirma o Pix como se o banco tivesse avisado
export function simularPagamentoPix(numero) {
  return requisicao(`/pedidos/${encodeURIComponent(numero)}/simular-pagamento`, { method: "POST" });
}
