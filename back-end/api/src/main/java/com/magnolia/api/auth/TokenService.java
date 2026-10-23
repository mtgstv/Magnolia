package com.magnolia.api.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.magnolia.api.config.AuthProperties;
import com.magnolia.api.usuario.Usuario;

import lombok.RequiredArgsConstructor;

// Dois tokens por login:
// - acesso: JWT curto (15 min) enviado em toda requisição; a API confere sem ir ao banco.
// - renovação: valor aleatório (7 dias) que só serve para pedir um novo token de acesso.
@Service
@RequiredArgsConstructor
public class TokenService {

	private static final SecureRandom ALEATORIO = new SecureRandom();

	private final JwtEncoder jwtEncoder;
	private final TokenRenovacaoRepository tokens;
	private final AuthProperties auth;

	public String gerarTokenAcesso(Usuario usuario) {
		Instant agora = Instant.now();
		JwtClaimsSet dados = JwtClaimsSet.builder()
				.issuer("magnolia-api")
				.issuedAt(agora)
				.expiresAt(agora.plus(auth.duracaoAcesso()))
				.subject(usuario.getId().toString())
				.claim("papel", usuario.getPapel().name())
				.build();

		JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(cabecalho, dados)).getTokenValue();
	}

	// Chamar dentro de uma transação
	public String criarTokenRenovacao(Usuario usuario) {
		Instant agora = Instant.now();
		tokens.deleteByUsuarioIdAndExpiraEmBefore(usuario.getId(), agora);

		byte[] bytes = new byte[32];
		ALEATORIO.nextBytes(bytes);
		String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

		tokens.save(new TokenRenovacao(usuario, hash(token), agora.plus(auth.duracaoRenovacao())));
		return token;
	}

	public Optional<Usuario> buscarUsuario(String tokenRenovacao) {
		return tokens.findByTokenHash(hash(tokenRenovacao))
				.filter(token -> token.getExpiraEm().isAfter(Instant.now()))
				.map(TokenRenovacao::getUsuario);
	}

	// Chamar dentro de uma transação
	public void revogar(String tokenRenovacao) {
		tokens.deleteByTokenHash(hash(tokenRenovacao));
	}

	public static String hash(String token) {
		try {
			byte[] resumo = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(resumo);
		} catch (NoSuchAlgorithmException e) {
			// Todo Java tem SHA-256; só chega aqui se a JVM estiver quebrada
			throw new IllegalStateException(e);
		}
	}
}
