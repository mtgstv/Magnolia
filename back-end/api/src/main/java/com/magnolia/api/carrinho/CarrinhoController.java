package com.magnolia.api.carrinho;

import java.util.List;
import java.util.function.Function;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.magnolia.api.carrinho.CarrinhoDtos.CarrinhoResponse;
import com.magnolia.api.carrinho.CarrinhoDtos.CupomRequest;
import com.magnolia.api.carrinho.CarrinhoDtos.NovoItemRequest;
import com.magnolia.api.carrinho.CarrinhoDtos.QuantidadeRequest;
import com.magnolia.api.carrinho.CarrinhoService.Dono;
import com.magnolia.api.usuario.UsuarioLogado;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// A sacola funciona com ou sem login (ver SecurityConfig).
// Logado: a sacola é da conta. Visitante: a sacola é achada pelo cookie magnolia_carrinho.
// Toda rota devolve a sacola inteira já atualizada, com os totais calculados aqui na API.
@RestController
@RequestMapping("/carrinho")
@RequiredArgsConstructor
public class CarrinhoController {

	private final CarrinhoService carrinho;
	private final CookieCarrinho cookie;

	@GetMapping
	public ResponseEntity<CarrinhoResponse> ver(@AuthenticationPrincipal Jwt token,
			@CookieValue(name = CookieCarrinho.NOME, required = false) String visitante) {
		return responder(token, visitante, false, carrinho::ver);
	}

	@PostMapping("/itens")
	public ResponseEntity<CarrinhoResponse> adicionar(@AuthenticationPrincipal Jwt token,
			@CookieValue(name = CookieCarrinho.NOME, required = false) String visitante,
			@Valid @RequestBody NovoItemRequest dados) {
		int quantidade = dados.quantidade() == null ? 1 : dados.quantidade();
		return responder(token, visitante, true, dono -> carrinho.adicionar(dono, dados.varianteId(), quantidade));
	}

	@PatchMapping("/itens/{varianteId}")
	public ResponseEntity<CarrinhoResponse> alterarQuantidade(@AuthenticationPrincipal Jwt token,
			@CookieValue(name = CookieCarrinho.NOME, required = false) String visitante,
			@PathVariable Long varianteId, @Valid @RequestBody QuantidadeRequest dados) {
		return responder(token, visitante, false, dono -> carrinho.alterarQuantidade(dono, varianteId, dados.quantidade()));
	}

	@DeleteMapping("/itens/{varianteId}")
	public ResponseEntity<CarrinhoResponse> remover(@AuthenticationPrincipal Jwt token,
			@CookieValue(name = CookieCarrinho.NOME, required = false) String visitante, @PathVariable Long varianteId) {
		return responder(token, visitante, false, dono -> carrinho.remover(dono, varianteId));
	}

	@PostMapping("/cupom")
	public ResponseEntity<CarrinhoResponse> aplicarCupom(@AuthenticationPrincipal Jwt token,
			@CookieValue(name = CookieCarrinho.NOME, required = false) String visitante,
			@Valid @RequestBody CupomRequest dados) {
		return responder(token, visitante, false, dono -> carrinho.aplicarCupom(dono, dados.codigo()));
	}

	@DeleteMapping("/cupom")
	public ResponseEntity<CarrinhoResponse> removerCupom(@AuthenticationPrincipal Jwt token,
			@CookieValue(name = CookieCarrinho.NOME, required = false) String visitante) {
		return responder(token, visitante, false, carrinho::removerCupom);
	}

	// Opções de entrega para um CEP, com base no valor da sacola (ex.: GET /carrinho/frete?cep=01310100)
	@GetMapping("/frete")
	public ResponseEntity<List<Frete.Opcao>> frete(@AuthenticationPrincipal Jwt token,
			@CookieValue(name = CookieCarrinho.NOME, required = false) String visitante, @RequestParam String cep) {
		return responder(token, visitante, false, dono -> carrinho.opcoesDeFrete(dono, cep));
	}

	// Descobre de quem é a sacola e cuida do cookie do visitante:
	// - logado com cookie de visitante: junta as duas sacolas e apaga o cookie;
	// - visitante sem cookie: cria um quando a sacola passa a existir (criarSacola = true).
	private <T> ResponseEntity<T> responder(Jwt token, String visitante, boolean criarSacola, Function<Dono, T> acao) {
		HttpHeaders cabecalhos = new HttpHeaders();
		boolean temCookie = CookieCarrinho.valido(visitante);
		Dono dono;

		if (token != null) {
			Long usuarioId = UsuarioLogado.id(token);
			if (temCookie) {
				carrinho.juntarSacolaDoVisitante(usuarioId, visitante);
				cabecalhos.add(HttpHeaders.SET_COOKIE, cookie.limpar());
			}
			dono = Dono.usuario(usuarioId);
		} else if (temCookie) {
			dono = Dono.visitante(visitante);
		} else if (criarSacola) {
			String novo = CookieCarrinho.novoToken();
			cabecalhos.add(HttpHeaders.SET_COOKIE, cookie.criar(novo));
			dono = Dono.visitante(novo);
		} else {
			dono = Dono.visitante(null);
		}

		return ResponseEntity.ok().headers(cabecalhos).body(acao.apply(dono));
	}
}
