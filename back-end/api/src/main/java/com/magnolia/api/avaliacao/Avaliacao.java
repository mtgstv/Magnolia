package com.magnolia.api.avaliacao;

import java.time.Instant;

import com.magnolia.api.catalogo.Produto;
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

// Nota de 1 a 5 (e um comentário opcional) de um cliente sobre um perfume
@Entity
@Table(name = "avaliacao")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Avaliacao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "produto_id")
	private Produto produto;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id")
	private Usuario usuario;

	private int nota;

	private String titulo;

	private String comentario;

	private Instant criadoEm = Instant.now();

	private Instant atualizadoEm = Instant.now();

	public Avaliacao(Produto produto, Usuario usuario) {
		this.produto = produto;
		this.usuario = usuario;
	}

	public void editar(int nota, String titulo, String comentario) {
		this.nota = nota;
		this.titulo = titulo;
		this.comentario = comentario;
		this.atualizadoEm = Instant.now();
	}
}
