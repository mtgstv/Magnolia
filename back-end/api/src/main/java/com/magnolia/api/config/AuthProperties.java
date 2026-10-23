package com.magnolia.api.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

// Configurações "app.auth.*" do application.properties
@ConfigurationProperties("app.auth")
public record AuthProperties(
		// Chave que assina os JWT (mínimo de 32 caracteres)
		String segredoJwt,
		// Validade do token de acesso; quando vence, o front renova sozinho
		Duration duracaoAcesso,
		// Por quanto tempo o login fica salvo sem pedir a senha de novo
		Duration duracaoRenovacao,
		// true em produção (HTTPS): o navegador só envia o cookie por conexão segura
		boolean cookieSeguro) {
}
