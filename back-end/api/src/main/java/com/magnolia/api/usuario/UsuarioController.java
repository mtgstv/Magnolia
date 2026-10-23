package com.magnolia.api.usuario;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.magnolia.api.comum.ErroApiException;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UsuarioController {

	private final UsuarioRepository usuarios;

	@GetMapping("/me")
	public UsuarioResponse buscarPerfil(@AuthenticationPrincipal Jwt token) {
		return usuarios.findById(UsuarioLogado.id(token))
				.map(UsuarioResponse::de)
				.orElseThrow(() -> new ErroApiException(HttpStatus.UNAUTHORIZED, "Sessão inválida. Entre novamente."));
	}
}
