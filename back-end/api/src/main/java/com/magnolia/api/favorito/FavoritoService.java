package com.magnolia.api.favorito;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.magnolia.api.catalogo.Produto;
import com.magnolia.api.catalogo.ProdutoRepository;
import com.magnolia.api.catalogo.ProdutoResumo;
import com.magnolia.api.comum.RecursoNaoEncontradoException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FavoritoService {

	private static final int LIMITE_RECOMENDACOES = 8;

	private final FavoritoRepository favoritos;
	private final ProdutoRepository produtos;

	@Transactional(readOnly = true)
	public List<ProdutoResumo> listar(Long usuarioId) {
		return produtosFavoritos(usuarioId).stream().map(ProdutoResumo::de).toList();
	}

	@Transactional
	public void adicionar(Long usuarioId, Long produtoId) {
		if (produtos.findByIdAndAtivoTrue(produtoId).isEmpty()) {
			throw new RecursoNaoEncontradoException("Perfume não encontrado.");
		}
		favoritos.adicionar(usuarioId, produtoId);
	}

	@Transactional
	public void remover(Long usuarioId, Long produtoId) {
		favoritos.remover(usuarioId, produtoId);
	}

	// Perfumes parecidos com os favoritos: mesma família olfativa vale 2 pontos, mesma categoria vale 1.
	// Empates (e quem ainda não tem favoritos) ficam com as novidades primeiro.
	@Transactional(readOnly = true)
	public List<ProdutoResumo> recomendar(Long usuarioId) {
		List<Produto> preferidos = produtosFavoritos(usuarioId);
		Set<Long> idsFavoritos = preferidos.stream().map(Produto::getId).collect(Collectors.toSet());
		Set<String> familias = preferidos.stream().map(Produto::getFamiliaOlfativa).filter(Objects::nonNull)
				.collect(Collectors.toSet());
		Set<Long> categorias = preferidos.stream().map(p -> p.getCategoria().getId()).collect(Collectors.toSet());

		Comparator<Produto> maisParecidoPrimeiro = Comparator.comparingInt((Produto p) -> {
			int pontos = familias.contains(p.getFamiliaOlfativa()) ? 2 : 0;
			return pontos + (categorias.contains(p.getCategoria().getId()) ? 1 : 0);
		}).reversed();

		// A lista já vem das mais novas para as mais antigas, e o sort é estável
		return produtos.findByAtivoTrueOrderByCriadoEmDesc().stream()
				.filter(ProdutoResumo::temVariante)
				.filter(p -> !idsFavoritos.contains(p.getId()))
				.sorted(maisParecidoPrimeiro)
				.limit(LIMITE_RECOMENDACOES)
				.map(ProdutoResumo::de)
				.toList();
	}

	private List<Produto> produtosFavoritos(Long usuarioId) {
		return favoritos.findByUsuarioIdOrderByCriadoEmDesc(usuarioId).stream()
				.map(Favorito::getProduto)
				.filter(Produto::isAtivo)
				.filter(ProdutoResumo::temVariante)
				.toList();
	}
}
