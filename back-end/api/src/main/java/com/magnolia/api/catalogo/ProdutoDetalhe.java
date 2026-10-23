package com.magnolia.api.catalogo;

import java.util.List;

// Tudo o que a página do produto mostra. Preços em centavos.
public record ProdutoDetalhe(
		Long id,
		String slug,
		String nome,
		String descricao,
		String marca,
		String marcaSlug,
		String categoria,
		String categoriaSlug,
		Concentracao concentracao,
		String familiaOlfativa,
		String notasTopo,
		String notasCoracao,
		String notasFundo,
		List<Imagem> imagens,
		List<VarianteDetalhe> variantes) {

	public record Imagem(String url, String alt) {
	}

	public record VarianteDetalhe(Long id, int volumeMl, String sku, int preco, Integer precoPromocional,
			boolean emEstoque) {
	}

	public static ProdutoDetalhe de(Produto produto) {
		return new ProdutoDetalhe(
				produto.getId(),
				produto.getSlug(),
				produto.getNome(),
				produto.getDescricao(),
				produto.getMarca().getNome(),
				produto.getMarca().getSlug(),
				produto.getCategoria().getNome(),
				produto.getCategoria().getSlug(),
				produto.getConcentracao(),
				produto.getFamiliaOlfativa(),
				produto.getNotasTopo(),
				produto.getNotasCoracao(),
				produto.getNotasFundo(),
				produto.getImagens().stream().map(i -> new Imagem(i.getUrl(), i.getAlt())).toList(),
				produto.getVariantes().stream()
						.map(v -> new VarianteDetalhe(v.getId(), v.getVolumeMl(), v.getSku(), v.getPrecoCentavos(),
								v.temDesconto() ? v.getPrecoPromocionalCentavos() : null, v.getEstoque() > 0))
						.toList());
	}
}
