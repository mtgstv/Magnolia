package com.magnolia.api.auth;

import java.nio.charset.StandardCharsets;
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

	// O BCrypt só aceita senhas de até 72 bytes, e letras com acento ocupam 2 bytes cada
	private static final int LIMITE_BYTES_SENHA = 72;

	// Hash de uma senha qualquer, conferido quando o e-mail não existe: assim o login demora
	// o mesmo tempo com ou sem conta, e o tempo de resposta não revela quem é cliente
	private String hashFalso;

	@Transactional
	public SessaoIniciada cadastrar(CadastroRequest dados) {
		if (senhaGrandeDemais(dados.senha())) {
			throw new ErroApiException(HttpStatus.BAD_REQUEST,
					"A senha é longa demais. Use até 72 caracteres (letras com acento contam como dois).");
		}

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
		// A mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta
		ErroApiException incorretos = new ErroApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos.");

		// Nenhuma conta tem senha tão grande (o cadastro barra), e o BCrypt daria erro com ela
		if (senhaGrandeDemais(dados.senha())) {
			throw incorretos;
		}

		Optional<Usuario> usuario = usuarios.findByEmail(normalizarEmail(dados.email()));
		String hash = usuario.map(Usuario::getSenhaHash).orElseGet(this::hashFalso);
		if (!senhas.matches(dados.senha(), hash) || usuario.isEmpty()) {
			throw incorretos;
		}

		return iniciarSessao(usuario.get());
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

	private String hashFalso() {
		if (hashFalso == null) {
			hashFalso = senhas.encode("senha-que-nenhuma-conta-usa");
		}
		return hashFalso;
	}

	private static boolean senhaGrandeDemais(String senha) {
		return senha.getBytes(StandardCharsets.UTF_8).length > LIMITE_BYTES_SENHA;
	}

	private static String normalizarEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static ErroApiException emailEmUso() {
		return new ErroApiException(HttpStatus.CONFLICT, "Já existe uma conta com este e-mail.");
	}
}
