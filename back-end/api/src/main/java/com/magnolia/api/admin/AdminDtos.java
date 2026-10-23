package com.magnolia.api.admin;

import java.time.Instant;
import java.util.List;

import com.magnolia.api.catalogo.Concentracao;
import com.magnolia.api.catalogo.Produto;
import com.magnolia.api.catalogo.Promocao;
import com.magnolia.api.catalogo.Variante;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

// Corpos de requisição/resposta do painel admin. Preços em centavos.
public final class AdminDtos {

	private AdminDtos() {
	}

	// ===== Perfumes =====

	// slug vazio = gerado a partir do nome. imagemUrl: foto principal (ex.: /images/produtos/libre.jpg)
	public record ProdutoRequest(
			@NotBlank(message = "Informe o nome.") @Size(max = 150, message = "Use até 150 caracteres.") String nome,
			@Size(max = 180, message = "Use até 180 caracteres.") String slug,
			@NotNull(message = "Escolha a marca.") Long marcaId,
			@NotNull(message = "Escolha a categoria.") Long categoriaId,
			@NotNull(message = "Escolha a concentração.") Concentracao concentracao,
			String descricao,
			@Size(max = 60, message = "Use até 60 caracteres.") String familiaOlfativa,
			@Size(max = 255, message = "Use até 255 caracteres.") String notasTopo,
			@Size(max = 255, message = "Use até 255 caracteres.") String notasCoracao,
			@Size(max = 255, message = "Use até 255 caracteres.") String notasFundo,
			@Size(max = 500, message = "Use até 500 caracteres.") String imagemUrl,
			boolean ativo,
			@NotEmpty(message = "Cadastre pelo menos um volume.") @Valid List<VarianteRequest> variantes) {
	}

	// id null = volume novo. Volume que sumir da lista é apagado.
	public record VarianteRequest(
			Long id,
			@NotNull(message = "Informe o volume.") @Positive(message = "O volume deve ser maior que zero.") Integer volumeMl,
			@NotBlank(message = "Informe o SKU.") @Size(max = 60, message = "Use até 60 caracteres.") String sku,
			@NotNull(message = "Informe o preço.") @PositiveOrZero(message = "O preço não pode ser negativo.") Integer preco,
			@PositiveOrZero(message = "O preço não pode ser negativo.") Integer precoPromocional,
			@NotNull(message = "Informe o estoque.") @PositiveOrZero(message = "O estoque não pode ser negativo.") Integer estoque) {
	}

	public record VarianteResponse(Long id, int volumeMl, String sku, int preco, Integer precoPromocional,
			int estoque) {
	}

	public record ProdutoResponse(Long id, String nome, String slug, Long marcaId, String marca, Long categoriaId,
			String categoria, Concentracao concentracao, String descricao, String familiaOlfativa, String notasTopo,
			String notasCoracao, String notasFundo, String imagemUrl, boolean ativo, Instant criadoEm,
			List<VarianteResponse> variantes) {

		static ProdutoResponse de(Produto p) {
			return new ProdutoResponse(p.getId(), p.getNome(), p.getSlug(), p.getMarca().getId(), p.getMarca().getNome(),
					p.getCategoria().getId(), p.getCategoria().getNome(), p.getConcentracao(), p.getDescricao(),
					p.getFamiliaOlfativa(), p.getNotasTopo(), p.getNotasCoracao(), p.getNotasFundo(),
					p.imagemPrincipal().orElse(null), p.isAtivo(), p.getCriadoEm(),
					p.getVariantes().stream().map(AdminDtos::variante).toList());
		}
	}

	private static VarianteResponse variante(Variante v) {
		return new VarianteResponse(v.getId(), v.getVolumeMl(), v.getSku(), v.getPrecoCentavos(),
				v.getPrecoPromocionalCentavos(), v.getEstoque());
	}

	public record AtivoRequest(boolean ativo) {
	}

	public record MarcaRequest(
			@NotBlank(message = "Informe o nome da marca.") @Size(max = 100, message = "Use até 100 caracteres.") String nome) {
	}

	// ===== Promoções (banners do carrossel) =====

	public record PromocaoRequest(
			@NotBlank(message = "Informe o título.") @Size(max = 150, message = "Use até 150 caracteres.") String titulo,
			@NotBlank(message = "Informe a imagem.") @Size(max = 500, message = "Use até 500 caracteres.") String imagemUrl,
			@Size(max = 500, message = "Use até 500 caracteres.") String link,
			@NotNull(message = "Informe o início.") Instant inicio,
			@NotNull(message = "Informe o fim.") Instant fim,
			int ordem) {
	}

	// ativa: está no ar agora (entre o início e o fim)
	public record PromocaoResponse(Long id, String titulo, String imagemUrl, String link, Instant inicio, Instant fim,
			int ordem, boolean ativa) {

		static PromocaoResponse de(Promocao p) {
			Instant agora = Instant.now();
			return new PromocaoResponse(p.getId(), p.getTitulo(), p.getImagemUrl(), p.getLink(), p.getInicio(),
					p.getFim(), p.getOrdem(), !p.getInicio().isAfter(agora) && p.getFim().isAfter(agora));
		}
	}
}
