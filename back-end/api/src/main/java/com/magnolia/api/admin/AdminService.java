package com.magnolia.api.admin;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.magnolia.api.admin.AdminDtos.MarcaRequest;
import com.magnolia.api.admin.AdminDtos.ProdutoRequest;
import com.magnolia.api.admin.AdminDtos.ProdutoResponse;
import com.magnolia.api.admin.AdminDtos.PromocaoRequest;
import com.magnolia.api.admin.AdminDtos.PromocaoResponse;
import com.magnolia.api.admin.AdminDtos.VarianteRequest;
import com.magnolia.api.catalogo.CatalogoRespostas.MarcaResponse;
import com.magnolia.api.catalogo.Categoria;
import com.magnolia.api.catalogo.CategoriaRepository;
import com.magnolia.api.catalogo.ImagemProduto;
import com.magnolia.api.catalogo.Marca;
import com.magnolia.api.catalogo.MarcaRepository;
import com.magnolia.api.catalogo.Produto;
import com.magnolia.api.catalogo.ProdutoRepository;
import com.magnolia.api.catalogo.Promocao;
import com.magnolia.api.catalogo.PromocaoRepository;
import com.magnolia.api.catalogo.Variante;
import com.magnolia.api.catalogo.VarianteRepository;
import com.magnolia.api.comum.ErroApiException;
import com.magnolia.api.comum.RecursoNaoEncontradoException;
import com.magnolia.api.comum.Texto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

	private final ProdutoRepository produtos;
	private final VarianteRepository variantes;
	private final MarcaRepository marcas;
	private final CategoriaRepository categorias;
	private final PromocaoRepository promocoes;

	// ===== Perfumes =====

	@Transactional(readOnly = true)
	public List<ProdutoResponse> listarProdutos() {
		return produtos.findAllByOrderByNomeAsc().stream().map(ProdutoResponse::de).toList();
	}

	@Transactional(readOnly = true)
	public ProdutoResponse buscarProduto(Long id) {
		return ProdutoResponse.de(produto(id));
	}

	@Transactional
	public ProdutoResponse criarProduto(ProdutoRequest dados) {
		String slug = slug(dados);
		if (produtos.existsBySlug(slug)) {
			throw slugEmUso();
		}

		Produto produto = new Produto(marca(dados.marcaId()), categoria(dados.categoriaId()), dados.nome().trim(), slug);
		preencher(produto, dados);
		return ProdutoResponse.de(produtos.saveAndFlush(produto));
	}

	@Transactional
	public ProdutoResponse atualizarProduto(Long id, ProdutoRequest dados) {
		Produto produto = produto(id);
		String slug = slug(dados);
		if (produtos.existsBySlugAndIdNot(slug, id)) {
			throw slugEmUso();
		}

		produto.setNome(dados.nome().trim());
		produto.setSlug(slug);
		produto.setMarca(marca(dados.marcaId()));
		produto.setCategoria(categoria(dados.categoriaId()));
		preencher(produto, dados);
		return ProdutoResponse.de(produtos.saveAndFlush(produto));
	}

	// Desativar esconde o perfume da loja sem apagar o histórico de pedidos
	@Transactional
	public ProdutoResponse alterarAtivo(Long id, boolean ativo) {
		Produto produto = produto(id);
		produto.setAtivo(ativo);
		return ProdutoResponse.de(produto);
	}

	private void preencher(Produto produto, ProdutoRequest dados) {
		produto.setConcentracao(dados.concentracao());
		produto.setDescricao(Texto.opcional(dados.descricao()));
		produto.setFamiliaOlfativa(Texto.opcional(dados.familiaOlfativa()));
		produto.setNotasTopo(Texto.opcional(dados.notasTopo()));
		produto.setNotasCoracao(Texto.opcional(dados.notasCoracao()));
		produto.setNotasFundo(Texto.opcional(dados.notasFundo()));
		produto.setAtivo(dados.ativo());
		atualizarImagem(produto, Texto.opcional(dados.imagemUrl()));
		atualizarVariantes(produto, dados.variantes());
	}

	private void atualizarImagem(Produto produto, String url) {
		List<ImagemProduto> imagens = produto.getImagens();
		if (url == null) {
			imagens.clear();
		} else if (imagens.isEmpty()) {
			imagens.add(new ImagemProduto(produto, url, "Frasco do perfume " + produto.getNome()));
		} else {
			imagens.getFirst().setUrl(url);
		}
	}

	private void atualizarVariantes(Produto produto, List<VarianteRequest> pedidas) {
		conferirRepetidos(pedidas);

		// Primeiro apaga os volumes que saíram da lista: assim um volume novo pode reaproveitar
		// os mesmos ml ou o mesmo SKU sem esbarrar nas regras UNIQUE do banco
		Set<Long> mantidas = pedidas.stream().map(VarianteRequest::id).filter(id -> id != null)
				.collect(Collectors.toSet());
		if (produto.getVariantes().removeIf(v -> !mantidas.contains(v.getId())) && produto.getId() != null) {
			produtos.saveAndFlush(produto);
		}

		Map<Long, Variante> existentes = produto.getVariantes().stream()
				.collect(Collectors.toMap(Variante::getId, Function.identity()));

		// Confere tudo antes de mexer: as consultas abaixo fariam o JPA gravar um volume novo ainda pela metade
		for (VarianteRequest pedida : pedidas) {
			if (pedida.id() != null && !existentes.containsKey(pedida.id())) {
				throw new ErroApiException(HttpStatus.BAD_REQUEST, "Um dos volumes não é deste perfume.");
			}
			String sku = sku(pedida);
			boolean skuDeOutro = pedida.id() == null
					? variantes.existsBySkuIgnoreCase(sku)
					: variantes.existsBySkuIgnoreCaseAndIdNot(sku, pedida.id());
			if (skuDeOutro) {
				throw new ErroApiException(HttpStatus.CONFLICT, "O SKU " + sku + " já é usado por outro volume.");
			}
			if (pedida.precoPromocional() != null && pedida.precoPromocional() >= pedida.preco()) {
				throw new ErroApiException(HttpStatus.BAD_REQUEST,
						"O preço promocional do volume de " + pedida.volumeMl() + " ml precisa ser menor que o preço normal.");
			}
		}

		for (VarianteRequest pedida : pedidas) {
			Variante variante = pedida.id() == null ? new Variante(produto) : existentes.get(pedida.id());
			variante.setVolumeMl(pedida.volumeMl());
			variante.setSku(sku(pedida));
			variante.setPrecoCentavos(pedida.preco());
			variante.setPrecoPromocionalCentavos(pedida.precoPromocional());
			variante.setEstoque(pedida.estoque());
			if (pedida.id() == null) {
				produto.getVariantes().add(variante);
			}
		}
	}

	private static String sku(VarianteRequest pedida) {
		return pedida.sku().trim().toUpperCase(Locale.ROOT);
	}

	private static void conferirRepetidos(List<VarianteRequest> pedidas) {
		Set<Integer> volumes = new HashSet<>();
		Set<String> skus = new HashSet<>();
		for (VarianteRequest pedida : pedidas) {
			if (!volumes.add(pedida.volumeMl())) {
				throw new ErroApiException(HttpStatus.BAD_REQUEST, "O volume de " + pedida.volumeMl() + " ml aparece duas vezes.");
			}
			if (!skus.add(sku(pedida))) {
				throw new ErroApiException(HttpStatus.BAD_REQUEST, "O SKU " + pedida.sku().trim() + " aparece duas vezes.");
			}
		}
	}

	private static String slug(ProdutoRequest dados) {
		String slug = Texto.slug(dados.slug() == null || dados.slug().isBlank() ? dados.nome() : dados.slug());
		if (slug.isEmpty()) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, "Use letras ou números no nome do perfume.");
		}
		return slug;
	}

	private static ErroApiException slugEmUso() {
		return new ErroApiException(HttpStatus.CONFLICT, "Já existe um perfume com este endereço (slug). Escolha outro.");
	}

	private Produto produto(Long id) {
		return produtos.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Perfume não encontrado."));
	}

	private Marca marca(Long id) {
		return marcas.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Marca não encontrada."));
	}

	private Categoria categoria(Long id) {
		return categorias.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada."));
	}

	// ===== Marcas =====

	@Transactional
	public MarcaResponse criarMarca(MarcaRequest dados) {
		String slug = Texto.slug(dados.nome());
		if (slug.isEmpty()) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, "Use letras ou números no nome da marca.");
		}
		if (marcas.existsBySlug(slug)) {
			throw new ErroApiException(HttpStatus.CONFLICT, "Esta marca já está cadastrada.");
		}
		Marca marca = marcas.save(new Marca(dados.nome().trim(), slug));
		return new MarcaResponse(marca.getId(), marca.getNome(), marca.getSlug());
	}

	// ===== Promoções =====

	@Transactional(readOnly = true)
	public List<PromocaoResponse> listarPromocoes() {
		return promocoes.findAllByOrderByOrdemAscInicioDesc().stream().map(PromocaoResponse::de).toList();
	}

	@Transactional
	public PromocaoResponse criarPromocao(PromocaoRequest dados) {
		Promocao promocao = new Promocao();
		preencher(promocao, dados);
		return PromocaoResponse.de(promocoes.save(promocao));
	}

	@Transactional
	public PromocaoResponse atualizarPromocao(Long id, PromocaoRequest dados) {
		Promocao promocao = promocoes.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Promoção não encontrada."));
		preencher(promocao, dados);
		return PromocaoResponse.de(promocao);
	}

	@Transactional
	public void removerPromocao(Long id) {
		if (!promocoes.existsById(id)) {
			throw new RecursoNaoEncontradoException("Promoção não encontrada.");
		}
		promocoes.deleteById(id);
	}

	private static void preencher(Promocao promocao, PromocaoRequest dados) {
		if (!dados.fim().isAfter(dados.inicio())) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, "O fim da promoção precisa ser depois do início.");
		}
		promocao.setTitulo(dados.titulo().trim());
		promocao.setImagemUrl(dados.imagemUrl().trim());
		promocao.setLink(Texto.opcional(dados.link()));
		promocao.setInicio(dados.inicio());
		promocao.setFim(dados.fim());
		promocao.setOrdem(dados.ordem());
	}
}
