package com.magnolia.api.pedido;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.magnolia.api.carrinho.Frete;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pedido")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Pedido {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Número que o cliente vê (ex.: MAG-48213907)
	private String numero;

	private Long usuarioId;

	@Embedded
	private EnderecoEntrega entrega;

	@Enumerated(EnumType.STRING)
	private Frete.Tipo freteTipo;

	private String fretePrazo;

	private String cupomCodigo;

	private int subtotalCentavos;

	private int descontoCentavos;

	private int freteCentavos;

	private int totalCentavos;

	@Setter
	@Enumerated(EnumType.STRING)
	private StatusPedido status = StatusPedido.AGUARDANDO_PAGAMENTO;

	private Instant criadoEm = Instant.now();

	@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
	@OrderBy("id")
	private List<ItemPedido> itens = new ArrayList<>();

	@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
	@OrderBy("id")
	private List<Pagamento> pagamentos = new ArrayList<>();

	public Pedido(String numero, Long usuarioId, EnderecoEntrega entrega, Frete.Opcao frete, String cupomCodigo,
			int subtotal, int desconto) {
		this.numero = numero;
		this.usuarioId = usuarioId;
		this.entrega = entrega;
		this.freteTipo = frete.tipo();
		this.fretePrazo = frete.prazo();
		this.cupomCodigo = cupomCodigo;
		this.subtotalCentavos = subtotal;
		this.descontoCentavos = desconto;
		this.freteCentavos = frete.valor();
		this.totalCentavos = subtotal - desconto + frete.valor();
	}

	public Pagamento pagamento() {
		return pagamentos.getLast();
	}
}
