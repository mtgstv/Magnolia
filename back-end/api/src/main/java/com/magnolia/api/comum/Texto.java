package com.magnolia.api.comum;

import java.text.Normalizer;
import java.text.NumberFormat;
import java.util.Locale;

// Ajudantes de texto usados em várias partes da API
public final class Texto {

	private static final Locale BRASIL = Locale.forLanguageTag("pt-BR");

	private Texto() {
	}

	// "Mémoire d'une Odeur" -> "memoire d'une odeur": a busca encontra com ou sem acento
	public static String normalizar(String texto) {
		if (texto == null) {
			return "";
		}
		String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
		return semAcento.toLowerCase(Locale.ROOT).trim();
	}

	// "Mémoire d'une Odeur" -> "memoire-d-une-odeur" (usado nas URLs: /produto/memoire-d-une-odeur)
	public static String slug(String texto) {
		return normalizar(texto).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
	}

	// 19990 -> "R$ 199,90"
	public static String reais(int centavos) {
		return NumberFormat.getCurrencyInstance(BRASIL).format(centavos / 100.0).replace(' ', ' ');
	}

	// Texto opcional: espaços em volta saem e texto vazio vira null
	public static String opcional(String texto) {
		return texto == null || texto.isBlank() ? null : texto.trim();
	}
}
