package com.magnolia.api.carrinho;

import com.magnolia.api.catalogo.Variante;

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

// Um volume de um perfume dentro da sacola. O preço não fica aqui: é sempre o preço atual da variante.
@Entity
@Table(name = "item_carrinho")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemCarrinho {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "carrinho_id")
	private Carrinho carrinho;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "variante_id")
	private Variante variante;

	@Setter
	private int quantidade;

	// Produto desativado no painel admin conta como esgotado
	public int estoqueDisponivel() {
		return variante.getProduto().isAtivo() ? variante.getEstoque() : 0;
	}
}
