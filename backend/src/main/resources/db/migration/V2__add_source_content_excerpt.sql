-- V2__add_source_content_excerpt.sql
-- Adds the content_excerpt column used by the evidence comparison engine.
-- Idempotent: MySQL has no "ADD COLUMN IF NOT EXISTS", so guard via information_schema.
-- This also keeps existing deployments safe when Hibernate (ddl-auto: update)
-- has already created the column from the entity mapping.

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'sources'
      AND column_name = 'content_excerpt'
);

SET @ddl = IF(@col_exists = 0,
              'ALTER TABLE sources ADD COLUMN content_excerpt TEXT NULL AFTER retrieved_at',
              'SELECT 1');

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
