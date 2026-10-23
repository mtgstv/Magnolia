package com.magnolia.api.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.magnolia.api.auth.CookiesDeSessao;

import jakarta.servlet.http.Cookie;

@Configuration
public class SecurityConfig {

	// Os caminhos abaixo não incluem o /api/v1 (context-path)
	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.cors(Customizer.withDefaults())
			// O cookie de login é SameSite=Lax e a API só recebe JSON de origens liberadas no CORS,
			// então a proteção CSRF do Spring (pensada para formulários HTML) fica desligada
			.csrf(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable)
			.logout(AbstractHttpConfigurer::disable)
			.sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(rotas -> rotas
				// Catálogo é público
				.requestMatchers(HttpMethod.GET, "/produtos/**", "/categorias/**", "/marcas/**", "/promocoes/**").permitAll()
				.requestMatchers("/auth/**").permitAll()
				// Visitante também tem carrinho (identificado pela sessao_id)
				.requestMatchers("/carrinho/**").permitAll()
				.requestMatchers("/error").permitAll()
				// Perfil, favoritos, endereços e pedidos exigem login
				.anyRequest().authenticated())
			.oauth2ResourceServer(servidor -> servidor
				.bearerTokenResolver(tokenDoCookie())
				.jwt(jwt -> jwt.jwtAuthenticationConverter(papelDoToken())));

		return http.build();
	}

	// Lê o token de acesso do cookie HttpOnly (ou do cabeçalho Authorization, útil para testar a API)
	private static BearerTokenResolver tokenDoCookie() {
		DefaultBearerTokenResolver cabecalho = new DefaultBearerTokenResolver();

		return requisicao -> {
			// /auth não precisa de token; um cookie vencido ali impediria justamente a renovação
			String caminho = requisicao.getRequestURI().substring(requisicao.getContextPath().length());
			if (caminho.startsWith("/auth/")) {
				return null;
			}
			if (requisicao.getCookies() != null) {
				for (Cookie cookie : requisicao.getCookies()) {
					if (CookiesDeSessao.ACESSO.equals(cookie.getName()) && !cookie.getValue().isBlank()) {
						return cookie.getValue();
					}
				}
			}
			return cabecalho.resolve(requisicao);
		};
	}

	// Transforma a claim "papel" do token (CLIENTE/ADMIN) em ROLE_CLIENTE/ROLE_ADMIN
	private static JwtAuthenticationConverter papelDoToken() {
		JwtGrantedAuthoritiesConverter papeis = new JwtGrantedAuthoritiesConverter();
		papeis.setAuthoritiesClaimName("papel");
		papeis.setAuthorityPrefix("ROLE_");

		JwtAuthenticationConverter conversor = new JwtAuthenticationConverter();
		conversor.setJwtGrantedAuthoritiesConverter(papeis);
		return conversor;
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(
			@Value("${app.cors.allowed-origins}") List<String> origensPermitidas) {
		CorsConfiguration cors = new CorsConfiguration();
		cors.setAllowedOrigins(origensPermitidas);
		cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		cors.setAllowedHeaders(List.of("Content-Type", "Authorization"));
		// Necessário para o front enviar cookies (credentials: "include")
		cors.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", cors);
		return source;
	}

	// Usado no cadastro/login para gerar e conferir o senha_hash
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
