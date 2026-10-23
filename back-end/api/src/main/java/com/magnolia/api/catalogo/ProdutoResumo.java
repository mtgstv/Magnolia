package com.magnolia.api.catalogo;

import java.time.Instant;
import java.util.List;

// Dados de um perfume para cards e listas (catálogo, home, favoritos).
// Preços em centavos, da variante mais barata ("a partir de").
// descontoMaximo: maior desconto (%) entre todos os volumes; 0 = nenhum em oferta.
// Pode ser maior que zero mesmo sem desconto no volume mais barato.
public record ProdutoResumo(
		Long id,
		String slug,
		String nome,
		String marca,
		String marcaSlug,
		String categoria,
		String categoriaSlug,
		Concentracao concentracao,
		String familiaOlfativa,
		String imagem,
		List<Integer> volumes,
		int preco,
		Integer precoPromocional,
		int descontoMaximo,
		boolean emEstoque,
		Instant criadoEm) {

	// O produto precisa ter ao menos uma variante (quem chama filtra com temVariante)
	public static ProdutoResumo de(Produto produto) {
		Variante maisBarata = produto.varianteMaisBarata().orElseThrow();

		return new ProdutoResumo(
				produto.getId(),
				produto.getSlug(),
				produto.getNome(),
				produto.getMarca().getNome(),
				produto.getMarca().getSlug(),
				produto.getCategoria().getNome(),
				produto.getCategoria().getSlug(),
				produto.getConcentracao(),
				produto.getFamiliaOlfativa(),
				produto.imagemPrincipal().orElse(null),
				produto.getVariantes().stream().map(Variante::getVolumeMl).toList(),
				maisBarata.getPrecoCentavos(),
				maisBarata.temDesconto() ? maisBarata.getPrecoPromocionalCentavos() : null,
				produto.getVariantes().stream().mapToInt(Variante::percentualDesconto).max().orElse(0),
				produto.getVariantes().stream().anyMatch(v -> v.getEstoque() > 0),
				produto.getCriadoEm());
	}

	public static boolean temVariante(Produto produto) {
		return !produto.getVariantes().isEmpty();
	}
}
