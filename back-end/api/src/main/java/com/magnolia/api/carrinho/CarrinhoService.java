package com.magnolia.api.carrinho;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.magnolia.api.auth.TokenService;
import com.magnolia.api.carrinho.CarrinhoDtos.CarrinhoResponse;
import com.magnolia.api.carrinho.CarrinhoDtos.Resumo;
import com.magnolia.api.catalogo.Variante;
import com.magnolia.api.catalogo.VarianteRepository;
import com.magnolia.api.comum.ErroApiException;
import com.magnolia.api.comum.RecursoNaoEncontradoException;
import com.magnolia.api.pedido.PedidoRepository;
import com.magnolia.api.pedido.StatusPedido;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

	public static final int QUANTIDADE_MAXIMA = 10;

	// Dono da sacola: um cliente logado (usuarioId) ou um visitante (token do cookie).
	// tokenVisitante null = visitante que ainda não tem sacola.
	public record Dono(Long usuarioId, String tokenVisitante) {

		static Dono usuario(Long usuarioId) {
			return new Dono(usuarioId, null);
		}

		static Dono visitante(String token) {
			return new Dono(null, token);
		}
	}

	private final CarrinhoRepository carrinhos;
	private final VarianteRepository variantes;
	private final CupomRepository cupons;
	private final PedidoRepository pedidos;

	@Transactional(readOnly = true)
	public CarrinhoResponse ver(Dono dono) {
		return buscar(dono).map(CarrinhoResponse::de).orElse(CarrinhoResponse.VAZIO);
	}

	@Transactional
	public CarrinhoResponse adicionar(Dono dono, Long varianteId, int quantidade) {
		Variante variante = variantes.findById(varianteId)
				.filter(v -> v.getProduto().isAtivo())
				.orElseThrow(() -> new RecursoNaoEncontradoException("Perfume não encontrado."));
		if (variante.getEstoque() <= 0) {
			throw new ErroApiException(HttpStatus.CONFLICT, "Este volume está esgotado no momento.");
		}

		Carrinho carrinho = buscarOuCriar(dono);
		carrinho.setAtualizadoEm(Instant.now());
		carrinhos.adicionarItem(carrinho.getId(), varianteId, quantidade, limite(variante));
		return CarrinhoResponse.de(buscar(dono).orElseThrow());
	}

	@Transactional
	public CarrinhoResponse alterarQuantidade(Dono dono, Long varianteId, int quantidade) {
		Carrinho carrinho = buscar(dono).orElseThrow(CarrinhoService::itemFora);
		ItemCarrinho item = carrinho.item(varianteId).orElseThrow(CarrinhoService::itemFora);
		item.setQuantidade(Math.min(quantidade, limite(item.getVariante())));
		carrinho.setAtualizadoEm(Instant.now());
		return CarrinhoResponse.de(carrinho);
	}

	@Transactional
	public CarrinhoResponse remover(Dono dono, Long varianteId) {
		return buscar(dono).map(carrinho -> {
			carrinho.getItens().removeIf(item -> item.getVariante().getId().equals(varianteId));
			carrinho.setAtualizadoEm(Instant.now());
			return CarrinhoResponse.de(carrinho);
		}).orElse(CarrinhoResponse.VAZIO);
	}

	@Transactional
	public CarrinhoResponse aplicarCupom(Dono dono, String codigo) {
		Carrinho carrinho = buscar(dono)
				.filter(c -> !c.getItens().isEmpty())
				.orElseThrow(() -> new ErroApiException(HttpStatus.BAD_REQUEST,
						"Adicione um perfume à sacola antes de usar o cupom."));
		Cupom cupom = cupons.findByCodigoIgnoreCase(codigo.trim())
				.orElseThrow(() -> new ErroApiException(HttpStatus.BAD_REQUEST,
						"Cupom inválido. Confira o código e tente de novo."));

		conferirCupom(cupom, dono.usuarioId(), Resumo.calcular(carrinho.getItens(), null).subtotal());
		carrinho.setCupom(cupom);
		return CarrinhoResponse.de(carrinho);
	}

	@Transactional
	public CarrinhoResponse removerCupom(Dono dono) {
		return buscar(dono).map(carrinho -> {
			carrinho.setCupom(null);
			return CarrinhoResponse.de(carrinho);
		}).orElse(CarrinhoResponse.VAZIO);
	}

	@Transactional(readOnly = true)
	public List<Frete.Opcao> opcoesDeFrete(Dono dono, String cep) {
		int subtotal = buscar(dono).map(c -> Resumo.calcular(c.getItens(), null).subtotal()).orElse(0);
		return Frete.opcoes(cep, subtotal);
	}

	// Depois do login, o que o visitante colocou na sacola passa para a sacola da conta
	@Transactional
	public void juntarSacolaDoVisitante(Long usuarioId, String tokenVisitante) {
		Optional<Carrinho> doVisitante = carrinhos.findBySessaoId(TokenService.hash(tokenVisitante));
		if (doVisitante.isEmpty()) {
			return;
		}

		Carrinho visitante = doVisitante.get();
		Long cupomDoVisitante = visitante.getCupom() == null ? null : visitante.getCupom().getId();
		// Lidos antes: adicionarItem limpa a memória do JPA e os objetos antigos deixam de carregar dados
		record Copia(Long varianteId, int quantidade, int limite) {
		}
		List<Copia> itens = visitante.getItens().stream()
				.map(item -> new Copia(item.getVariante().getId(), item.getQuantidade(), limite(item.getVariante())))
				.toList();

		Carrinho conta = buscarOuCriar(Dono.usuario(usuarioId));
		for (Copia item : itens) {
			carrinhos.adicionarItem(conta.getId(), item.varianteId(), item.quantidade(), item.limite());
		}
		carrinhos.deleteById(visitante.getId());
		if (cupomDoVisitante != null) {
			carrinhos.findByUsuarioId(usuarioId)
					.filter(c -> c.getCupom() == null)
					.ifPresent(c -> c.setCupom(cupons.getReferenceById(cupomDoVisitante)));
		}
	}

	// Usado na sacola e de novo no checkout (as regras podem ter mudado entre um e outro)
	public void conferirCupom(Cupom cupom, Long usuarioId, int subtotal) {
		cupom.problema(subtotal).ifPresent(problema -> {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, problema);
		});
		if (cupom.isPrimeiraCompra() && usuarioId != null
				&& pedidos.existsByUsuarioIdAndStatusNot(usuarioId, StatusPedido.CANCELADO)) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, "Este cupom vale só para a primeira compra.");
		}
	}

	private Optional<Carrinho> buscar(Dono dono) {
		if (dono.usuarioId() != null) {
			return carrinhos.findByUsuarioId(dono.usuarioId());
		}
		if (dono.tokenVisitante() != null) {
			return carrinhos.findBySessaoId(TokenService.hash(dono.tokenVisitante()));
		}
		return Optional.empty();
	}

	private Carrinho buscarOuCriar(Dono dono) {
		if (dono.usuarioId() != null) {
			carrinhos.criarDoUsuario(dono.usuarioId());
		} else {
			carrinhos.criarDoVisitante(TokenService.hash(dono.tokenVisitante()));
		}
		return buscar(dono).orElseThrow();
	}

	// Até 10 unidades, e nunca mais do que há no estoque
	private static int limite(Variante variante) {
		return Math.max(1, Math.min(QUANTIDADE_MAXIMA, variante.getEstoque()));
	}

	private static ErroApiException itemFora() {
		return new RecursoNaoEncontradoException("Este perfume não está mais na sua sacola.");
	}
}
