package com.magnolia.api.carrinho;

import java.time.Instant;
import java.util.Optional;

import com.magnolia.api.comum.Texto;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cupom")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cupom {

	// Mesmos valores do CHECK da coluna cupom.tipo
	public enum Tipo {
		PERCENTUAL,
		VALOR
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String codigo;

	@Enumerated(EnumType.STRING)
	private Tipo tipo;

	// PERCENTUAL: a porcentagem (ex.: 10). VALOR: centavos.
	private int valor;

	private int minimoCentavos;

	private Instant validoAte;

	// null = sem limite de usos
	private Integer usosMaximos;

	private int usos;

	private String descricao;

	private boolean somentePix;

	private boolean primeiraCompra;

	public int desconto(int subtotal) {
		return tipo == Tipo.PERCENTUAL ? Math.round(subtotal * valor / 100f) : Math.min(valor, subtotal);
	}

	// Por que o cupom não vale agora (vazio = vale)
	public Optional<String> problema(int subtotal) {
		if (validoAte != null && validoAte.isBefore(Instant.now())) {
			return Optional.of("Este cupom expirou.");
		}
		if (usosMaximos != null && usos >= usosMaximos) {
			return Optional.of("Este cupom já foi usado o máximo de vezes.");
		}
		if (subtotal < minimoCentavos) {
			return Optional.of("Este cupom vale para compras a partir de " + Texto.reais(minimoCentavos) + ".");
		}
		return Optional.empty();
	}
}
