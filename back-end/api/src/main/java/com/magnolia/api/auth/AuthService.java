package com.magnolia.api.auth;

import java.util.Locale;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.magnolia.api.auth.AuthDtos.CadastroRequest;
import com.magnolia.api.auth.AuthDtos.LoginRequest;
import com.magnolia.api.auth.AuthDtos.SessaoIniciada;
import com.magnolia.api.comum.ErroApiException;
import com.magnolia.api.usuario.Usuario;
import com.magnolia.api.usuario.UsuarioRepository;
import com.magnolia.api.usuario.UsuarioResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UsuarioRepository usuarios;
	private final PasswordEncoder senhas;
	private final TokenService tokens;

	@Transactional
	public SessaoIniciada cadastrar(CadastroRequest dados) {
		String email = normalizarEmail(dados.email());
		if (usuarios.existsByEmail(email)) {
			throw emailEmUso();
		}

		try {
			Usuario usuario = usuarios.save(new Usuario(dados.nome().trim(), email, senhas.encode(dados.senha())));
			return iniciarSessao(usuario);
		} catch (DataIntegrityViolationException e) {
			// Dois cadastros com o mesmo e-mail ao mesmo tempo: o UNIQUE do banco barra o segundo
			throw emailEmUso();
		}
	}

	@Transactional
	public SessaoIniciada entrar(LoginRequest dados) {
		Usuario usuario = usuarios.findByEmail(normalizarEmail(dados.email()))
				.filter(u -> senhas.matches(dados.senha(), u.getSenhaHash()))
				// A mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta
				.orElseThrow(() -> new ErroApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos."));

		return iniciarSessao(usuario);
	}

	// Vazio quando o token de renovação não existe ou já venceu
	@Transactional(readOnly = true)
	public Optional<SessaoIniciada> renovar(String tokenRenovacao) {
		return tokens.buscarUsuario(tokenRenovacao)
				.map(usuario -> new SessaoIniciada(UsuarioResponse.de(usuario), tokens.gerarTokenAcesso(usuario), null));
	}

	@Transactional
	public void sair(String tokenRenovacao) {
		tokens.revogar(tokenRenovacao);
	}

	private SessaoIniciada iniciarSessao(Usuario usuario) {
		return new SessaoIniciada(UsuarioResponse.de(usuario), tokens.gerarTokenAcesso(usuario),
				tokens.criarTokenRenovacao(usuario));
	}

	private static String normalizarEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static ErroApiException emailEmUso() {
		return new ErroApiException(HttpStatus.CONFLICT, "Já existe uma conta com este e-mail.");
	}
}
