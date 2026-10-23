package com.magnolia.api.pedido;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.jayway.jsonpath.JsonPath;
import com.magnolia.api.TesteDeIntegracao;

import jakarta.servlet.http.Cookie;

class PedidoControllerTest extends TesteDeIntegracao {

	private static final String ENDERECO = """
			{"destinatario": "Cliente de Teste", "cep": "01310-100", "rua": "Avenida Paulista", "numero": "1000",
			 "complemento": "Apto 1", "bairro": "Bela Vista", "cidade": "São Paulo", "uf": "sp"}
			""";

	@Test
	void pedidosExigemLogin() throws Exception {
		mvc.perform(get("/pedidos")).andExpect(status().isUnauthorized());
	}

	@Test
	void compraComCartaoAprovadoFicaPagaEEsvaziaASacola() throws Exception {
		Cookie[] login = cadastrar().cookies();
		adicionar(login, varianteDe("1-million", 50), 1);

		// 1 Million 50 ml = R$ 479,90 (frete padrão grátis)
		String json = mvc.perform(post("/pedidos").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content(pedido("PADRAO", cartao("4111 1111 1111 1111"))))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.numero", startsWith("MAG-")))
				.andExpect(jsonPath("$.status").value("PAGO"))
				.andExpect(jsonPath("$.total").value(47990))
				.andExpect(jsonPath("$.frete").value(0))
				.andExpect(jsonPath("$.endereco.cep").value("01310100"))
				.andExpect(jsonPath("$.endereco.uf").value("SP"))
				.andExpect(jsonPath("$.pagamento.cartaoFinal").value("1111"))
				.andExpect(jsonPath("$.itens[0].nome").value("1 Million"))
				.andReturn().getResponse().getContentAsString();

		mvc.perform(get("/carrinho").cookie(login)).andExpect(jsonPath("$.itens", hasSize(0)));

		String numero = JsonPath.read(json, "$.numero");
		mvc.perform(get("/pedidos").cookie(login))
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].numero").value(numero));

		// Outra pessoa não vê o pedido
		mvc.perform(get("/pedidos/" + numero).cookie(cadastrar().cookies())).andExpect(status().isNotFound());
	}

	@Test
	void cartaoRecusadoNaoCriaPedidoEMantemASacola() throws Exception {
		Cookie[] login = cadastrar().cookies();
		adicionar(login, varianteDe("ck-one", 100), 1);

		mvc.perform(post("/pedidos").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content(pedido("EXPRESSA", cartao("4000 0000 0000 0002"))))
				.andExpect(status().isPaymentRequired());

		mvc.perform(get("/carrinho").cookie(login)).andExpect(jsonPath("$.itens", hasSize(1)));
		mvc.perform(get("/pedidos").cookie(login)).andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void pixFicaAguardandoAteOPagamentoSerSimulado() throws Exception {
		Cookie[] login = cadastrar().cookies();
		adicionar(login, varianteDe("ck-one", 100), 1);

		// CK One 100 ml = R$ 399,90 + entrega expressa em SP (R$ 34,90)
		String json = mvc.perform(post("/pedidos").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content(pedido("EXPRESSA", """
						{"metodo": "PIX"}
						""")))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("AGUARDANDO_PAGAMENTO"))
				.andExpect(jsonPath("$.total").value(39990 + 3490))
				.andExpect(jsonPath("$.pagamento.pixCopiaECola", startsWith("PIX-TESTE")))
				.andReturn().getResponse().getContentAsString();
		String numero = JsonPath.read(json, "$.numero");

		mvc.perform(post("/pedidos/" + numero + "/simular-pagamento").cookie(login))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("PAGO"))
				.andExpect(jsonPath("$.pagamento.pixCopiaECola").doesNotExist());

		mvc.perform(post("/pedidos/" + numero + "/simular-pagamento").cookie(login))
				.andExpect(status().isConflict());
	}

	@Test
	void cupomDoPixNaoValeNoCartao() throws Exception {
		Cookie[] login = cadastrar().cookies();
		adicionar(login, varianteDe("invictus", 100), 1);
		mvc.perform(post("/carrinho/cupom").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"codigo": "PIX5"}
						"""))
				.andExpect(status().isOk());

		mvc.perform(post("/pedidos").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content(pedido("PADRAO", cartao("4111111111111111"))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("O cupom PIX5 vale só para pagamento no Pix."));
	}

	@Test
	void naoVendeMaisDoQueOEstoque() throws Exception {
		// Santal 33 de 50 ml tem 3 unidades: duas pessoas colocam as 3 na sacola, só a primeira leva
		long santal50 = varianteDe("santal-33", 50);
		Cookie[] primeira = cadastrar().cookies();
		Cookie[] segunda = cadastrar().cookies();
		adicionar(primeira, santal50, 3);
		adicionar(segunda, santal50, 3);

		mvc.perform(post("/pedidos").cookie(primeira)
				.contentType(MediaType.APPLICATION_JSON)
				.content(pedido("PADRAO", cartao("4111111111111111"))))
				.andExpect(status().isCreated());

		mvc.perform(post("/pedidos").cookie(segunda)
				.contentType(MediaType.APPLICATION_JSON)
				.content(pedido("PADRAO", cartao("4111111111111111"))))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Santal 33 (50 ml) esgotou. Tire-o da sacola para continuar."));
	}

	@Test
	void sacolaVaziaNaoViraPedido() throws Exception {
		mvc.perform(post("/pedidos").cookie(cadastrar().cookies())
				.contentType(MediaType.APPLICATION_JSON)
				.content(pedido("PADRAO", """
						{"metodo": "PIX"}
						""")))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Sua sacola está vazia."));
	}

	private void adicionar(Cookie[] login, long varianteId, int quantidade) throws Exception {
		mvc.perform(post("/carrinho/itens").cookie(login)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"varianteId": %d, "quantidade": %d}
						""".formatted(varianteId, quantidade)))
				.andExpect(status().isOk());
	}

	private static String pedido(String frete, String pagamento) {
		return """
				{"endereco": %s, "frete": "%s", "pagamento": %s}
				""".formatted(ENDERECO, frete, pagamento);
	}

	private static String cartao(String numero) {
		return """
				{"metodo": "CARTAO", "cartao": {"numero": "%s", "nome": "CLIENTE TESTE", "validade": "12/40",
				 "cvv": "123", "parcelas": 3}}
				""".formatted(numero);
	}
}
