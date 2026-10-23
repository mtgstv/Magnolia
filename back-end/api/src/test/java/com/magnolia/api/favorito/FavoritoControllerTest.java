package com.magnolia.api.favorito;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.jayway.jsonpath.JsonPath;
import com.magnolia.api.TesteDeIntegracao;

import jakarta.servlet.http.Cookie;

class FavoritoControllerTest extends TesteDeIntegracao {

	@Test
	void favoritosExigemLogin() throws Exception {
		mvc.perform(get("/me/favoritos")).andExpect(status().isUnauthorized());
		mvc.perform(put("/me/favoritos/1")).andExpect(status().isUnauthorized());
	}

	@Test
	void favoritaListaERemove() throws Exception {
		Cookie[] login = cadastrar().cookies();
		long sauvage = idDoProduto("sauvage-eau-de-parfum");

		// Favoritar duas vezes não duplica
		mvc.perform(put("/me/favoritos/" + sauvage).cookie(login)).andExpect(status().isNoContent());
		mvc.perform(put("/me/favoritos/" + sauvage).cookie(login)).andExpect(status().isNoContent());

		mvc.perform(get("/me/favoritos").cookie(login))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].slug").value("sauvage-eau-de-parfum"));

		mvc.perform(delete("/me/favoritos/" + sauvage).cookie(login)).andExpect(status().isNoContent());

		mvc.perform(get("/me/favoritos").cookie(login))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	void recomendaPerfumesDaMesmaFamiliaSemRepetirOsFavoritos() throws Exception {
		Cookie[] login = cadastrar().cookies();
		mvc.perform(put("/me/favoritos/" + idDoProduto("sauvage-eau-de-parfum")).cookie(login))
				.andExpect(status().isNoContent());

		// Sauvage é Aromático e Masculino: Invictus é o único outro com as duas coisas
		mvc.perform(get("/me/recomendacoes").cookie(login))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(8)))
				.andExpect(jsonPath("$[0].slug").value("invictus"))
				.andExpect(jsonPath("$[*].slug", everyItem(not("sauvage-eau-de-parfum"))));
	}

	@Test
	void naoFavoritaPerfumeInexistente() throws Exception {
		Cookie[] login = cadastrar().cookies();

		mvc.perform(put("/me/favoritos/999999").cookie(login))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("Perfume não encontrado."));
	}

	private long idDoProduto(String slug) throws Exception {
		String json = mvc.perform(get("/produtos")).andReturn().getResponse().getContentAsString();
		List<Number> ids = JsonPath.read(json, "$[?(@.slug == '" + slug + "')].id");
		return ids.getFirst().longValue();
	}
}
