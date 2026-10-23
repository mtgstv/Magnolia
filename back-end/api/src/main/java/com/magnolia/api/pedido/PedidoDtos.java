package com.magnolia.api.pedido;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.magnolia.api.carrinho.Frete;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Corpos de requisição/resposta dos pedidos. Valores em centavos.
public final class PedidoDtos {

	private PedidoDtos() {
	}

	// ===== Checkout =====

	public record NovoPedidoRequest(
			@NotNull(message = "Informe o endereço de entrega.") @Valid EnderecoRequest endereco,
			@NotNull(message = "Escolha a forma de entrega.") Frete.Tipo frete,
			@NotNull(message = "Escolha a forma de pagamento.") @Valid PagamentoRequest pagamento) {
	}

	public record EnderecoRequest(
			@NotBlank(message = "Informe quem vai receber.")
			@Size(max = 150, message = "Use até 150 caracteres.")
			String destinatario,

			@NotBlank(message = "Informe o CEP.")
			@Pattern(regexp = "\\d{5}-?\\d{3}", message = "Informe um CEP válido, com 8 números.")
			String cep,

			@NotBlank(message = "Informe a rua.")
			@Size(max = 200, message = "Use até 200 caracteres.")
			String rua,

			@NotBlank(message = "Informe o número.")
			@Size(max = 20, message = "Use até 20 caracteres.")
			String numero,

			@Size(max = 100, message = "Use até 100 caracteres.")
			String complemento,

			@NotBlank(message = "Informe o bairro.")
			@Size(max = 100, message = "Use até 100 caracteres.")
			String bairro,

			@NotBlank(message = "Informe a cidade.")
			@Size(max = 100, message = "Use até 100 caracteres.")
			String cidade,

			@NotBlank(message = "Informe o estado.")
			@Pattern(regexp = "[A-Za-z]{2}", message = "Use a sigla do estado (ex.: SP).")
			String uf) {
	}

	public record PagamentoRequest(
			@NotNull(message = "Escolha a forma de pagamento.") MetodoPagamento metodo,
			@Valid CartaoRequest cartao) {
	}

	// O número e o CVV só são conferidos; nunca são guardados
	public record CartaoRequest(
			@NotBlank(message = "Informe o número do cartão.")
			String numero,

			@NotBlank(message = "Informe o nome impresso no cartão.")
			@Size(max = 100, message = "Use até 100 caracteres.")
			String nome,

			@NotBlank(message = "Informe a validade.")
			@Pattern(regexp = "\\d{2}/\\d{2}", message = "Use o formato MM/AA.")
			String validade,

			@NotBlank(message = "Informe o código de segurança.")
			@Pattern(regexp = "\\d{3,4}", message = "O código tem 3 ou 4 números.")
			String cvv,

			@Min(value = 1, message = "Escolha de 1 a 3 parcelas.")
			@Max(value = 3, message = "Escolha de 1 a 3 parcelas.")
			Integer parcelas) {
	}

	// ===== Respostas =====

	public record ItemResponse(String slug, String nome, String marca, String imagem, int volumeMl, int preco,
			int quantidade) {

		static ItemResponse de(ItemPedido item) {
			return new ItemResponse(item.getProdutoSlug(), item.getNomeProduto(), item.getMarca(), item.getImagem(),
					item.getVolumeMl(), item.getPrecoUnitarioCentavos(), item.getQuantidade());
		}
	}

	public record EnderecoResponse(String destinatario, String cep, String rua, String numero, String complemento,
			String bairro, String cidade, String uf) {

		static EnderecoResponse de(EnderecoEntrega e) {
			return new EnderecoResponse(e.getDestinatario(), e.getCep(), e.getRua(), e.getNumero(), e.getComplemento(),
					e.getBairro(), e.getCidade(), e.getUf());
		}
	}

	public record EntregaResponse(Frete.Tipo tipo, String prazo) {
	}

	// pixCopiaECola só aparece enquanto o Pix não foi pago
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public record PagamentoResponse(MetodoPagamento metodo, String status, String cartaoFinal, Integer parcelas,
			String pixCopiaECola, Instant pagoEm) {

		static PagamentoResponse de(Pagamento p) {
			boolean pendente = Pagamento.PENDENTE.equals(p.getStatus());
			return new PagamentoResponse(p.getMetodo(), p.getStatus(), p.getCartaoFinal(), p.getParcelas(),
					pendente ? p.getPixCopiaECola() : null, p.getPagoEm());
		}
	}

	public record PedidoResponse(String numero, StatusPedido status, Instant criadoEm, List<ItemResponse> itens,
			EnderecoResponse endereco, EntregaResponse entrega, String cupom, int subtotal, int desconto, int frete,
			int total, PagamentoResponse pagamento) {

		public static PedidoResponse de(Pedido p) {
			return new PedidoResponse(p.getNumero(), p.getStatus(), p.getCriadoEm(),
					p.getItens().stream().map(ItemResponse::de).toList(),
					EnderecoResponse.de(p.getEntrega()),
					new EntregaResponse(p.getFreteTipo(), p.getFretePrazo()),
					p.getCupomCodigo(), p.getSubtotalCentavos(), p.getDescontoCentavos(), p.getFreteCentavos(),
					p.getTotalCentavos(), PagamentoResponse.de(p.pagamento()));
		}
	}
}
