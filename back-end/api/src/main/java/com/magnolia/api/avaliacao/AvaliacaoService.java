package com.magnolia.api.avaliacao;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.magnolia.api.avaliacao.AvaliacaoDtos.AvaliacaoRequest;
import com.magnolia.api.avaliacao.AvaliacaoDtos.AvaliacaoResponse;
import com.magnolia.api.avaliacao.AvaliacaoDtos.AvaliacoesResponse;
import com.magnolia.api.catalogo.Produto;
import com.magnolia.api.catalogo.ProdutoRepository;
import com.magnolia.api.comum.RecursoNaoEncontradoException;
import com.magnolia.api.comum.Texto;
import com.magnolia.api.pedido.PedidoRepository;
import com.magnolia.api.pedido.StatusPedido;
import com.magnolia.api.usuario.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

	// Pedidos que contam como "compra verificada"
	private static final Set<StatusPedido> PAGOS = Set.of(StatusPedido.PAGO, StatusPedido.ENVIADO,
			StatusPedido.ENTREGUE);

	private final AvaliacaoRepository avaliacoes;
	private final ProdutoRepository produtos;
	private final UsuarioRepository usuarios;
	private final PedidoRepository pedidos;

	// usuarioId: quem está vendo a página (null para visitante)
	@Transactional(readOnly = true)
	public AvaliacoesResponse listar(String slug, Long usuarioId) {
		Produto produto = produto(slug);
		List<Avaliacao> lista = avaliacoes.findByProdutoIdOrderByCriadoEmDesc(produto.getId());
		Set<Long> compradores = new HashSet<>(pedidos.compradoresDoProduto(produto.getId(), PAGOS));

		Map<Integer, Long> distribuicao = new LinkedHashMap<>();
		for (int nota = 5; nota >= 1; nota--) {
			int estaNota = nota;
			distribuicao.put(nota, lista.stream().filter(a -> a.getNota() == estaNota).count());
		}
		double media = lista.stream().mapToInt(Avaliacao::getNota).average().orElse(0);

		List<AvaliacaoResponse> respostas = lista.stream()
				.map(a -> new AvaliacaoResponse(a.getId(), autor(a.getUsuario().getNome()), a.getNota(), a.getTitulo(),
						a.getComentario(), a.getCriadoEm(), compradores.contains(a.getUsuario().getId()),
						a.getUsuario().getId().equals(usuarioId)))
				.toList();

		// Uma casa decimal (ex.: 4.3)
		return new AvaliacoesResponse(Math.round(media * 10) / 10.0, lista.size(), distribuicao, respostas);
	}

	// Cada cliente tem uma avaliação por perfume: avaliar de novo edita a anterior
	@Transactional
	public AvaliacoesResponse salvar(String slug, Long usuarioId, AvaliacaoRequest dados) {
		Produto produto = produto(slug);
		Avaliacao avaliacao = avaliacoes.findByProdutoIdAndUsuarioId(produto.getId(), usuarioId)
				.orElseGet(() -> new Avaliacao(produto, usuarios.getReferenceById(usuarioId)));
		avaliacao.editar(dados.nota(), Texto.opcional(dados.titulo()), Texto.opcional(dados.comentario()));
		avaliacoes.saveAndFlush(avaliacao);
		return listar(slug, usuarioId);
	}

	@Transactional
	public AvaliacoesResponse remover(String slug, Long usuarioId) {
		Produto produto = produto(slug);
		avaliacoes.findByProdutoIdAndUsuarioId(produto.getId(), usuarioId).ifPresent(avaliacoes::delete);
		avaliacoes.flush();
		return listar(slug, usuarioId);
	}

	// Painel admin: apaga qualquer avaliação (ex.: ofensiva ou spam)
	@Transactional
	public void removerComoAdmin(Long id) {
		if (!avaliacoes.existsById(id)) {
			throw new RecursoNaoEncontradoException("Avaliação não encontrada.");
		}
		avaliacoes.deleteById(id);
	}

	private Produto produto(String slug) {
		return produtos.findBySlugAndAtivoTrue(slug)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Perfume não encontrado."));
	}

	// "Maria da Silva" -> "Maria S."
	static String autor(String nome) {
		String[] partes = nome.trim().split("\\s+");
		if (partes.length == 1) {
			return partes[0];
		}
		return partes[0] + " " + partes[partes.length - 1].charAt(0) + ".";
	}
}
