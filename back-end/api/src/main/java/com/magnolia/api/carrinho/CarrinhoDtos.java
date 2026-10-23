package com.magnolia.api.carrinho;

import java.util.List;

import com.magnolia.api.catalogo.Produto;
import com.magnolia.api.catalogo.Variante;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Corpos de requisição/resposta da sacola. Valores em centavos.
public final class CarrinhoDtos {

	private CarrinhoDtos() {
	}

	public record NovoItemRequest(
			@NotNull(message = "Escolha o volume do perfume.")
			Long varianteId,

			@Min(value = 1, message = "A quantidade mínima é 1.")
			@Max(value = CarrinhoService.QUANTIDADE_MAXIMA, message = "A quantidade máxima é 10.")
			Integer quantidade) {
	}

	public record QuantidadeRequest(
			@Min(value = 1, message = "A quantidade mínima é 1.")
			@Max(value = CarrinhoService.QUANTIDADE_MAXIMA, message = "A quantidade máxima é 10.")
			int quantidade) {
	}

	public record CupomRequest(@NotBlank(message = "Digite o código do cupom.") String codigo) {
	}

	// Mesmo formato que o front-end já usava quando a sacola ficava no navegador.
	// estoque: quantas unidades ainda existem (0 = esgotou depois de ir para a sacola).
	public record ItemResponse(Long varianteId, Long produtoId, String slug, String nome, String marca,
			String imagem, int volumeMl, int preco, Integer precoPromocional, int quantidade, int estoque) {

		static ItemResponse de(ItemCarrinho item) {
			Variante variante = item.getVariante();
			Produto produto = variante.getProduto();
			return new ItemResponse(variante.getId(), produto.getId(), produto.getSlug(), produto.getNome(),
					produto.getMarca().getNome(), produto.imagemPrincipal().orElse(null), variante.getVolumeMl(),
					variante.getPrecoCentavos(), variante.temDesconto() ? variante.getPrecoPromocionalCentavos() : null,
					item.getQuantidade(), item.estoqueDisponivel());
		}
	}

	public record CupomResponse(String codigo, String descricao) {
	}

	// frete: estimativa da entrega padrão (o valor certo depende do CEP, escolhido no checkout)
	public record Resumo(int subtotal, int economiaPromocoes, int desconto, int frete, boolean freteGratis,
			int faltaParaFreteGratis, int total) {

		public static Resumo calcular(List<ItemCarrinho> itens, Cupom cupom) {
			int subtotal = 0;
			int semPromocoes = 0;
			for (ItemCarrinho item : itens) {
				subtotal += item.getVariante().precoFinal() * item.getQuantidade();
				semPromocoes += item.getVariante().getPrecoCentavos() * item.getQuantidade();
			}

			int desconto = cupom == null ? 0 : cupom.desconto(subtotal);
			boolean freteGratis = subtotal >= Frete.GRATIS_A_PARTIR_DE;
			int frete = itens.isEmpty() || freteGratis ? 0 : Frete.ESTIMATIVA_SACOLA;

			return new Resumo(subtotal, semPromocoes - subtotal, desconto, frete, freteGratis,
					Math.max(0, Frete.GRATIS_A_PARTIR_DE - subtotal), subtotal - desconto + frete);
		}
	}

	public record CarrinhoResponse(List<ItemResponse> itens, CupomResponse cupom, Resumo resumo) {

		static final CarrinhoResponse VAZIO = new CarrinhoResponse(List.of(), null, Resumo.calcular(List.of(), null));

		static CarrinhoResponse de(Carrinho carrinho) {
			Cupom cupom = carrinho.getCupom();
			return new CarrinhoResponse(
					carrinho.getItens().stream().map(ItemResponse::de).toList(),
					cupom == null ? null : new CupomResponse(cupom.getCodigo(), cupom.getDescricao()),
					Resumo.calcular(carrinho.getItens(), cupom));
		}
	}
}
