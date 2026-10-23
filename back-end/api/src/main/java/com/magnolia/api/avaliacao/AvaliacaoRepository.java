package com.magnolia.api.avaliacao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

	@EntityGraph(attributePaths = "usuario")
	List<Avaliacao> findByProdutoIdOrderByCriadoEmDesc(Long produtoId);

	Optional<Avaliacao> findByProdutoIdAndUsuarioId(Long produtoId, Long usuarioId);
}
