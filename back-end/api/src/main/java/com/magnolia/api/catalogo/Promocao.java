package com.magnolia.api.catalogo;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Banner do carrossel de promoções do catálogo
@Entity
@Table(name = "promocao")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Promocao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String titulo;

	private String imagemUrl;

	private String link;

	private Instant inicio;

	private Instant fim;

	private int ordem;
}
