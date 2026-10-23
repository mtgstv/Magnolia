package com.magnolia.api.comum;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TratadorDeErros {

	@ExceptionHandler(ErroApiException.class)
	public ResponseEntity<ErroResponse> erroDaApi(ErroApiException erro) {
		return ResponseEntity.status(erro.getStatus()).body(ErroResponse.de(erro.getMessage()));
	}

	// @Valid falhou: devolve a primeira mensagem de cada campo para o formulário mostrar
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErroResponse> dadosInvalidos(MethodArgumentNotValidException erro) {
		Map<String, String> campos = new LinkedHashMap<>();
		for (FieldError campo : erro.getBindingResult().getFieldErrors()) {
			campos.putIfAbsent(campo.getField(), campo.getDefaultMessage());
		}

		return ResponseEntity.badRequest().body(new ErroResponse("Confira os campos destacados.", campos));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErroResponse> corpoIlegivel() {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ErroResponse.de("Não foi possível ler os dados enviados."));
	}
}
