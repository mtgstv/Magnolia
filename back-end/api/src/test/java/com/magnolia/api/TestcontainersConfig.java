package com.magnolia.api;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;

// Os testes usam um Postgres próprio, sem depender do docker compose estar rodando
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

	@Bean
	@ServiceConnection
	PostgreSQLContainer postgres() {
		return new PostgreSQLContainer("postgres:17");
	}
}
