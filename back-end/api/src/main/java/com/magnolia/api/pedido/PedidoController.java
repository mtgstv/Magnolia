package com.magnolia.api.pedido;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.magnolia.api.pedido.PedidoDtos.NovoPedidoRequest;
import com.magnolia.api.pedido.PedidoDtos.PedidoResponse;
import com.magnolia.api.usuario.UsuarioLogado;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Pedidos do cliente logado (exigem login, ver SecurityConfig)
@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

	private final PedidoService pedidos;

	// Finaliza a compra com o que está na sacola
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public PedidoResponse criar(@AuthenticationPrincipal Jwt token, @Valid @RequestBody NovoPedidoRequest dados) {
		return pedidos.criar(UsuarioLogado.id(token), dados);
	}

	@GetMapping
	public List<PedidoResponse> listar(@AuthenticationPrincipal Jwt token) {
		return pedidos.listar(UsuarioLogado.id(token));
	}

	@GetMapping("/{numero}")
	public PedidoResponse buscar(@AuthenticationPrincipal Jwt token, @PathVariable String numero) {
		return pedidos.buscar(UsuarioLogado.id(token), numero);
	}

	// Só existe porque o pagamento é simulado: confirma o Pix sem precisar de um banco
	@PostMapping("/{numero}/simular-pagamento")
	public PedidoResponse simularPagamento(@AuthenticationPrincipal Jwt token, @PathVariable String numero) {
		return pedidos.simularPagamentoPix(UsuarioLogado.id(token), numero);
	}
}
