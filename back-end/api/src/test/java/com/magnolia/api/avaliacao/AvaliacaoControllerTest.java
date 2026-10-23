package com.magnolia.api.avaliacao;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.jayway.jsonpath.JsonPath;
import com.magnolia.api.TesteDeIntegracao;

import jakarta.servlet.http.Cookie;

// Cada teste usa um perfume diferente, para as médias não se misturarem
class AvaliacaoControllerTest extends TesteDeIntegracao {

	@Test
	void avaliarExigeLoginMasVerEPublico() throws Exception {
		mvc.perform(get("/produtos/good-girl/avaliacoes")).andExpect(status().isOk());
		mvc.perform(put("/produtos/good-girl/avaliacoes")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nota": 5}
						"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void cadaClienteTemUmaAvaliacaoQuePodeEditar() throws Exception {
		Cookie[] ana = cadastrar().cookies();
		Cookie[] bia = cadastrar().cookies();

		avaliar(ana, "la-vie-est-belle", 5, "Maravilhoso");
		avaliar(bia, "la-vie-est-belle", 3, null);
		// Ana muda de ideia: edita a mesma avaliação em vez de criar outra
		mvc.perform(put("/produtos/la-vie-est-belle/avaliacoes").cookie(ana)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nota": 4, "titulo": "Muito bom", "comentario": "Dura o dia todo."}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.total").value(2))
				.andExpect(jsonPath("$.media").value(3.5))
				.andExpect(jsonPath("$.distribuicao.4").value(1))
				.andExpect(jsonPath("$.avaliacoes[?(@.minha == true)].titulo").value("Muito bom"))
				.andExpect(jsonPath("$.avaliacoes[0].autor").value("Cliente T."));

		mvc.perform(delete("/produtos/la-vie-est-belle/avaliacoes").cookie(bia))
				.andExpect(jsonPath("$.total").value(1));
	}

	@Test
	void notaForaDe1a5ERecusada() throws Exception {
		mvc.perform(put("/produtos/black-opium/avaliacoes").cookie(cadastrar().cookies())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nota": 6}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.campos.nota").value("Escolha de 1 a 5 estrelas."));
	}

	@Test
	void quemComprouGanhaOSeloDeCompraVerificada() throws Exception {
		Cookie[] login = cadastrar().cookies();
		mvc.perform(post("/carrinho/itens").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"varianteId": %d}
						""".formatted(varianteDe("acqua-di-gio", 100))))
				.andExpect(status().isOk());
		mvc.perform(post("/pedidos").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"endereco": {"destinatario": "Cliente", "cep": "20040002", "rua": "Rua A", "numero": "1",
						 "bairro": "Centro", "cidade": "Rio de Janeiro", "uf": "RJ"},
						 "frete": "PADRAO",
						 "pagamento": {"metodo": "CARTAO", "cartao": {"numero": "4111111111111111", "nome": "CLIENTE",
						 "validade": "12/40", "cvv": "123"}}}
						"""))
				.andExpect(status().isCreated());

		avaliar(login, "acqua-di-gio", 5, "Perfeito para o verão");
		avaliar(cadastrar().cookies(), "acqua-di-gio", 4, null);

		mvc.perform(get("/produtos/acqua-di-gio/avaliacoes"))
				.andExpect(jsonPath("$.avaliacoes", hasSize(2)))
				.andExpect(jsonPath("$.avaliacoes[?(@.titulo == 'Perfeito para o verão')].compraVerificada").value(true))
				.andExpect(jsonPath("$.avaliacoes[?(@.nota == 4)].compraVerificada").value(false));
	}

	@Test
	void adminApagaAvaliacao() throws Exception {
		String json = avaliar(cadastrar().cookies(), "light-blue", 1, "Spam");
		int id = JsonPath.read(json, "$.avaliacoes[0].id");

		mvc.perform(delete("/admin/avaliacoes/" + id).cookie(entrarComoAdmin())).andExpect(status().isNoContent());
		mvc.perform(get("/produtos/light-blue/avaliacoes")).andExpect(jsonPath("$.total").value(0));
	}

	private String avaliar(Cookie[] login, String slug, int nota, String titulo) throws Exception {
		String corpo = titulo == null
				? "{\"nota\": %d}".formatted(nota)
				: "{\"nota\": %d, \"titulo\": \"%s\"}".formatted(nota, titulo);
		return mvc.perform(put("/produtos/" + slug + "/avaliacoes").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content(corpo))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
	}
}
