package com.magnolia.api.carrinho;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import com.magnolia.api.config.AuthProperties;

// Cookie que identifica a sacola de quem ainda não fez login.
// Igual aos cookies de login: HttpOnly (o JavaScript não lê) e o banco guarda só o hash do valor.
@Component
public class CookieCarrinho {

	public static final String NOME = "magnolia_carrinho";

	private static final Duration DURACAO = Duration.ofDays(30);
	private static final SecureRandom ALEATORIO = new SecureRandom();

	private final AuthProperties auth;
	private final String caminho;

	public CookieCarrinho(AuthProperties auth, @Value("${server.servlet.context-path:}") String contextPath) {
		this.auth = auth;
		// Só as rotas da sacola recebem este cookie
		this.caminho = contextPath + "/carrinho";
	}

	public static String novoToken() {
		byte[] bytes = new byte[32];
		ALEATORIO.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	// Descarta valores estranhos (vazios ou grandes demais) que alguém tenha colocado no cookie
	public static boolean valido(String token) {
		return token != null && !token.isBlank() && token.length() <= 100;
	}

	public String criar(String token) {
		return cookie(token, DURACAO);
	}

	public String limpar() {
		return cookie("", Duration.ZERO);
	}

	private String cookie(String valor, Duration duracao) {
		return ResponseCookie.from(NOME, valor)
				.httpOnly(true)
				.secure(auth.cookieSeguro())
				.sameSite("Lax")
				.path(caminho)
				.maxAge(duracao)
				.build()
				.toString();
	}
}
