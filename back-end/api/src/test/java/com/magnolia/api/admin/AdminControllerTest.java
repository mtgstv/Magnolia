package com.magnolia.api.admin;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.jayway.jsonpath.JsonPath;
import com.magnolia.api.TesteDeIntegracao;

import jakarta.servlet.http.Cookie;

// Os perfumes e promoções criados aqui nascem desativados ou com datas no futuro,
// para não mudar o que os outros testes esperam do catálogo
class AdminControllerTest extends TesteDeIntegracao {

	@Test
	void soAdministradorEntraNoPainel() throws Exception {
		mvc.perform(get("/admin/produtos")).andExpect(status().isUnauthorized());
		mvc.perform(get("/admin/produtos").cookie(cadastrar().cookies())).andExpect(status().isForbidden());
		mvc.perform(get("/admin/produtos").cookie(entrarComoAdmin()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[*].slug", hasItem("sauvage-eau-de-parfum")));
	}

	@Test
	void cadastraEditaEPublicaUmPerfume() throws Exception {
		Cookie[] admin = entrarComoAdmin();
		long marca = idDe("/marcas", "chanel");
		long categoria = idDe("/categorias", "feminino");

		String json = mvc.perform(post("/admin/produtos").cookie(admin)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome": "Coco Mademoiselle", "marcaId": %d, "categoriaId": %d, "concentracao": "EDP",
						 "familiaOlfativa": "Chipre", "imagemUrl": "/images/produtos/coco.jpg", "ativo": false,
						 "variantes": [{"volumeMl": 50, "sku": "cha-coco-50", "preco": 79990, "estoque": 5}]}
						""".formatted(marca, categoria)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.slug").value("coco-mademoiselle"))
				.andExpect(jsonPath("$.variantes[0].sku").value("CHA-COCO-50"))
				.andReturn().getResponse().getContentAsString();
		int id = JsonPath.read(json, "$.id");
		int variante50 = JsonPath.read(json, "$.variantes[0].id");

		// Desativado: não aparece na loja
		mvc.perform(get("/produtos/coco-mademoiselle")).andExpect(status().isNotFound());

		// Edita: troca o preço, coloca em promoção e cadastra mais um volume
		mvc.perform(put("/admin/produtos/" + id).cookie(admin)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome": "Coco Mademoiselle", "marcaId": %d, "categoriaId": %d, "concentracao": "EDP",
						 "imagemUrl": "/images/produtos/coco.jpg", "ativo": false,
						 "variantes": [
						   {"id": %d, "volumeMl": 50, "sku": "CHA-COCO-50", "preco": 81990, "precoPromocional": 69990, "estoque": 4},
						   {"volumeMl": 100, "sku": "CHA-COCO-100", "preco": 109990, "estoque": 2}]}
						""".formatted(marca, categoria, variante50)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.variantes", hasSize(2)))
				.andExpect(jsonPath("$.variantes[0].precoPromocional").value(69990))
				.andExpect(jsonPath("$.variantes[1].volumeMl").value(100));

		// SKU repetido de outro perfume
		mvc.perform(put("/admin/produtos/" + id).cookie(admin)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome": "Coco Mademoiselle", "marcaId": %d, "categoriaId": %d, "concentracao": "EDP", "ativo": false,
						 "variantes": [{"volumeMl": 30, "sku": "DIOR-SAUV-EDP-60", "preco": 1000, "estoque": 1}]}
						""".formatted(marca, categoria)))
				.andExpect(status().isConflict());

		mvc.perform(get("/admin/produtos/" + id).cookie(admin))
				.andExpect(jsonPath("$.variantes", hasSize(2)))
				.andExpect(jsonPath("$.ativo").value(false));
	}

	@Test
	void promocaoPrecisaTerminarDepoisDeComecar() throws Exception {
		Cookie[] admin = entrarComoAdmin();

		mvc.perform(post("/admin/promocoes").cookie(admin)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"titulo": "Natal", "imagemUrl": "/images/promocoes/natal.jpg",
						 "inicio": "2030-12-25T00:00:00Z", "fim": "2030-12-01T00:00:00Z", "ordem": 9}
						"""))
				.andExpect(status().isBadRequest());

		String json = mvc.perform(post("/admin/promocoes").cookie(admin)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"titulo": "Natal", "imagemUrl": "/images/promocoes/natal.jpg", "link": "/catalogo",
						 "inicio": "2030-12-01T00:00:00Z", "fim": "2030-12-25T00:00:00Z", "ordem": 9}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.ativa").value(false))
				.andReturn().getResponse().getContentAsString();
		int id = JsonPath.read(json, "$.id");

		// Começa só em 2030: ainda não aparece no carrossel da loja
		mvc.perform(get("/promocoes")).andExpect(jsonPath("$[*].titulo", not(hasItem("Natal"))));

		mvc.perform(delete("/admin/promocoes/" + id).cookie(admin)).andExpect(status().isNoContent());
		mvc.perform(get("/admin/promocoes").cookie(admin)).andExpect(jsonPath("$[*].titulo", not(hasItem("Natal"))));
	}

	private long idDe(String rota, String slug) throws Exception {
		String json = mvc.perform(get(rota)).andReturn().getResponse().getContentAsString();
		List<Number> ids = JsonPath.read(json, "$[?(@.slug == '" + slug + "')].id");
		return ids.getFirst().longValue();
	}
}
