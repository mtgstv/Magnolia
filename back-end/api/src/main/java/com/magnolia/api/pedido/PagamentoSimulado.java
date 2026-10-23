package com.magnolia.api.pedido;

import java.time.YearMonth;
import java.util.Locale;

import org.springframework.http.HttpStatus;

import com.magnolia.api.comum.ErroApiException;
import com.magnolia.api.pedido.PedidoDtos.CartaoRequest;

// Pagamento de mentira, para testar a loja sem cobrar ninguém.
// - Cartão: qualquer número válido é aprovado, menos o 4000 0000 0000 0002, que simula um cartão recusado.
//   Para testar, use 4111 1111 1111 1111 com qualquer nome, uma validade futura e qualquer CVV.
// - Pix: gera um código "copia e cola" de teste; o pagamento é confirmado pelo botão "Simular pagamento".
// Para cobrar de verdade, troque esta classe pela integração com um provedor (ex.: Mercado Pago).
final class PagamentoSimulado {

	static final String CARTAO_RECUSADO = "4000000000000002";

	private PagamentoSimulado() {
	}

	// Confere o formato do cartão (erro 400 com a mensagem para o cliente)
	static String validarCartao(CartaoRequest cartao) {
		String numero = cartao.numero().replaceAll("[\\s-]", "");
		if (!numero.matches("\\d{13,19}") || !passaNoLuhn(numero)) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, "Número de cartão inválido. Confira os dígitos.");
		}

		int mes = Integer.parseInt(cartao.validade().substring(0, 2));
		int ano = 2000 + Integer.parseInt(cartao.validade().substring(3));
		if (mes < 1 || mes > 12 || YearMonth.of(ano, mes).isBefore(YearMonth.now())) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, "Cartão vencido ou validade inválida.");
		}
		return numero;
	}

	// "Cobra" o cartão. Chamado por último no checkout: se recusar, nada do pedido fica salvo.
	static void cobrar(String numeroCartao) {
		if (CARTAO_RECUSADO.equals(numeroCartao)) {
			throw new ErroApiException(HttpStatus.PAYMENT_REQUIRED,
					"Pagamento recusado pelo banco. Tente outro cartão ou pague com Pix.");
		}
	}

	// Código de teste: não funciona em nenhum banco
	static String codigoPix(String numeroPedido, int totalCentavos) {
		String valor = String.format(Locale.ROOT, "%.2f", totalCentavos / 100.0);
		return "PIX-TESTE-MAGNOLIA-" + numeroPedido + "-BRL" + valor;
	}

	// Algoritmo de Luhn: o último dígito do cartão confere os outros (pega erros de digitação)
	private static boolean passaNoLuhn(String numero) {
		int soma = 0;
		boolean dobrar = false;
		for (int i = numero.length() - 1; i >= 0; i--) {
			int digito = numero.charAt(i) - '0';
			if (dobrar) {
				digito *= 2;
				if (digito > 9) {
					digito -= 9;
				}
			}
			soma += digito;
			dobrar = !dobrar;
		}
		return soma % 10 == 0;
	}
}
