package com.magnolia.api.auth;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.magnolia.api.config.AuthProperties;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Limita login e cadastro a N tentativas por IP em cada janela (ex.: 10 por minuto),
// para que um robô não consiga testar milhares de senhas ou criar contas em massa.
// Os contadores ficam na memória: bastam para um servidor só e zeram quando a API reinicia.
@Component
public class LimiteDeTentativas extends OncePerRequestFilter {

	private static final Set<String> ROTAS_LIMITADAS = Set.of("/auth/login", "/auth/cadastro");
	// Acima disso, aproveita a requisição para apagar as janelas que já venceram
	private static final int LIMPAR_ACIMA_DE = 10_000;

	private record Janela(Instant fim, int tentativas) {
	}

	private final Map<String, Janela> janelas = new ConcurrentHashMap<>();
	private final AuthProperties auth;

	public LimiteDeTentativas(AuthProperties auth) {
		this.auth = auth;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest requisicao) {
		String caminho = requisicao.getRequestURI().substring(requisicao.getContextPath().length());
		return !"POST".equals(requisicao.getMethod()) || !ROTAS_LIMITADAS.contains(caminho);
	}

	@Override
	protected void doFilterInternal(HttpServletRequest requisicao, HttpServletResponse resposta, FilterChain cadeia)
			throws ServletException, IOException {
		Instant agora = Instant.now();
		if (janelas.size() > LIMPAR_ACIMA_DE) {
			janelas.values().removeIf(janela -> janela.fim().isBefore(agora));
		}

		// Atrás de um proxy (ex.: Nginx), configure server.forward-headers-strategy para o IP real chegar aqui
		Janela janela = janelas.compute(requisicao.getRemoteAddr(), (ip, atual) -> atual == null || atual.fim().isBefore(agora)
				? new Janela(agora.plus(auth.janelaTentativas()), 1)
				: new Janela(atual.fim(), atual.tentativas() + 1));

		if (janela.tentativas() > auth.limiteTentativas()) {
			long segundos = Math.max(1, janela.fim().getEpochSecond() - agora.getEpochSecond());
			resposta.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
			resposta.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(segundos));
			resposta.setContentType(MediaType.APPLICATION_JSON_VALUE);
			resposta.setCharacterEncoding("UTF-8");
			// Mesmo formato do ErroResponse, que o front-end já sabe mostrar
			resposta.getWriter().write("{\"message\":\"Muitas tentativas seguidas. Aguarde um minuto e tente novamente.\"}");
			return;
		}

		cadeia.doFilter(requisicao, resposta);
	}
}
