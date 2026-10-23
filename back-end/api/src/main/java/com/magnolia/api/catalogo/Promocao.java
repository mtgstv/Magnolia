package com.magnolia.api.catalogo;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Banner do carrossel de promoções do catálogo (editável no painel admin)
@Entity
@Table(name = "promocao")
@Getter
@Setter
@NoArgsConstructor
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
