package com.magnolia.api.pedido;

import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.magnolia.api.carrinho.Carrinho;
import com.magnolia.api.carrinho.CarrinhoDtos.Resumo;
import com.magnolia.api.carrinho.CarrinhoRepository;
import com.magnolia.api.carrinho.CarrinhoService;
import com.magnolia.api.carrinho.Cupom;
import com.magnolia.api.carrinho.CupomRepository;
import com.magnolia.api.carrinho.Frete;
import com.magnolia.api.carrinho.ItemCarrinho;
import com.magnolia.api.catalogo.Variante;
import com.magnolia.api.catalogo.VarianteRepository;
import com.magnolia.api.comum.ErroApiException;
import com.magnolia.api.comum.RecursoNaoEncontradoException;
import com.magnolia.api.comum.Texto;
import com.magnolia.api.pedido.PedidoDtos.EnderecoRequest;
import com.magnolia.api.pedido.PedidoDtos.NovoPedidoRequest;
import com.magnolia.api.pedido.PedidoDtos.PedidoResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoService {

	private static final SecureRandom ALEATORIO = new SecureRandom();

	private final PedidoRepository pedidos;
	private final CarrinhoRepository carrinhos;
	private final CarrinhoService carrinhoService;
	private final VarianteRepository variantes;
	private final CupomRepository cupons;

	// Transforma a sacola do cliente em pedido. Tudo acontece numa transação só:
	// se algo falhar (estoque acabou, cartão recusado...), nada fica salvo e a sacola continua igual.
	@Transactional
	public PedidoResponse criar(Long usuarioId, NovoPedidoRequest dados) {
		Carrinho carrinho = carrinhos.findByUsuarioId(usuarioId)
				.filter(c -> !c.getItens().isEmpty())
				.orElseThrow(() -> new ErroApiException(HttpStatus.BAD_REQUEST, "Sua sacola está vazia."));

		MetodoPagamento metodo = dados.pagamento().metodo();
		String numeroCartao = null;
		if (metodo == MetodoPagamento.CARTAO) {
			if (dados.pagamento().cartao() == null) {
				throw new ErroApiException(HttpStatus.BAD_REQUEST, "Preencha os dados do cartão.");
			}
			numeroCartao = PagamentoSimulado.validarCartao(dados.pagamento().cartao());
		} else if (metodo != MetodoPagamento.PIX) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST, "Escolha Pix ou cartão de crédito.");
		}

		// Valores calculados aqui com os preços atuais, nunca os que o navegador mandou
		Resumo resumo = Resumo.calcular(carrinho.getItens(), carrinho.getCupom());
		Cupom cupom = carrinho.getCupom();
		if (cupom != null) {
			carrinhoService.conferirCupom(cupom, usuarioId, resumo.subtotal());
			if (cupom.isSomentePix() && metodo != MetodoPagamento.PIX) {
				throw new ErroApiException(HttpStatus.BAD_REQUEST,
						"O cupom " + cupom.getCodigo() + " vale só para pagamento no Pix.");
			}
		}

		for (ItemCarrinho item : carrinho.getItens()) {
			baixarEstoque(item);
		}

		EnderecoRequest e = dados.endereco();
		String cep = Frete.normalizarCep(e.cep());
		EnderecoEntrega entrega = new EnderecoEntrega(e.destinatario().trim(), cep, e.rua().trim(), e.numero().trim(),
				Texto.opcional(e.complemento()), e.bairro().trim(), e.cidade().trim(), e.uf().toUpperCase(Locale.ROOT));
		Frete.Opcao frete = Frete.escolher(cep, resumo.subtotal(), dados.frete());

		Pedido pedido = new Pedido(novoNumero(), usuarioId, entrega, frete, cupom == null ? null : cupom.getCodigo(),
				resumo.subtotal(), resumo.desconto());
		for (ItemCarrinho item : carrinho.getItens()) {
			pedido.getItens().add(new ItemPedido(pedido, item.getVariante(), item.getQuantidade()));
		}

		if (metodo == MetodoPagamento.CARTAO) {
			PagamentoSimulado.cobrar(numeroCartao);
			int parcelas = dados.pagamento().cartao().parcelas() == null ? 1 : dados.pagamento().cartao().parcelas();
			pedido.getPagamentos().add(
					Pagamento.cartaoAprovado(pedido, numeroCartao.substring(numeroCartao.length() - 4), parcelas));
			pedido.setStatus(StatusPedido.PAGO);
		} else {
			pedido.getPagamentos().add(
					Pagamento.pixPendente(pedido, PagamentoSimulado.codigoPix(pedido.getNumero(), pedido.getTotalCentavos())));
		}

		if (cupom != null) {
			cupons.registrarUso(cupom.getId());
		}
		pedidos.save(pedido);

		// Compra feita: a sacola fica vazia
		carrinho.getItens().clear();
		carrinho.setCupom(null);

		return PedidoResponse.de(pedido);
	}

	@Transactional(readOnly = true)
	public List<PedidoResponse> listar(Long usuarioId) {
		return pedidos.findByUsuarioIdOrderByCriadoEmDesc(usuarioId).stream().map(PedidoResponse::de).toList();
	}

	@Transactional(readOnly = true)
	public PedidoResponse buscar(Long usuarioId, String numero) {
		return PedidoResponse.de(doCliente(usuarioId, numero));
	}

	// Ambiente de teste: faz de conta que o banco avisou que o Pix foi pago
	@Transactional
	public PedidoResponse simularPagamentoPix(Long usuarioId, String numero) {
		Pedido pedido = doCliente(usuarioId, numero);
		Pagamento pagamento = pedido.pagamento();
		if (pedido.getStatus() != StatusPedido.AGUARDANDO_PAGAMENTO || pagamento.getMetodo() != MetodoPagamento.PIX) {
			throw new ErroApiException(HttpStatus.CONFLICT, "Este pedido não está aguardando pagamento por Pix.");
		}

		pagamento.aprovar();
		pedido.setStatus(StatusPedido.PAGO);
		return PedidoResponse.de(pedido);
	}

	private void baixarEstoque(ItemCarrinho item) {
		Variante variante = item.getVariante();
		String nome = variante.getProduto().getNome() + " (" + variante.getVolumeMl() + " ml)";

		if (!variante.getProduto().isAtivo()) {
			throw new ErroApiException(HttpStatus.CONFLICT, nome + " não está mais à venda. Tire-o da sacola para continuar.");
		}
		if (variantes.baixarEstoque(variante.getId(), item.getQuantidade()) == 0) {
			int restam = variante.getEstoque();
			throw new ErroApiException(HttpStatus.CONFLICT, restam == 0
					? nome + " esgotou. Tire-o da sacola para continuar."
					: "Só temos " + restam + (restam == 1 ? " unidade" : " unidades") + " de " + nome
							+ ". Ajuste a quantidade na sacola.");
		}
	}

	private Pedido doCliente(Long usuarioId, String numero) {
		// Pedido de outra pessoa responde 404, como se não existisse
		return pedidos.findByNumeroAndUsuarioId(numero, usuarioId)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Pedido não encontrado."));
	}

	// MAG- e 8 números aleatórios (ex.: MAG-48213907): não revela quantos pedidos a loja já teve
	private String novoNumero() {
		String numero;
		do {
			numero = "MAG-" + String.format("%08d", ALEATORIO.nextInt(100_000_000));
		} while (pedidos.existsByNumero(numero));
		return numero;
	}
}
