package com.magnolia.api.carrinho;

import java.util.List;

import org.springframework.http.HttpStatus;

import com.magnolia.api.comum.ErroApiException;

// Frete simulado: o preço e o prazo dependem só da região do CEP (o primeiro dígito).
// Numa loja de verdade, estes valores viriam dos Correios ou de uma transportadora.
public final class Frete {

	public static final int GRATIS_A_PARTIR_DE = 29900;
	// Valor mostrado na sacola enquanto o CEP ainda não foi informado (o mesmo da entrega padrão em SP)
	public static final int ESTIMATIVA_SACOLA = 1990;

	// Mesmos valores do CHECK da coluna pedido.frete_tipo
	public enum Tipo {
		PADRAO,
		EXPRESSA
	}

	// gratis: só a entrega padrão fica grátis nas compras a partir de R$ 299
	public record Opcao(Tipo tipo, String nome, String prazo, int valor, boolean gratis) {
	}

	private record Tabela(int padrao, String prazoPadrao, int expressa, String prazoExpressa) {
	}

	// Posição = primeiro dígito do CEP
	private static final Tabela[] POR_REGIAO = {
		new Tabela(1990, "3 a 5 dias úteis", 3490, "1 a 2 dias úteis"),  // 0: Grande São Paulo
		new Tabela(1990, "3 a 5 dias úteis", 3490, "1 a 2 dias úteis"),  // 1: interior de SP
		new Tabela(2490, "4 a 6 dias úteis", 4290, "2 a 3 dias úteis"),  // 2: RJ e ES
		new Tabela(2490, "4 a 6 dias úteis", 4290, "2 a 3 dias úteis"),  // 3: MG
		new Tabela(2990, "6 a 9 dias úteis", 5490, "3 a 4 dias úteis"),  // 4: BA e SE
		new Tabela(2990, "6 a 9 dias úteis", 5490, "3 a 4 dias úteis"),  // 5: PE, AL, PB e RN
		new Tabela(3490, "8 a 12 dias úteis", 6490, "4 a 6 dias úteis"), // 6: CE, PI, MA e região Norte
		new Tabela(2790, "5 a 8 dias úteis", 4990, "2 a 4 dias úteis"),  // 7: DF, GO, TO, MT, MS e RO
		new Tabela(2490, "4 a 6 dias úteis", 4290, "2 a 3 dias úteis"),  // 8: PR e SC
		new Tabela(2490, "4 a 6 dias úteis", 4290, "2 a 3 dias úteis")   // 9: RS
	};

	private Frete() {
	}

	// subtotal: valor dos perfumes (já com as promoções), em centavos
	public static List<Opcao> opcoes(String cep, int subtotal) {
		Tabela tabela = POR_REGIAO[normalizarCep(cep).charAt(0) - '0'];
		boolean gratis = subtotal >= GRATIS_A_PARTIR_DE;

		return List.of(
				new Opcao(Tipo.PADRAO, "Entrega padrão", tabela.prazoPadrao(), gratis ? 0 : tabela.padrao(), gratis),
				new Opcao(Tipo.EXPRESSA, "Entrega expressa", tabela.prazoExpressa(), tabela.expressa(), false));
	}

	public static Opcao escolher(String cep, int subtotal, Tipo tipo) {
		return opcoes(cep, subtotal).stream().filter(opcao -> opcao.tipo() == tipo).findFirst().orElseThrow();
	}

	// "01310-100" -> "01310100"
	public static String normalizarCep(String cep) {
		String numeros = cep == null ? "" : cep.replaceAll("\\D", "");
		if (numeros.length() != 8) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, "Informe um CEP válido, com 8 números.");
		}
		return numeros;
	}
}
