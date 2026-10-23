package com.magnolia.api.catalogo;

// Respostas pequenas do catálogo, agrupadas para não espalhar arquivos de uma linha
public final class CatalogoRespostas {

	private CatalogoRespostas() {
	}

	public record MarcaResponse(Long id, String nome, String slug) {

		static MarcaResponse de(Marca marca) {
			return new MarcaResponse(marca.getId(), marca.getNome(), marca.getSlug());
		}
	}

	public record CategoriaResponse(Long id, String nome, String slug) {

		static CategoriaResponse de(Categoria categoria) {
			return new CategoriaResponse(categoria.getId(), categoria.getNome(), categoria.getSlug());
		}
	}

	public record PromocaoResponse(Long id, String titulo, String imagemUrl, String link) {

		static PromocaoResponse de(Promocao promocao) {
			return new PromocaoResponse(promocao.getId(), promocao.getTitulo(), promocao.getImagemUrl(),
					promocao.getLink());
		}
	}
}
