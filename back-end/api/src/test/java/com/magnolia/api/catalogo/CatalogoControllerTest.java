package com.magnolia.api.catalogo;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

import com.magnolia.api.TesteDeIntegracao;

// Usa os dados de exemplo de db/exemplo/R__dados_de_exemplo.sql
class CatalogoControllerTest extends TesteDeIntegracao {

	@Test
	void listaOsPerfumesComOPrecoDaVarianteMaisBarata() throws Exception {
		// Sauvage: 60 ml por R$ 649,90 e 100 ml de R$ 899,90 por R$ 749,90 -> o card mostra R$ 649,90,
		// mas o perfume está em oferta (17% no frasco de 100 ml)
		mvc.perform(get("/produtos"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(14)))
				.andExpect(jsonPath("$[?(@.slug == 'sauvage-eau-de-parfum')].preco", contains(64990)))
				.andExpect(jsonPath("$[?(@.slug == 'sauvage-eau-de-parfum')].descontoMaximo", contains(17)))
				.andExpect(jsonPath("$[?(@.slug == '1-million')].descontoMaximo", contains(0)))
				.andExpect(jsonPath("$[?(@.slug == 'sauvage-eau-de-parfum')].volumes[*]", contains(60, 100)))
				.andExpect(jsonPath("$[?(@.slug == 'sauvage-eau-de-parfum')].marca", contains("Dior")));
	}

	@Test
	void mostraOsDetalhesDeUmPerfume() throws Exception {
		mvc.perform(get("/produtos/sauvage-eau-de-parfum"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nome").value("Sauvage"))
				.andExpect(jsonPath("$.familiaOlfativa").value("Aromático"))
				.andExpect(jsonPath("$.variantes", hasSize(2)))
				.andExpect(jsonPath("$.variantes[1].volumeMl").value(100))
				.andExpect(jsonPath("$.variantes[1].precoPromocional").value(74990))
				.andExpect(jsonPath("$.imagens[0].url").value("/images/produtos/sauvage-eau-de-parfum.jpg"));
	}

	@Test
	void perfumeInexistenteDevolve404ComMensagem() throws Exception {
		mvc.perform(get("/produtos/nao-existe"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Perfume não encontrado."));
	}

	@Test
	void listaMarcasCategoriasEPromocoesAtivas() throws Exception {
		mvc.perform(get("/categorias"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].slug", contains("feminino", "masculino", "unissex")));

		mvc.perform(get("/marcas"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(11)));

		mvc.perform(get("/promocoes"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3)))
				.andExpect(jsonPath("$[0].link").value("/catalogo?familia=Floral"));
	}

	@Test
	void buscaSemAcentoPeloNomeMarcaOuNotas() throws Exception {
		mvc.perform(get("/produtos").param("q", "memoire"))
				.andExpect(jsonPath("$[*].slug", contains("memoire-d-une-odeur")));

		// Cada palavra precisa aparecer: Dior + baunilha (nas notas de fundo) = Sauvage
		mvc.perform(get("/produtos").param("q", "dior baunilha"))
				.andExpect(jsonPath("$[*].slug", contains("sauvage-eau-de-parfum")));
	}

	@Test
	void filtraEOrdenaNaApi() throws Exception {
		mvc.perform(get("/produtos")
				.param("categoria", "masculino")
				.param("marca", "paco-rabanne")
				.param("ordenacao", "menor-preco"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].slug", contains("1-million", "invictus")));

		// Preços em centavos: até R$ 450 (o CK One custa R$ 399,90)
		mvc.perform(get("/produtos").param("precoMax", "45000"))
				.andExpect(jsonPath("$[*].slug", contains("ck-one")));

		mvc.perform(get("/produtos").param("familia", "Gourmand").param("familia", "Oriental").param("ordenacao", "nome-az"))
				.andExpect(jsonPath("$[*].slug", contains("black-opium", "good-girl", "la-vie-est-belle")));

		mvc.perform(get("/produtos").param("promocao", "true"))
				.andExpect(jsonPath("$[*].descontoMaximo", everyItem(greaterThan(0))));
	}
}
