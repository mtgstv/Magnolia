package com.magnolia.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

import jakarta.servlet.http.Cookie;

// Base dos testes: sobe a API inteira com um Postgres descartável (Testcontainers).
// Todas as classes usam a mesma configuração, então o Spring reaproveita o contexto e o banco.
// Perfil dev: usa os perfumes de exemplo e as configurações locais (o banco vem do Testcontainers).
@SpringBootTest
@ActiveProfiles("dev")
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
public abstract class TesteDeIntegracao {

	protected static final String SENHA = "senha-segura-123";

	private static final AtomicInteger CONTADOR_IP = new AtomicInteger();

	@Autowired
	protected MockMvc mvc;

	protected record ContaDeTeste(String email, Cookie[] cookies) {
	}

	// Cria uma conta nova (e-mail único) e devolve os cookies de login.
	// Cada cadastro vem de um IP diferente para não esbarrar no limite de tentativas.
	protected ContaDeTeste cadastrar() throws Exception {
		String email = "cliente-" + UUID.randomUUID() + "@magnolia.com";
		String ip = novoIp();
		Cookie[] cookies = mvc.perform(post("/auth/cadastro")
				.with(requisicao -> {
					requisicao.setRemoteAddr(ip);
					return requisicao;
				})
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome": "Cliente de Teste", "email": "%s", "senha": "%s"}
						""".formatted(email, SENHA)))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getCookies();

		return new ContaDeTeste(email, cookies);
	}

	// Entra com a conta de administrador dos dados de exemplo (db/exemplo/R__dados_de_exemplo.sql)
	protected Cookie[] entrarComoAdmin() throws Exception {
		String ip = novoIp();
		return mvc.perform(post("/auth/login")
				.with(requisicao -> {
					requisicao.setRemoteAddr(ip);
					return requisicao;
				})
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"email": "admin@magnolia.com", "senha": "magnolia-admin-123"}
						"""))
				.andExpect(status().isOk())
				.andReturn().getResponse().getCookies();
	}

	// Id de um volume dos perfumes de exemplo (ex.: varianteDe("sauvage-eau-de-parfum", 60))
	protected long varianteDe(String slug, int volumeMl) throws Exception {
		String json = mvc.perform(get("/produtos/" + slug)).andReturn().getResponse().getContentAsString();
		List<Number> ids = JsonPath.read(json, "$.variantes[?(@.volumeMl == " + volumeMl + ")].id");
		return ids.getFirst().longValue();
	}

	private static String novoIp() {
		int numero = CONTADOR_IP.incrementAndGet();
		return "10.0." + numero / 250 + "." + (numero % 250 + 1);
	}
}
