package com.magnolia.api.catalogo;

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
import lombok.Setter;

@Entity
@Table(name = "imagem_produto")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ImagemProduto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "produto_id")
	private Produto produto;

	private String url;

	private int ordem;

	private String alt;

	public ImagemProduto(Produto produto, String url, String alt) {
		this.produto = produto;
		this.url = url;
		this.alt = alt;
	}
}
