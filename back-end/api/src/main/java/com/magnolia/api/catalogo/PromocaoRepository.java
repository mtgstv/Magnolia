package com.magnolia.api.catalogo;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PromocaoRepository extends JpaRepository<Promocao, Long> {

	@Query("select p from Promocao p where p.inicio <= :agora and p.fim > :agora order by p.ordem")
	List<Promocao> findAtivas(Instant agora);
}
