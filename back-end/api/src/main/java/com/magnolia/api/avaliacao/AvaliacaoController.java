package com.magnolia.api.avaliacao;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.magnolia.api.avaliacao.AvaliacaoDtos.AvaliacaoRequest;
import com.magnolia.api.avaliacao.AvaliacaoDtos.AvaliacoesResponse;
import com.magnolia.api.usuario.UsuarioLogado;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Ver as avaliações é público; avaliar exige login (ver SecurityConfig)
@RestController
@RequiredArgsConstructor
public class AvaliacaoController {

	private final AvaliacaoService avaliacoes;

	@GetMapping("/produtos/{slug}/avaliacoes")
	public AvaliacoesResponse listar(@AuthenticationPrincipal Jwt token, @PathVariable String slug) {
		return avaliacoes.listar(slug, token == null ? null : UsuarioLogado.id(token));
	}

	// PUT: cria a avaliação do cliente ou edita a que ele já tinha
	@PutMapping("/produtos/{slug}/avaliacoes")
	public AvaliacoesResponse salvar(@AuthenticationPrincipal Jwt token, @PathVariable String slug,
			@Valid @RequestBody AvaliacaoRequest dados) {
		return avaliacoes.salvar(slug, UsuarioLogado.id(token), dados);
	}

	@DeleteMapping("/produtos/{slug}/avaliacoes")
	public AvaliacoesResponse remover(@AuthenticationPrincipal Jwt token, @PathVariable String slug) {
		return avaliacoes.remover(slug, UsuarioLogado.id(token));
	}
}
