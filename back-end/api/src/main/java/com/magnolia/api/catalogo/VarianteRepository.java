package com.magnolia.api.catalogo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface VarianteRepository extends JpaRepository<Variante, Long> {

	// Tira do estoque só se ainda houver o suficiente. Devolve 0 quando não há: assim duas compras
	// ao mesmo tempo nunca vendem a mesma última unidade (o banco faz a conta e a checagem juntas).
	@Modifying
	@Query("update Variante v set v.estoque = v.estoque - :quantidade where v.id = :id and v.estoque >= :quantidade")
	int baixarEstoque(Long id, int quantidade);

	boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

	boolean existsBySkuIgnoreCase(String sku);
}
