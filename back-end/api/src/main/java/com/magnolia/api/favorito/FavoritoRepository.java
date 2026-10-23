package com.magnolia.api.favorito;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

	@EntityGraph(attributePaths = { "produto", "produto.marca", "produto.categoria" })
	List<Favorito> findByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);

	// ON CONFLICT: favoritar duas vezes (ex.: clique duplo) não dá erro nem duplica
	@Modifying
	@Query(value = """
			INSERT INTO favorito (usuario_id, produto_id) VALUES (:usuarioId, :produtoId)
			ON CONFLICT (usuario_id, produto_id) DO NOTHING
			""", nativeQuery = true)
	void adicionar(Long usuarioId, Long produtoId);

	@Modifying
	@Query("delete from Favorito f where f.usuario.id = :usuarioId and f.produto.id = :produtoId")
	void remover(Long usuarioId, Long produtoId);
}
