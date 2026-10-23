package com.magnolia.api.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.magnolia.api.auth.AuthDtos.CadastroRequest;
import com.magnolia.api.auth.AuthDtos.LoginRequest;
import com.magnolia.api.auth.AuthDtos.SessaoIniciada;
import com.magnolia.api.comum.ErroResponse;
import com.magnolia.api.usuario.UsuarioResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService auth;
	private final CookiesDeSessao cookies;

	// Cadastro já deixa a pessoa logada
	@PostMapping("/cadastro")
	public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody CadastroRequest dados) {
		SessaoIniciada sessao = auth.cadastrar(dados);
		return ResponseEntity.status(HttpStatus.CREATED).headers(cookies.criar(sessao)).body(sessao.usuario());
	}

	@PostMapping("/login")
	public ResponseEntity<UsuarioResponse> entrar(@Valid @RequestBody LoginRequest dados) {
		SessaoIniciada sessao = auth.entrar(dados);
		return ResponseEntity.ok().headers(cookies.criar(sessao)).body(sessao.usuario());
	}

	// 200 + usuário: sessão renovada.
	// 204: não há login salvo neste navegador (visitante); apaga um cookie de acesso que tenha sobrado.
	// 401: o login salvo venceu ou foi encerrado; os cookies são apagados.
	@PostMapping("/refresh")
	public ResponseEntity<?> renovar(@CookieValue(name = CookiesDeSessao.RENOVACAO, required = false) String token) {
		if (token == null || token.isBlank()) {
			return ResponseEntity.noContent().headers(cookies.limpar()).build();
		}

		return auth.renovar(token)
				.<ResponseEntity<?>>map(sessao -> ResponseEntity.ok().headers(cookies.criar(sessao)).body(sessao.usuario()))
				.orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.headers(cookies.limpar())
						.body(ErroResponse.de("Sua sessão expirou. Entre novamente.")));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> sair(@CookieValue(name = CookiesDeSessao.RENOVACAO, required = false) String token) {
		if (token != null && !token.isBlank()) {
			auth.sair(token);
		}
		return ResponseEntity.noContent().headers(cookies.limpar()).build();
	}
}
