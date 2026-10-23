package com.magnolia.api.catalogo;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

import com.magnolia.api.comum.Texto;

// Filtros de GET /produtos, vindos da URL. Todos são opcionais, ex.:
// /produtos?q=baunilha&categoria=feminino&marca=dior&marca=chanel&familia=Floral&precoMin=30000&promocao=true&ordenacao=menor-preco
// precoMin e precoMax em centavos. marca e familia podem se repetir (vale qualquer uma delas).
public record FiltroProdutos(
		String q,
		String categoria,
		List<String> marca,
		List<String> familia,
		Integer precoMin,
		Integer precoMax,
		Boolean promocao,
		String ordenacao) {

	private static final Comparator<ProdutoResumo> POR_PRECO = Comparator.comparingInt(FiltroProdutos::precoAtual);
	private static final Comparator<ProdutoResumo> POR_NOME =
			Comparator.comparing(p -> Texto.normalizar(p.nome()));

	// "novidades" (padrão): a lista já vem das mais novas para as mais antigas
	private static final Map<String, Comparator<ProdutoResumo>> ORDENACOES = Map.of(
			"menor-preco", POR_PRECO,
			"maior-preco", POR_PRECO.reversed(),
			"desconto", Comparator.comparingInt(ProdutoResumo::descontoMaximo).reversed(),
			"nome-az", POR_NOME,
			"nome-za", POR_NOME.reversed());

	public static FiltroProdutos nenhum() {
		return new FiltroProdutos(null, null, null, null, null, null, null, null);
	}

	public List<ProdutoResumo> aplicar(List<Produto> produtos) {
		List<ProdutoResumo> resultado = produtos.stream()
				.filter(this::buscaEncontra)
				.map(ProdutoResumo::de)
				.filter(this::atendeFiltros)
				.toList();

		Comparator<ProdutoResumo> ordem = ordenacao == null ? null : ORDENACOES.get(ordenacao);
		return ordem == null ? resultado : resultado.stream().sorted(ordem).toList();
	}

	// Cada palavra da busca precisa aparecer no nome, na marca, na família ou nas notas, com ou sem acento.
	// Assim "dior baunilha" encontra o Sauvage (Dior, com fundo de baunilha).
	private boolean buscaEncontra(Produto produto) {
		String termo = Texto.normalizar(q);
		if (termo.isEmpty()) {
			return true;
		}

		String texto = Texto.normalizar(String.join(" ", produto.getNome(), produto.getMarca().getNome(),
				nulo(produto.getFamiliaOlfativa()), nulo(produto.getNotasTopo()), nulo(produto.getNotasCoracao()),
				nulo(produto.getNotasFundo())));
		return Arrays.stream(termo.split("\\s+")).allMatch(texto::contains);
	}

	private boolean atendeFiltros(ProdutoResumo produto) {
		// Se a pessoa inverter mínimo e máximo, a faixa é corrigida
		boolean invertidos = precoMin != null && precoMax != null && precoMin > precoMax;
		Integer min = invertidos ? precoMax : precoMin;
		Integer max = invertidos ? precoMin : precoMax;

		List<Predicate<ProdutoResumo>> regras = List.of(
				p -> vazio(categoria) || categoria.equals(p.categoriaSlug()),
				p -> marca == null || marca.isEmpty() || marca.contains(p.marcaSlug()),
				p -> familia == null || familia.isEmpty() || familia.contains(p.familiaOlfativa()),
				p -> min == null || precoAtual(p) >= min,
				p -> max == null || precoAtual(p) <= max,
				// Em oferta = algum volume com desconto (não só o mais barato)
				p -> !Boolean.TRUE.equals(promocao) || p.descontoMaximo() > 0);
		return regras.stream().allMatch(regra -> regra.test(produto));
	}

	private static int precoAtual(ProdutoResumo produto) {
		return produto.precoPromocional() != null ? produto.precoPromocional() : produto.preco();
	}

	private static boolean vazio(String texto) {
		return texto == null || texto.isBlank();
	}

	private static String nulo(String texto) {
		return texto == null ? "" : texto;
	}
}
