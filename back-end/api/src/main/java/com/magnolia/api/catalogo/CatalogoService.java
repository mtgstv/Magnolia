package com.magnolia.api.catalogo;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.magnolia.api.catalogo.CatalogoRespostas.CategoriaResponse;
import com.magnolia.api.catalogo.CatalogoRespostas.MarcaResponse;
import com.magnolia.api.catalogo.CatalogoRespostas.PromocaoResponse;
import com.magnolia.api.comum.RecursoNaoEncontradoException;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CatalogoService {

	private final ProdutoRepository produtos;
	private final MarcaRepository marcas;
	private final CategoriaRepository categorias;
	private final PromocaoRepository promocoes;

	// O catálogo é pequeno, então vai inteiro para o front, que filtra e ordena na hora
	public List<ProdutoResumo> listarProdutos() {
		return produtos.findByAtivoTrueOrderByCriadoEmDesc().stream()
				.filter(ProdutoResumo::temVariante)
				.map(ProdutoResumo::de)
				.toList();
	}

	public ProdutoDetalhe buscarProduto(String slug) {
		return produtos.findBySlugAndAtivoTrue(slug)
				.filter(ProdutoResumo::temVariante)
				.map(ProdutoDetalhe::de)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Perfume não encontrado."));
	}

	public List<MarcaResponse> listarMarcas() {
		return marcas.findAllByOrderByNomeAsc().stream().map(MarcaResponse::de).toList();
	}

	public List<CategoriaResponse> listarCategorias() {
		return categorias.findAllByOrderByNomeAsc().stream().map(CategoriaResponse::de).toList();
	}

	public List<PromocaoResponse> listarPromocoesAtivas() {
		return promocoes.findAtivas(Instant.now()).stream().map(PromocaoResponse::de).toList();
	}
}
