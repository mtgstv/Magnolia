package com.magnolia.api.usuario;

import org.springframework.security.oauth2.jwt.Jwt;

// O "subject" do token de acesso é o id do usuário (ver TokenService)
public final class UsuarioLogado {

	private UsuarioLogado() {
	}

	public static Long id(Jwt token) {
		return Long.valueOf(token.getSubject());
	}
}
