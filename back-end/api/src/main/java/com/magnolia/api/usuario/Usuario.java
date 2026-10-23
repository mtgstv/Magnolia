package com.magnolia.api.usuario;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuario")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nome;

	private String email;

	// Hash BCrypt; a senha pura nunca é guardada
	private String senhaHash;

	@Enumerated(EnumType.STRING)
	private Papel papel = Papel.CLIENTE;

	private Instant criadoEm = Instant.now();

	public Usuario(String nome, String email, String senhaHash) {
		this.nome = nome;
		this.email = email;
		this.senhaHash = senhaHash;
	}
}
