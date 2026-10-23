package com.magnolia.api.catalogo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "marca")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Marca {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nome;

	private String slug;

	public Marca(String nome, String slug) {
		this.nome = nome;
		this.slug = slug;
	}
}
