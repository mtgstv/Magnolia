package com.magnolia.api.pedido;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Cópia do endereço no momento da compra (colunas entrega_* da tabela pedido)
@Embeddable
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EnderecoEntrega {

	@Column(name = "entrega_destinatario")
	private String destinatario;

	// Só números (ex.: 01310100)
	@Column(name = "entrega_cep")
	private String cep;

	@Column(name = "entrega_rua")
	private String rua;

	@Column(name = "entrega_numero")
	private String numero;

	@Column(name = "entrega_complemento")
	private String complemento;

	@Column(name = "entrega_bairro")
	private String bairro;

	@Column(name = "entrega_cidade")
	private String cidade;

	@Column(name = "entrega_uf")
	private String uf;
}
