package com.magnolia.api.favorito;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.magnolia.api.catalogo.ProdutoResumo;
import com.magnolia.api.usuario.UsuarioLogado;

import lombok.RequiredArgsConstructor;

// Rotas do usuário logado (exigem login, ver SecurityConfig)
@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class FavoritoController {

	private final FavoritoService favoritos;

	@GetMapping("/favoritos")
	public List<ProdutoResumo> listar(@AuthenticationPrincipal Jwt token) {
		return favoritos.listar(UsuarioLogado.id(token));
	}

	// PUT porque repetir a chamada não muda o resultado (o perfume continua favoritado)
	@PutMapping("/favoritos/{produtoId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void adicionar(@AuthenticationPrincipal Jwt token, @PathVariable Long produtoId) {
		favoritos.adicionar(UsuarioLogado.id(token), produtoId);
	}

	@DeleteMapping("/favoritos/{produtoId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void remover(@AuthenticationPrincipal Jwt token, @PathVariable Long produtoId) {
		favoritos.remover(UsuarioLogado.id(token), produtoId);
	}

	@GetMapping("/recomendacoes")
	public List<ProdutoResumo> recomendar(@AuthenticationPrincipal Jwt token) {
		return favoritos.recomendar(UsuarioLogado.id(token));
	}
}
