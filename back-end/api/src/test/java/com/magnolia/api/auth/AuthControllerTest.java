package com.magnolia.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.magnolia.api.TesteDeIntegracao;

import jakarta.servlet.http.Cookie;

class AuthControllerTest extends TesteDeIntegracao {

	@Test
	void cadastroJaDeixaOUsuarioLogadoComCookiesHttpOnly() throws Exception {
		ContaDeTeste conta = cadastrar();

		Cookie acesso = cookieChamado(conta.cookies(), CookiesDeSessao.ACESSO);
		assertThat(acesso.isHttpOnly()).isTrue();
		assertThat(cookieChamado(conta.cookies(), CookiesDeSessao.RENOVACAO).isHttpOnly()).isTrue();

		mvc.perform(get("/me").cookie(acesso))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value(conta.email()))
				.andExpect(jsonPath("$.papel").value("CLIENTE"));
	}

	@Test
	void naoAceitaDoisCadastrosComOMesmoEmail() throws Exception {
		ContaDeTeste conta = cadastrar();

		mvc.perform(post("/auth/cadastro")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome": "Outra pessoa", "email": "%s", "senha": "outra-senha-123"}
						""".formatted(conta.email().toUpperCase())))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Já existe uma conta com este e-mail."));
	}

	@Test
	void cadastroInvalidoDevolveOErroDeCadaCampo() throws Exception {
		mvc.perform(post("/auth/cadastro")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome": "", "email": "nao-e-email", "senha": "123"}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.campos.nome").value("Informe seu nome."))
				.andExpect(jsonPath("$.campos.email").value("Informe um e-mail válido."))
				.andExpect(jsonPath("$.campos.senha").value("A senha deve ter entre 8 e 72 caracteres."));
	}

	@Test
	void loginConfereASenha() throws Exception {
		ContaDeTeste conta = cadastrar();

		mvc.perform(post("/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"email": "%s", "senha": "senha-errada"}
						""".formatted(conta.email())))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.message").value("E-mail ou senha incorretos."));

		mvc.perform(post("/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"email": "%s", "senha": "%s"}
						""".formatted(conta.email(), SENHA)))
				.andExpect(status().isOk())
				.andExpect(cookie().httpOnly(CookiesDeSessao.ACESSO, true))
				.andExpect(cookie().exists(CookiesDeSessao.RENOVACAO));
	}

	@Test
	void rotasDoUsuarioExigemLogin() throws Exception {
		mvc.perform(get("/me")).andExpect(status().isUnauthorized());
		mvc.perform(get("/me").cookie(new Cookie(CookiesDeSessao.ACESSO, "token-falso")))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void renovacaoDaSessaoELogout() throws Exception {
		// Visitante sem login salvo: nada para renovar
		mvc.perform(post("/auth/refresh")).andExpect(status().isNoContent());

		Cookie renovacao = cookieChamado(cadastrar().cookies(), CookiesDeSessao.RENOVACAO);

		mvc.perform(post("/auth/refresh").cookie(renovacao))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nome").value("Cliente de Teste"))
				.andExpect(cookie().exists(CookiesDeSessao.ACESSO));

		mvc.perform(post("/auth/logout").cookie(renovacao))
				.andExpect(status().isNoContent())
				.andExpect(cookie().maxAge(CookiesDeSessao.ACESSO, 0))
				.andExpect(cookie().maxAge(CookiesDeSessao.RENOVACAO, 0));

		// Depois do logout o token de renovação não vale mais
		mvc.perform(post("/auth/refresh").cookie(renovacao))
				.andExpect(status().isUnauthorized())
				.andExpect(cookie().maxAge(CookiesDeSessao.RENOVACAO, 0));
	}

	@Test
	void senhaGrandeDemaisNaoDerrubaAApi() throws Exception {
		// 40 letras com acento = 80 bytes, acima do limite de 72 do BCrypt
		String senhaLonga = "ç".repeat(40);

		mvc.perform(post("/auth/cadastro")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome": "Cliente", "email": "acentos@magnolia.com", "senha": "%s"}
						""".formatted(senhaLonga)))
				.andExpect(status().isBadRequest());

		mvc.perform(post("/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"email": "%s", "senha": "%s"}
						""".formatted(cadastrar().email(), "a".repeat(200))))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.message").value("E-mail ou senha incorretos."));
	}

	@Test
	void bloqueiaMuitasTentativasDeLoginDoMesmoIp() throws Exception {
		for (int tentativa = 1; tentativa <= 11; tentativa++) {
			mvc.perform(post("/auth/login")
					.with(requisicao -> {
						requisicao.setRemoteAddr("203.0.113.7");
						return requisicao;
					})
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"email": "ninguem@magnolia.com", "senha": "chute-%d"}
							""".formatted(tentativa)))
					.andExpect(tentativa <= 10 ? status().isUnauthorized() : status().isTooManyRequests());
		}
	}

	private static Cookie cookieChamado(Cookie[] cookies, String nome) {
		return Arrays.stream(cookies).filter(c -> c.getName().equals(nome)).findFirst().orElseThrow();
	}
}
