package com.magnolia.api.catalogo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

// Variantes e imagens são carregadas em lote (hibernate.default_batch_fetch_size),
// sem uma consulta extra por produto
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

	@EntityGraph(attributePaths = { "marca", "categoria" })
	List<Produto> findByAtivoTrueOrderByCriadoEmDesc();

	@EntityGraph(attributePaths = { "marca", "categoria" })
	Optional<Produto> findBySlugAndAtivoTrue(String slug);

	Optional<Produto> findByIdAndAtivoTrue(Long id);
}
