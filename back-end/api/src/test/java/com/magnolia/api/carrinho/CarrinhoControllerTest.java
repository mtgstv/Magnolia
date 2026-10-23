package com.magnolia.api.carrinho;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.magnolia.api.TesteDeIntegracao;

import jakarta.servlet.http.Cookie;

class CarrinhoControllerTest extends TesteDeIntegracao {

	@Test
	void visitanteSemSacolaVeUmaSacolaVazia() throws Exception {
		mvc.perform(get("/carrinho"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.itens", hasSize(0)))
				.andExpect(jsonPath("$.resumo.total").value(0))
				.andExpect(cookie().doesNotExist(CookieCarrinho.NOME));
	}

	@Test
	void visitanteMontaASacolaComOCookie() throws Exception {
		long sauvage60 = varianteDe("sauvage-eau-de-parfum", 60);

		Cookie sacola = mvc.perform(post("/carrinho/itens")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"varianteId": %d, "quantidade": 2}
						""".formatted(sauvage60)))
				.andExpect(status().isOk())
				.andExpect(cookie().httpOnly(CookieCarrinho.NOME, true))
				.andReturn().getResponse().getCookie(CookieCarrinho.NOME);

		// 2 x R$ 649,90 = R$ 1.299,80: frete grátis
		mvc.perform(get("/carrinho").cookie(sacola))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.itens[0].nome").value("Sauvage"))
				.andExpect(jsonPath("$.itens[0].quantidade").value(2))
				.andExpect(jsonPath("$.resumo.subtotal").value(129980))
				.andExpect(jsonPath("$.resumo.freteGratis").value(true))
				.andExpect(jsonPath("$.resumo.total").value(129980));

		// Adicionar de novo soma, sem passar de 10
		mvc.perform(post("/carrinho/itens").cookie(sacola)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"varianteId": %d, "quantidade": 9}
						""".formatted(sauvage60)))
				.andExpect(jsonPath("$.itens[0].quantidade").value(10));

		mvc.perform(patch("/carrinho/itens/" + sauvage60).cookie(sacola)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"quantidade": 1}
						"""))
				.andExpect(jsonPath("$.itens[0].quantidade").value(1))
				.andExpect(jsonPath("$.resumo.freteGratis").value(true));

		mvc.perform(delete("/carrinho/itens/" + sauvage60).cookie(sacola))
				.andExpect(jsonPath("$.itens", hasSize(0)));
	}

	@Test
	void aplicaCupomValidoERecusaOInvalido() throws Exception {
		Cookie[] login = cadastrar().cookies();
		adicionar(login, varianteDe("ck-one", 100), 1);

		mvc.perform(post("/carrinho/cupom").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"codigo": "NAOEXISTE"}
						"""))
				.andExpect(status().isBadRequest());

		// CK One 100 ml = R$ 399,90; 10% = R$ 39,99
		mvc.perform(post("/carrinho/cupom").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"codigo": "bemvinda10"}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.cupom.codigo").value("BEMVINDA10"))
				.andExpect(jsonPath("$.resumo.desconto").value(3999))
				.andExpect(jsonPath("$.resumo.total").value(39990 - 3999));
	}

	@Test
	void aoEntrarASacolaDoVisitanteVaiParaAConta() throws Exception {
		Cookie sacola = mvc.perform(post("/carrinho/itens")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"varianteId": %d}
						""".formatted(varianteDe("light-blue", 50))))
				.andReturn().getResponse().getCookie(CookieCarrinho.NOME);

		Cookie[] login = cadastrar().cookies();
		Cookie[] juntos = { login[0], login[1], sacola };

		mvc.perform(get("/carrinho").cookie(juntos))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.itens[0].slug").value("light-blue"))
				.andExpect(cookie().maxAge(CookieCarrinho.NOME, 0));

		// Continua na conta mesmo sem o cookie do visitante
		mvc.perform(get("/carrinho").cookie(login))
				.andExpect(jsonPath("$.itens", hasSize(1)));
	}

	@Test
	void naoAdicionaVolumeEsgotado() throws Exception {
		// Santal 33 de 100 ml está com estoque zero nos dados de exemplo
		mvc.perform(post("/carrinho/itens")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"varianteId": %d}
						""".formatted(varianteDe("santal-33", 100))))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Este volume está esgotado no momento."));
	}

	@Test
	void calculaOFretePeloCep() throws Exception {
		String json = mvc.perform(get("/carrinho/frete").param("cep", "01310-100"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(2)))
				.andExpect(jsonPath("$[0].tipo").value("PADRAO"))
				.andExpect(jsonPath("$[0].valor").value(1990))
				.andExpect(jsonPath("$[1].tipo").value("EXPRESSA"))
				.andReturn().getResponse().getContentAsString();
		assertThat(json).contains("dias úteis");

		mvc.perform(get("/carrinho/frete").param("cep", "123"))
				.andExpect(status().isBadRequest());
	}

	private void adicionar(Cookie[] login, long varianteId, int quantidade) throws Exception {
		mvc.perform(post("/carrinho/itens").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"varianteId": %d, "quantidade": %d}
						""".formatted(varianteId, quantidade)))
				.andExpect(status().isOk());
	}
}
