package com.magnolia.api.avaliacao;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AvaliacaoDtos {

	private AvaliacaoDtos() {
	}

	public record AvaliacaoRequest(
			@NotNull(message = "Escolha de 1 a 5 estrelas.")
			@Min(value = 1, message = "Escolha de 1 a 5 estrelas.")
			@Max(value = 5, message = "Escolha de 1 a 5 estrelas.")
			Integer nota,

			@Size(max = 100, message = "O título pode ter até 100 caracteres.")
			String titulo,

			@Size(max = 2000, message = "O comentário pode ter até 2000 caracteres.")
			String comentario) {
	}

	// autor: só o primeiro nome e a inicial do sobrenome (ex.: "Maria S."), para não expor o cliente.
	// minha: true na avaliação de quem está vendo a página (para mostrar "Editar").
	public record AvaliacaoResponse(Long id, String autor, int nota, String titulo, String comentario,
			Instant criadoEm, boolean compraVerificada, boolean minha) {
	}

	// distribuicao: quantas avaliações de cada nota, de 5 a 1 estrelas
	public record AvaliacoesResponse(double media, int total, Map<Integer, Long> distribuicao,
			List<AvaliacaoResponse> avaliacoes) {
	}
}
