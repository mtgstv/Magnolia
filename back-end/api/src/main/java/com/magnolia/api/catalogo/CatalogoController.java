package com.magnolia.api.catalogo;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.magnolia.api.catalogo.CatalogoRespostas.CategoriaResponse;
import com.magnolia.api.catalogo.CatalogoRespostas.MarcaResponse;
import com.magnolia.api.catalogo.CatalogoRespostas.PromocaoResponse;

import lombok.RequiredArgsConstructor;

// Rotas públicas (não precisam de login)
@RestController
@RequiredArgsConstructor
public class CatalogoController {

	private final CatalogoService catalogo;

	@GetMapping("/produtos")
	public List<ProdutoResumo> listarProdutos() {
		return catalogo.listarProdutos();
	}

	@GetMapping("/produtos/{slug}")
	public ProdutoDetalhe buscarProduto(@PathVariable String slug) {
		return catalogo.buscarProduto(slug);
	}

	@GetMapping("/marcas")
	public List<MarcaResponse> listarMarcas() {
		return catalogo.listarMarcas();
	}

	@GetMapping("/categorias")
	public List<CategoriaResponse> listarCategorias() {
		return catalogo.listarCategorias();
	}

	@GetMapping("/promocoes")
	public List<PromocaoResponse> listarPromocoes() {
		return catalogo.listarPromocoesAtivas();
	}
}
