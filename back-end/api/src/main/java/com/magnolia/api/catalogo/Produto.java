package com.magnolia.api.catalogo;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "produto")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Produto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "marca_id")
	private Marca marca;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "categoria_id")
	private Categoria categoria;

	private String nome;

	private String slug;

	private String descricao;

	@Enumerated(EnumType.STRING)
	private Concentracao concentracao;

	private String familiaOlfativa;

	private String notasTopo;

	private String notasCoracao;

	private String notasFundo;

	private boolean ativo;

	private Instant criadoEm;

	@OneToMany(mappedBy = "produto")
	@OrderBy("volumeMl")
	private List<Variante> variantes = new ArrayList<>();

	@OneToMany(mappedBy = "produto")
	@OrderBy("ordem")
	private List<ImagemProduto> imagens = new ArrayList<>();

	// Variante usada no card do catálogo: a de menor preço ("a partir de")
	public Optional<Variante> varianteMaisBarata() {
		return variantes.stream().min(Comparator.comparingInt(Variante::precoFinal));
	}

	public Optional<String> imagemPrincipal() {
		return imagens.stream().findFirst().map(ImagemProduto::getUrl);
	}
}
