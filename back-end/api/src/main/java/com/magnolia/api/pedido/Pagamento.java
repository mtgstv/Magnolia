package com.magnolia.api.pedido;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

// Pagamento simulado (provedor SIMULADO): nenhum dinheiro de verdade é cobrado
@Entity
@Table(name = "pagamento")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Pagamento {

	public static final String PENDENTE = "PENDENTE";
	public static final String APROVADO = "APROVADO";

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "pedido_id")
	private Pedido pedido;

	private String provedor = "SIMULADO";

	@Enumerated(EnumType.STRING)
	private MetodoPagamento metodo;

	private String status;

	private int valorCentavos;

	// Cartão: só os 4 últimos dígitos
	private String cartaoFinal;

	private Integer parcelas;

	@Column(name = "pix_copia_e_cola")
	private String pixCopiaECola;

	private Instant criadoEm = Instant.now();

	private Instant pagoEm;

	public static Pagamento cartaoAprovado(Pedido pedido, String cartaoFinal, int parcelas) {
		Pagamento pagamento = new Pagamento(pedido, MetodoPagamento.CARTAO);
		pagamento.cartaoFinal = cartaoFinal;
		pagamento.parcelas = parcelas;
		pagamento.aprovar();
		return pagamento;
	}

	public static Pagamento pixPendente(Pedido pedido, String copiaECola) {
		Pagamento pagamento = new Pagamento(pedido, MetodoPagamento.PIX);
		pagamento.status = PENDENTE;
		pagamento.pixCopiaECola = copiaECola;
		return pagamento;
	}

	private Pagamento(Pedido pedido, MetodoPagamento metodo) {
		this.pedido = pedido;
		this.metodo = metodo;
		this.valorCentavos = pedido.getTotalCentavos();
	}

	public void aprovar() {
		status = APROVADO;
		pagoEm = Instant.now();
	}
}
