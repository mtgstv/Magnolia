package com.magnolia.api.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.magnolia.api.admin.AdminDtos.AtivoRequest;
import com.magnolia.api.admin.AdminDtos.MarcaRequest;
import com.magnolia.api.admin.AdminDtos.ProdutoRequest;
import com.magnolia.api.admin.AdminDtos.ProdutoResponse;
import com.magnolia.api.admin.AdminDtos.PromocaoRequest;
import com.magnolia.api.admin.AdminDtos.PromocaoResponse;
import com.magnolia.api.avaliacao.AvaliacaoService;
import com.magnolia.api.catalogo.CatalogoRespostas.MarcaResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Painel admin: só para contas com papel ADMIN (ver SecurityConfig)
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService admin;
	private final AvaliacaoService avaliacoes;

	@GetMapping("/produtos")
	public List<ProdutoResponse> listarProdutos() {
		return admin.listarProdutos();
	}

	@GetMapping("/produtos/{id}")
	public ProdutoResponse buscarProduto(@PathVariable Long id) {
		return admin.buscarProduto(id);
	}

	@PostMapping("/produtos")
	@ResponseStatus(HttpStatus.CREATED)
	public ProdutoResponse criarProduto(@Valid @RequestBody ProdutoRequest dados) {
		return admin.criarProduto(dados);
	}

	@PutMapping("/produtos/{id}")
	public ProdutoResponse atualizarProduto(@PathVariable Long id, @Valid @RequestBody ProdutoRequest dados) {
		return admin.atualizarProduto(id, dados);
	}

	@PatchMapping("/produtos/{id}/ativo")
	public ProdutoResponse alterarAtivo(@PathVariable Long id, @RequestBody AtivoRequest dados) {
		return admin.alterarAtivo(id, dados.ativo());
	}

	@PostMapping("/marcas")
	@ResponseStatus(HttpStatus.CREATED)
	public MarcaResponse criarMarca(@Valid @RequestBody MarcaRequest dados) {
		return admin.criarMarca(dados);
	}

	@GetMapping("/promocoes")
	public List<PromocaoResponse> listarPromocoes() {
		return admin.listarPromocoes();
	}

	@PostMapping("/promocoes")
	@ResponseStatus(HttpStatus.CREATED)
	public PromocaoResponse criarPromocao(@Valid @RequestBody PromocaoRequest dados) {
		return admin.criarPromocao(dados);
	}

	@PutMapping("/promocoes/{id}")
	public PromocaoResponse atualizarPromocao(@PathVariable Long id, @Valid @RequestBody PromocaoRequest dados) {
		return admin.atualizarPromocao(id, dados);
	}

	@DeleteMapping("/promocoes/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void removerPromocao(@PathVariable Long id) {
		admin.removerPromocao(id);
	}

	// Apaga uma avaliação ofensiva ou spam
	@DeleteMapping("/avaliacoes/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void removerAvaliacao(@PathVariable Long id) {
		avaliacoes.removerComoAdmin(id);
	}
}
