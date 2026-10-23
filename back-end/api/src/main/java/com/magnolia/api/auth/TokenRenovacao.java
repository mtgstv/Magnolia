package com.magnolia.api.auth;

import java.time.Instant;

import com.magnolia.api.usuario.Usuario;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Um login salvo em um navegador. Guarda o hash do token, nunca o token puro.
@Entity
@Table(name = "token_renovacao")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TokenRenovacao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id")
	private Usuario usuario;

	private String tokenHash;

	private Instant expiraEm;

	private Instant criadoEm = Instant.now();

	public TokenRenovacao(Usuario usuario, String tokenHash, Instant expiraEm) {
		this.usuario = usuario;
		this.tokenHash = tokenHash;
		this.expiraEm = expiraEm;
	}
}
