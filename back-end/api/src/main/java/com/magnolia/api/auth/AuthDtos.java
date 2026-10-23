package com.magnolia.api.auth;

import com.magnolia.api.usuario.UsuarioResponse;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Corpos de requisição/resposta do login, agrupados por serem pequenos
public final class AuthDtos {

	private AuthDtos() {
	}

	public record CadastroRequest(
			@NotBlank(message = "Informe seu nome.")
			@Size(max = 150, message = "O nome pode ter até 150 caracteres.")
			String nome,

			@NotBlank(message = "Informe seu e-mail.")
			@Email(message = "Informe um e-mail válido.")
			@Size(max = 255, message = "O e-mail pode ter até 255 caracteres.")
			String email,

			// O BCrypt só considera os primeiros 72 bytes da senha
			@NotBlank(message = "Crie uma senha.")
			@Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
			String senha) {
	}

	public record LoginRequest(
			@NotBlank(message = "Informe seu e-mail.")
			String email,

			@NotBlank(message = "Informe sua senha.")
			String senha) {
	}

	// tokenRenovacao vem nulo quando só o token de acesso foi renovado
	public record SessaoIniciada(UsuarioResponse usuario, String tokenAcesso, String tokenRenovacao) {
	}
}
