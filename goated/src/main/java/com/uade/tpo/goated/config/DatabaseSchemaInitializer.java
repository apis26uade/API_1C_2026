package com.uade.tpo.goated.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Hibernate ddl-auto=update no cambia tipos de columnas ya creadas.
 * Asegura TEXT en URLs y descripciones de producto.
 */
@Component
@Order(1)
public class DatabaseSchemaInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE products MODIFY COLUMN image_product TEXT");
            jdbcTemplate.execute(
                    "ALTER TABLE products MODIFY COLUMN product_description TEXT");
            log.info("Columnas products.image_product y product_description verificadas como TEXT");
        } catch (Exception ex) {
            log.warn("No se pudieron ampliar columnas de products: {}", ex.getMessage());
        }
    }
}
