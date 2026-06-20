-- Ejecutar si al reiniciar el backend la columna image_product sigue corta
USE goated_db;

ALTER TABLE products
  MODIFY COLUMN image_product TEXT,
  MODIFY COLUMN product_description TEXT;
