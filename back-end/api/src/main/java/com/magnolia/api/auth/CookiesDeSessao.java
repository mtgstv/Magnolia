package com.magnolia.api.auth;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import com.magnolia.api.auth.AuthDtos.SessaoIniciada;
import com.magnolia.api.config.AuthProperties;

// Os tokens ficam em cookies HttpOnly: o JavaScript da página não consegue lê-los,
// o que protege o login contra scripts maliciosos (XSS).
@Component
public class CookiesDeSessao {

	public static final String ACESSO = "magnolia_acesso";
	public static final String RENOVACAO = "magnolia_renovacao";

	private final AuthProperties auth;
	private final String caminhoApi;
	private final String caminhoAuth;

	public CookiesDeSessao(AuthProperties auth, @Value("${server.servlet.context-path:}") String contextPath) {
		this.auth = auth;
		this.caminhoApi = contextPath.isEmpty() ? "/" : contextPath;
		// O token de renovação só é enviado para /auth (login, renovação e logout)
		this.caminhoAuth = contextPath + "/auth";
	}

	public HttpHeaders criar(SessaoIniciada sessao) {
		HttpHeaders cabecalhos = new HttpHeaders();
		cabecalhos.add(HttpHeaders.SET_COOKIE,
				cookie(ACESSO, sessao.tokenAcesso(), caminhoApi, auth.duracaoAcesso()).toString());

		if (sessao.tokenRenovacao() != null) {
			cabecalhos.add(HttpHeaders.SET_COOKIE,
					cookie(RENOVACAO, sessao.tokenRenovacao(), caminhoAuth, auth.duracaoRenovacao()).toString());
		}
		return cabecalhos;
	}

	public HttpHeaders limpar() {
		HttpHeaders cabecalhos = new HttpHeaders();
		cabecalhos.add(HttpHeaders.SET_COOKIE, cookie(ACESSO, "", caminhoApi, Duration.ZERO).toString());
		cabecalhos.add(HttpHeaders.SET_COOKIE, cookie(RENOVACAO, "", caminhoAuth, Duration.ZERO).toString());
		return cabecalhos;
	}

	private ResponseCookie cookie(String nome, String valor, String caminho, Duration duracao) {
		return ResponseCookie.from(nome, valor)
				.httpOnly(true)
				.secure(auth.cookieSeguro())
				// Lax: o navegador não envia o cookie em formulários vindos de outros sites (proteção contra CSRF)
				.sameSite("Lax")
				.path(caminho)
				.maxAge(duracao)
				.build();
	}
}
