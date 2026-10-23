package com.magnolia.api.auth;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenRenovacaoRepository extends JpaRepository<TokenRenovacao, Long> {

	@EntityGraph(attributePaths = "usuario")
	Optional<TokenRenovacao> findByTokenHash(String tokenHash);

	void deleteByTokenHash(String tokenHash);

	void deleteByUsuarioIdAndExpiraEmBefore(Long usuarioId, Instant data);
}
