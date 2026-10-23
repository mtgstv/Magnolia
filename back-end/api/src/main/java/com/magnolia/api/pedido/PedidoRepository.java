package com.magnolia.api.pedido;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

	List<Pedido> findByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);

	Optional<Pedido> findByNumeroAndUsuarioId(String numero, Long usuarioId);

	boolean existsByNumero(String numero);

	boolean existsByUsuarioIdAndStatusNot(Long usuarioId, StatusPedido status);

	// Quem comprou (e pagou) este perfume: usado no selo "Compra verificada" das avaliações
	@Query("""
			select distinct p.usuarioId from Pedido p join p.itens i
			where i.variante.produto.id = :produtoId and p.status in :status
			""")
	List<Long> compradoresDoProduto(Long produtoId, Collection<StatusPedido> status);
}
