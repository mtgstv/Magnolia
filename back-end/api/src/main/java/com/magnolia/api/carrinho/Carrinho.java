package com.magnolia.api.carrinho;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
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
import lombok.Setter;

// A sacola de compras. É de um cliente logado (usuarioId) ou de um visitante (sessaoId = hash do cookie).
// As linhas são criadas por CarrinhoRepository (INSERT ... ON CONFLICT), nunca com "new".
@Entity
@Table(name = "carrinho")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Carrinho {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long usuarioId;

	private String sessaoId;

	@Setter
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cupom_id")
	private Cupom cupom;

	@Setter
	private Instant atualizadoEm;

	@OneToMany(mappedBy = "carrinho", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("id")
	private List<ItemCarrinho> itens = new ArrayList<>();

	public Optional<ItemCarrinho> item(Long varianteId) {
		return itens.stream().filter(item -> item.getVariante().getId().equals(varianteId)).findFirst();
	}
}
