package com.magnolia.api.comum;

import org.springframework.http.HttpStatus;

public class RecursoNaoEncontradoException extends ErroApiException {

	public RecursoNaoEncontradoException(String mensagem) {
		super(HttpStatus.NOT_FOUND, mensagem);
	}
}
