package com.magnolia.api.catalogo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MarcaRepository extends JpaRepository<Marca, Long> {

	List<Marca> findAllByOrderByNomeAsc();
}
