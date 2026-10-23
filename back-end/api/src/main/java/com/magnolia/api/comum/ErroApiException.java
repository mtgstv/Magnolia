package com.magnolia.api.comum;

import org.springframework.http.HttpStatus;

import lombok.Getter;

// Erro esperado (regra de negócio) que vira uma resposta com o status e a mensagem informados
@Getter
public class ErroApiException extends RuntimeException {

	private final HttpStatus status;

	public ErroApiException(HttpStatus status, String mensagem) {
		super(mensagem);
		this.status = status;
	}
}
