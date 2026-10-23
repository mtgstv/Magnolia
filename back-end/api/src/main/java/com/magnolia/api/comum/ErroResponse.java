package com.magnolia.api.comum;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

// "message" segue o nome usado pelo erro padrão do Spring, que o front-end já lê.
// "campos" traz a mensagem de cada campo inválido de um formulário.
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroResponse(String message, Map<String, String> campos) {

	public static ErroResponse de(String message) {
		return new ErroResponse(message, null);
	}
}
