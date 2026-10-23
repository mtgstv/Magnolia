package com.magnolia.api.carrinho;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CupomRepository extends JpaRepository<Cupom, Long> {

	Optional<Cupom> findByCodigoIgnoreCase(String codigo);

	@Modifying
	@Query("update Cupom c set c.usos = c.usos + 1 where c.id = :id")
	void registrarUso(Long id);
}
