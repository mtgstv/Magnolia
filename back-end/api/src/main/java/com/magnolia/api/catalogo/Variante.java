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

// O mesmo perfume em volumes diferentes (ex.: 50 ml e 100 ml), cada um com preço e estoque
@Entity
@Table(name = "variante")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Variante {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "produto_id")
	private Produto produto;

	private int volumeMl;

	private String sku;

	private int precoCentavos;

	private Integer precoPromocionalCentavos;

	private int estoque;

	public Variante(Produto produto) {
		this.produto = produto;
	}

	public boolean temDesconto() {
		return precoPromocionalCentavos != null && precoPromocionalCentavos < precoCentavos;
	}

	public int precoFinal() {
		return temDesconto() ? precoPromocionalCentavos : precoCentavos;
	}

	// Arredondado, como o selo do front (ex.: R$ 899,90 -> R$ 749,90 = 17%)
	public int percentualDesconto() {
		if (!temDesconto()) {
			return 0;
		}
		return Math.round((precoCentavos - precoPromocionalCentavos) * 100f / precoCentavos);
	}
}
