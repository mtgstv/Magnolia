package com.magnolia.api.pedido;

import com.magnolia.api.catalogo.Produto;
import com.magnolia.api.catalogo.Variante;

import jakarta.persistence.Column;
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

// Cópia do item no momento da compra: se o preço ou o nome mudarem depois, o pedido continua igual
@Entity
@Table(name = "item_pedido")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemPedido {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "pedido_id")
	private Pedido pedido;

	// Fica null se o volume for apagado no painel admin
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "variante_id")
	private Variante variante;

	private String nomeProduto;

	private String produtoSlug;

	private String marca;

	@Column(name = "imagem_url")
	private String imagem;

	private int volumeMl;

	private int precoUnitarioCentavos;

	private int quantidade;

	public ItemPedido(Pedido pedido, Variante variante, int quantidade) {
		Produto produto = variante.getProduto();
		this.pedido = pedido;
		this.variante = variante;
		this.nomeProduto = produto.getNome();
		this.produtoSlug = produto.getSlug();
		this.marca = produto.getMarca().getNome();
		this.imagem = produto.imagemPrincipal().orElse(null);
		this.volumeMl = variante.getVolumeMl();
		this.precoUnitarioCentavos = variante.precoFinal();
		this.quantidade = quantidade;
	}
}
