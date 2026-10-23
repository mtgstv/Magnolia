package com.magnolia.api.carrinho;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

// Os INSERT usam ON CONFLICT: dois cliques rápidos (ou duas abas) não criam sacolas nem itens repetidos
public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

	Optional<Carrinho> findByUsuarioId(Long usuarioId);

	Optional<Carrinho> findBySessaoId(String sessaoId);

	@Modifying
	@Query(value = "INSERT INTO carrinho (usuario_id) VALUES (:usuarioId) ON CONFLICT (usuario_id) DO NOTHING",
			nativeQuery = true)
	void criarDoUsuario(Long usuarioId);

	@Modifying
	@Query(value = "INSERT INTO carrinho (sessao_id) VALUES (:sessaoId) ON CONFLICT (sessao_id) DO NOTHING",
			nativeQuery = true)
	void criarDoVisitante(String sessaoId);

	// Soma à quantidade que já estava na sacola, sem passar do limite.
	// clearAutomatically: a próxima leitura do carrinho já enxerga o item novo.
	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query(value = """
			INSERT INTO item_carrinho (carrinho_id, variante_id, quantidade)
			VALUES (:carrinhoId, :varianteId, LEAST(:quantidade, :limite))
			ON CONFLICT (carrinho_id, variante_id)
			DO UPDATE SET quantidade = LEAST(item_carrinho.quantidade + EXCLUDED.quantidade, :limite)
			""", nativeQuery = true)
	void adicionarItem(Long carrinhoId, Long varianteId, int quantidade, int limite);
}
