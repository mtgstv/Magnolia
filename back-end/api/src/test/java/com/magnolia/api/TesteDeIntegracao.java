package com.magnolia.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

// Base dos testes: sobe a API inteira com um Postgres descartável (Testcontainers).
// Todas as classes usam a mesma configuração, então o Spring reaproveita o contexto e o banco.
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
public abstract class TesteDeIntegracao {

	protected static final String SENHA = "senha-segura-123";

	@Autowired
	protected MockMvc mvc;

	protected record ContaDeTeste(String email, Cookie[] cookies) {
	}

	// Cria uma conta nova (e-mail único) e devolve os cookies de login
	protected ContaDeTeste cadastrar() throws Exception {
		String email = "cliente-" + UUID.randomUUID() + "@magnolia.com";
		Cookie[] cookies = mvc.perform(post("/auth/cadastro")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome": "Cliente de Teste", "email": "%s", "senha": "%s"}
						""".formatted(email, SENHA)))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getCookies();

		return new ContaDeTeste(email, cookies);
	}
}
