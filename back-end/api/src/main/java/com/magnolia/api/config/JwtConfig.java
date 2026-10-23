package com.magnolia.api.config;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

// A própria API assina (encoder) e confere (decoder) os tokens com a mesma chave HMAC
@Configuration
public class JwtConfig {

	@Bean
	SecretKey chaveJwt(AuthProperties auth) {
		byte[] chave = auth.segredoJwt().getBytes(StandardCharsets.UTF_8);
		if (chave.length < 32) {
			throw new IllegalStateException("app.auth.segredo-jwt precisa ter pelo menos 32 caracteres.");
		}
		return new SecretKeySpec(chave, "HmacSHA256");
	}

	@Bean
	JwtEncoder jwtEncoder(SecretKey chaveJwt) {
		return new NimbusJwtEncoder(new ImmutableSecret<>(chaveJwt));
	}

	@Bean
	JwtDecoder jwtDecoder(SecretKey chaveJwt) {
		return NimbusJwtDecoder.withSecretKey(chaveJwt).macAlgorithm(MacAlgorithm.HS256).build();
	}
}
